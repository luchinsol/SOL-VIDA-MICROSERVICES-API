import axios from "axios";
import redisClient from "../index.js";
import amqp from "amqplib";
import * as turf from "@turf/turf";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
dotenv.config();

const service_ubicacion = process.env.MICRO_UBICACION;
const service_pedido = process.env.MICRO_PEDIDO;
const service_almacen = process.env.MICRO_ALMACEN;
const service_producto = process.env.MICRO_PRODUCTO;
const service_zonaproducto = process.env.MICRO_ZONAPRODUCTO;
const service_zonapromocion = process.env.MICRO_ZONAPROMOCION;
const service_cliente = process.env.MICRO_CLIENTE;
const service_conductor = process.env.MICRO_CONDUCTOR;
const MAIN_QUEUE = "micro_pedidos";
//const RABBITMQ_URL = 'amqp://localhost'; // Cambia esta URL si RabbitMQ está en otro host
const RABBITMQ_URL = process.env.RABBITMQ_URL;

const sendToQueue = async (pedido) => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    const msg = JSON.stringify(pedido); // Convertir el pedido a JSON

    // Asegurarse de que la cola exista

    channel.sendToQueue(MAIN_QUEUE, Buffer.from(msg), {
      persistent: true,
    });

    console.log("Pedido enviado a la cola:", pedido);

    // Cerramos la conexión
    await channel.close();
    await connection.close();
  } catch (error) {
    console.error(
      "Error al enviar el pedido a la cola de RabbitMQ:",
      error.message
    );
  }
};

export const getPedidoHistoryConductorControllerGW = async (req, res) => {
  try {
    const { id, fecha } = req.params;
    console.log("......dentro de ");

    // 1️⃣ Obtener historial de pedidos
    const response = await axios
      .get(`${service_pedido}/pedido_history/${id}/${fecha}`)
      .catch((error) => {
        if (error.response) {
          console.log("Error en la respuesta:", error.response.status);
           
        } else {
          console.log("Error en la solicitud:", error.message);
        }
        return null; // Retorna null para manejar el error sin romper la ejecución
      });

    if (!response || !response.data || response.data.length === 0) {
      return res.status(404).json({ message: "Pedidos no encontrados" });
    }

  

    const pedidos = response.data;

    // 2️⃣ Obtener información de los clientes (IDs únicos)
    const clienteIds = [...new Set(pedidos.map((p) => p.cliente))];
    const clienteRequests = clienteIds.map((cid) =>
      axios.get(`${service_cliente}/cliente/${cid}`)
    );

    const clienteResponses = await Promise.all(clienteRequests);

    const clientes = clienteResponses.reduce((acc, res) => {
      acc[res.data.id] = res.data.nombre; // Guardamos en un diccionario { id: nombre }
      return acc;
    }, {});

    // 3️⃣ Obtener detalles de productos en paralelo
    const productIds = [
      ...new Set(
        pedidos.flatMap((p) => p.detalles_pedido.map((d) => d.producto_id))
      ),
    ];
    const productRequests = productIds.map((pid) =>
      axios.get(`${service_producto}/producto/${pid}`)
    );

    const productResponses = await Promise.all(productRequests);

    const productos = productResponses.reduce((acc, res) => {
      acc[res.data.id] = res.data.nombre; // Guardamos en un diccionario { id: nombre }
      return acc;
    }, {});

    // 4️⃣ Obtener detalles de promociones en paralelo
    const promoIds = [
      ...new Set(
        pedidos.flatMap((p) =>
          p.detalles_pedido
            .map((d) => d.promocion_id)
            .filter((pid) => pid !== null)
        )
      ),
    ];
    const promoRequests = promoIds.map((pid) =>
      axios.get(`${service_producto}/promocion/${pid}`)
    );

    const promoResponses = await Promise.all(promoRequests);

    const promociones = promoResponses.reduce((acc, res) => {
      acc[res.data.id] = res.data.nombre; // Guardamos en un diccionario { id: nombre }
      return acc;
    }, {});

    // 5️⃣ Obtener ubicaciones en paralelo
    const ubicacionIds = [
      ...new Set(pedidos.map((p) => p.ubicacion).filter((uid) => uid !== null)),
    ];
    const ubicacionRequests = ubicacionIds.map((uid) =>
      axios.get(`${service_ubicacion}/ubicacion/${uid}`)
    );

    const ubicacionResponses = await Promise.all(ubicacionRequests);

    const ubicaciones = ubicacionResponses.reduce((acc, res) => {
      acc[res.data.id] = res.data; // Guardamos el objeto de la ubicación
      return acc;
    }, {});

    // 6️⃣ Construir respuesta final con nombres de productos, clientes, promociones y ubicaciones
    const pedidosCompletos = pedidos.map((pedido) => ({
      ...pedido,
      cliente_nombre: clientes[pedido.cliente] || "Desconocido",
      ubicacion: ubicaciones[pedido.ubicacion] || null, // Agregamos la ubicación
      detalles_pedido: pedido.detalles_pedido.map((detalle) => ({
        ...detalle,
        producto_nombre: detalle.promocion_id
          ? promociones[detalle.promocion_id] || "Promoción desconocida"
          : productos[detalle.producto_id] || "Producto desconocido",
      })),
    }));

    res.status(200).json(pedidosCompletos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPedidosControllerGW = async (req, res) => {
  console.log("......get pedido controller");
  const cacheKey = "pedidos_cache";
  try {
    console.log("........Intentando obtener datos de Redis");

    // Intentar obtener datos de Redis con manejo de errores
    let cachedData;
    try {
      cachedData = await redisClient.get(cacheKey);
      console.log("Datos de caché:", cachedData);
    } catch (redisError) {
      console.error("Error al obtener datos de Redis:", redisError.message);
    }

    // Si hay datos en caché, devolverlos
    if (cachedData) {
      return res.status(200).json(JSON.parse(cachedData));
    }

    // Si no hay datos en caché, hacer la solicitud a la API
    const response = await axios.get(`${service_pedido}/pedido`);
    console.log("Respuesta de la API de pedidos:", response.data);

    if (response && response.data) {
      // Guardar en caché los datos de respuesta (opcional si Redis funciona)
      try {
        await redisClient.setEx(cacheKey, 3600, JSON.stringify(response.data));
      } catch (redisSetError) {
        console.error(
          "Error al guardar datos en Redis:",
          redisSetError.message
        );
      }
      res.status(200).json(response.data);
    } else {
      res.status(404).json({ message: "Not Found" });
    }
  } catch (error) {
    console.error("Error al obtener pedidos:", error.message);
    res.status(500).send("Error fetching orders");
  }
};

export const postInfoPedido = async (req, res) => {
  try {
    const {
      cliente_id,
      subtotal,
      descuento,
      total,
      fecha,
      tipo,
      estado,
      observacion,
      tipo_pago,
      ubicacion_id,
      detalles,
    } = req.body;

    let latitud,
      longitud,
      id,
      departamento,
      provincia,
      distrito,
      direccion,
      cliente,
      zonaTrabajo;
    try {
      const ubicacionRes = await axios.get(
        `${service_ubicacion}/ubicacion/${ubicacion_id}`
      );
      //console.log(ubicacionRes.data);
      id = ubicacionRes.data.id;
      latitud = ubicacionRes.data.latitud;
      longitud = ubicacionRes.data.longitud;
      departamento = ubicacionRes.data.departamento;
      provincia = ubicacionRes.data.provincia;
      distrito = ubicacionRes.data.distrito;
      direccion = ubicacionRes.data.direccion;
      cliente = ubicacionRes.data.cliente_id;
      zonaTrabajo = ubicacionRes.data.zona_trabajo_id;

      if (!latitud || !longitud) {
        return res.status(400).json({ message: "Coordenadas no disponibles" });
      }
    } catch (error) {
      return res.status(404).json({ message: "Ubicación no encontrada" });
    }

    const [responseZona, responseAlmacen, resultado] = await Promise.all([
      axios.get(`${service_ubicacion}/zona`),
      axios.get(`${service_almacen}/almacen`),
      axios.post(`${service_pedido}/pedido`, {
        cliente_id,
        subtotal,
        descuento,
        total,
        fecha,
        tipo,
        estado,
        observacion,
        tipo_pago,
        ubicacion_id,
      }),
    ]);

    const warehouseRegions = processWarehouseRegions(responseZona.data);
    const warehouses = processWarehouses(responseAlmacen.data);
    const coordinates = [Number(longitud), Number(latitud)];
    const analysis = analyzeLocation(warehouseRegions, coordinates, warehouses);

    if (!resultado.data) {
      return res.status(400).json({ message: "Invalid input data" });
    }

    const pedidoId = resultado.data.id;
    const clienteId = resultado.data.cliente_id;
    const regionId = analysis.region.warehouseId;
    const almacenId = analysis.nearestWarehouse.id;
    const almacenes = analysis.nearestWarehouseIds;

    // Process each order detail
    const detallesProcessed = await Promise.all(
      detalles.map(async (detalle) => {
        const { producto_id, cantidad, promocion_id } = detalle;

        // Fetch product and promotion info in parallel
        const [productoInfo, promocionInfo, cantidadPromos] = await Promise.all(
          [
            axios.get(`${service_producto}/producto/${producto_id}`),
            promocion_id
              ? axios.get(`${service_producto}/promocion/${promocion_id}`)
              : Promise.resolve(null),
            promocion_id
              ? axios.get(
                  `${service_producto}/cantidadprod/${promocion_id}/${producto_id}`
                )
              : Promise.resolve(null),
          ]
        );

        // Calculate price based on promotion
        const precio = await axios.get(
          promocion_id
            ? `${service_zonaproducto}/precioZonaProducto/${regionId}/${promocion_id}`
            : `${service_zonapromocion}/preciopromo/${regionId}/${producto_id}`
        );

        const precioFinal = precio.data.precio;
        const descuento_inicial = precio.data.descuento;
        const precioTotalAPagar = precioFinal - descuento_inicial;
        const pagoFinalARealizar = precioTotalAPagar * cantidad;
        const cantidadProductosPorPromo = cantidadPromos?.data?.cantidad;
        const cantidadProductos = cantidadProductosPorPromo * cantidad;

        // Create detail record
        await axios.post(`${service_pedido}/det_pedido`, {
          pedido_id: pedidoId,
          producto_id,
          cantidad,
          promocion_id,
        });

        // Return structured data based on whether it's a promotion or regular product
        if (promocion_id) {
          return {
            id: promocion_id,
            nombre: promocionInfo.data.nombre,
            descripcion: promocionInfo.data.descripcion,
            foto: promocionInfo.data.foto,
            valoracion: promocionInfo.data.valoracion,
            categoria: promocionInfo.data.categoria,
            precio: precioFinal,
            descuento: descuento_inicial,
            total: precioTotalAPagar,
            cantidad: cantidad,
            subtotal: pagoFinalARealizar,
            productos: [
              {
                id: productoInfo.data.id,
                nombre: productoInfo.data.nombre,
                descripcion: productoInfo.data.descripcion,
                foto: productoInfo.data.foto,
                valoracion: productoInfo.data.valoracion,
                categoria: productoInfo.data.categoria,
                precio: precioFinal,
                descuento: descuento_inicial,
                total: precioTotalAPagar,
                cantidad: cantidadProductosPorPromo,
                cantidadProductos: cantidadProductos,
              },
            ],
          };
        } else {
          return {
            id: producto_id,
            nombre: productoInfo.data.nombre,
            descripcion: productoInfo.data.descripcion,
            foto: productoInfo.data.foto,
            valoracion: productoInfo.data.valoracion,
            categoria: productoInfo.data.categoria,
            //cantidad: cantidad,
            //cantidad_final: cantidad,
            precio: precioFinal,
            descuento: descuento_inicial,
            subtotal: precioTotalAPagar,
            cantidad: cantidad,
            total: pagoFinalARealizar,
          };
        }
      })
    );

    // Update warehouse and zone
    await Promise.all([
      axios.put(`${service_pedido}/pedido_almacen/${pedidoId}`, {
        almacen_id: almacenId,
      }),
      axios.put(`${service_ubicacion}/ubicacion/${ubicacion_id}`, {
        zona_trabajo_id: regionId,
      }),
    ]);

    // Separate items into promotions and products
    const { promociones, productos } = detallesProcessed.reduce(
      (acc, item) => {
        if ("productos" in item) {
          acc.promociones.push(item);
        } else {
          acc.productos.push(item);
        }
        return acc;
      },
      { promociones: [], productos: [] }
    );

    const subTotal = detallesProcessed.reduce(
      (sum, detail) => sum + detail.subtotal,
      0
    );
    const descuentoCupon = resultado.data.descuento;
    const precioFinal = subTotal - descuentoCupon;

    await axios.put(`${service_pedido}/pedido_precio/${pedidoId}`, {
      subtotal: subTotal,
      total: precioFinal,
    });

    async function fetchWarehouseEvents(warehouseIds) {
      try {
        const eventPromises = warehouseIds.map((id) =>
          axios
            .get(`${service_conductor}/eventos/${id}`)
            .then((response) => ({
              almacen_id: id,
              nombre_evento: response.data.nombre,
            }))
            .catch((error) => ({
              almacen_id: id,
              nombre_evento: null,
              error: "Event not found",
            }))
        );
        return await Promise.all(eventPromises);
      } catch (error) {
        console.error("Error fetching warehouse events:", error);
        return [];
      }
    }

    const cliente_completo = await axios.get(
      `${service_cliente}/cliente/${clienteId}`
    );
    const data_cliente = cliente_completo.data;

    const warehouseEvents = await fetchWarehouseEvents(almacenes);

    const pedido_completo = await axios.get(
      `${service_pedido}/pedido/${pedidoId}`
    );
    const data_pedido = pedido_completo.data;

    const response = {
      id: pedidoId,
      ubicacion: {
        id,
        latitud,
        longitud,
        departamento,
        provincia,
        distrito,
        direccion,
        cliente,
        zonaTrabajo,
      },
      detalles: {
        promociones,
        productos,
      },
      region_id: regionId,
      almacen_id: almacenId,
      subtotal: subTotal,
      descuento: descuentoCupon,
      total: precioFinal,
      AlmacenesPendientes: almacenes.map((id) => {
        const eventInfo = warehouseEvents.find(
          (event) => event.almacen_id === id
        );
        return {
          id,
          nombre_evento: eventInfo ? eventInfo.nombre_evento : null,
        };
      }),
      Cliente: data_cliente,
      emitted_time: new Date().toISOString(), // Add emission time
      expired_time: new Date(
        new Date().getTime() + 1 * 60 * 1000
      ).toISOString(),
      pedidoinfo: data_pedido,
    };

    /*
        socket.emit('new_order', {
            ...orderData,
            emitted_time: new Date().toISOString(),
            timeout_duration: 30
        })


        socket.on('order_timeout', async (data) => {
            try {
                const { orderId } = data;
                
                // Remove from current queue
                await channel.ack(data.message);
                
                // Update order status in archive
                await axios.put(`${service_pedido}/pedido/${orderId}`, {
                    estado: 'rejected_timeout'
                });
                
                // Notify all clients about the order removal
                socket.broadcast.emit('order_removed', {
                    orderId,
                    reason: 'timeout'
                });
                
                // Re-emit all active orders to ensure synchronization
                const activeOrders = await axios.get(`${service_pedido}/pedido`);
                socket.broadcast.emit('sync_update', activeOrders.data);
            } catch (error) {
                console.error('Error handling order timeout:', error);
            }
        });
        */

    await sendToQueue(response);
    res.status(201).json(response);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Error procesando la solicitud",
      error: error.message,
    });
  }
};

const processWarehouseRegions = (zonas) => {
  return zonas
    .map((zona) => {
      try {
        let processedCoordinates = zona.poligono_coordenadas;

        if (
          !Array.isArray(processedCoordinates) ||
          !processedCoordinates.every(
            (coord) =>
              Array.isArray(coord) &&
              coord.length === 2 &&
              typeof coord[0] === "number" &&
              typeof coord[1] === "number"
          )
        ) {
          throw new Error(
            `Formato inválido de coordenadas para zona ${zona.id}`
          );
        }

        return {
          warehouseId: zona.id,
          name: zona.nombre,
          polygon: {
            type: "Feature",
            properties: {
              id: zona.id,
              name: zona.nombre,
            },
            geometry: {
              type: "Polygon",
              coordinates: [processedCoordinates],
            },
          },
        };
      } catch (error) {
        console.error(`Error procesando zona ${zona.id}:`, error);
        return null;
      }
    })
    .filter((region) => region !== null);
};

const processWarehouses = (almacenes) => {
  return almacenes.map((almacen) => ({
    id: almacen.id,
    name: almacen.nombre,
    location: [Number(almacen.longitud), Number(almacen.latitud)],
    departamento: almacen.departamento,
  }));
};

function analyzeLocation(warehouseRegions, coordinates, warehouses) {
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
    throw new Error("Formato de coordenadas inválido");
  }

  const point = turf.point(coordinates);
  console.log("Analizando punto:", coordinates);

  // Buscar la región que contiene el punto
  let containingRegion = null;
  for (const region of warehouseRegions) {
    try {
      console.log(`Verificando región ${region.name}`);

      const isInside = turf.booleanPointInPolygon(point, region.polygon);
      console.log(`Punto está dentro de ${region.name}:`, isInside);

      if (isInside) {
        containingRegion = {
          warehouseId: region.warehouseId,
          regionName: region.name,
          area: turf.area(region.polygon),
          boundaries: region.polygon.geometry.coordinates[0],
        };
        break;
      }
    } catch (error) {
      console.error(`Error procesando la región ${region.name}:`, error);
      console.error("Detalles del error:", error.message);
    }
  }

  // Calcular almacenes cercanos y distancias
  let nearestWarehouse = null;
  let minDistance = Infinity;
  let allWarehouses = [];

  for (const warehouse of warehouses) {
    try {
      const warehousePoint = turf.point(warehouse.location);
      const distance = turf.distance(point, warehousePoint, {
        units: "kilometers",
      });

      const warehouseInfo = {
        id: warehouse.id,
        name: warehouse.name,
        distance: Math.round(distance * 100) / 100,
        location: warehouse.location,
        departamento: warehouse.departamento,
      };

      allWarehouses.push(warehouseInfo);

      if (distance < minDistance) {
        minDistance = distance;
        nearestWarehouse = warehouseInfo;
      }
    } catch (error) {
      console.error(`Error procesando el almacén ${warehouse.id}:`, error);
    }
  }

  allWarehouses.sort((a, b) => a.distance - b.distance);

  const nearestWarehouseIds = allWarehouses
    .slice(0, 3)
    .map((warehouse) => warehouse.id);

  // Si encontramos una región, buscar almacenes en esa región
  let warehousesInRegion = [];
  if (containingRegion) {
    warehousesInRegion = warehouses
      .filter(
        (w) => w.id.toString() === containingRegion.warehouseId.toString()
      )
      .map((w) => ({
        id: w.id,
        name: w.name,
        departamento: w.departamento,
        distance:
          Math.round(
            turf.distance(point, turf.point(w.location), {
              units: "kilometers",
            }) * 100
          ) / 100,
      }));
  }

  return {
    point: coordinates,
    region: containingRegion || "El punto no está en ninguna región definida",
    nearestWarehouse,
    nearestWarehouseIds,
    allWarehouses: allWarehouses,
    warehousesInRegion:
      warehousesInRegion.length > 0
        ? warehousesInRegion
        : "No hay almacenes en la región",
  };
}

export const UpdateAlmacenPedidosControllerGW = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.put(
      `${service_pedido}/pedido_almacen/${id}`,
      req.body
    );
    if (response) {
      //await redisClient.del('pedidos_cache');
      res.status(201).json(response.data);
    } else {
      res.status(400).json({ message: "Invalid input data" });
    }
  } catch (error) {
    res.status(500).send("Error creating order");
  }
};

export const UpdatePedidoConductorEstadoControllerGW = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await axios.put(
      `${service_pedido}/pedido_estado/${id}`,
      req.body
    );

    if (response.status === 200 && response.data) {
      return res.status(200).json(response.data);
    }

    return res
      .status(404)
      .json({ message: "Pedido no encontrado o no actualizado" });
  } catch (error) {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 404) {
        return res
          .status(404)
          .json({ message: "Pedido no encontrado", details: data });
      }
    }

    console.error(
      `Error en UpdatePedidoConductorEstadoControllerGW: ${error.message}`
    );
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
