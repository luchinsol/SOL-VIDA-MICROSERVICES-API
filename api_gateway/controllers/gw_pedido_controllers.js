import axios from 'axios';
import redisClient from '../index.js';
import amqp from 'amqplib';
import * as turf from '@turf/turf';
const URLpedidoDetalle = 'http://localhost:5001/api/v1/pedido_almacen';
const URLcliente = 'http://localhost:5002/api/v1/cliente'; // URL del servicio de clientes
const URLzona = 'http://localhost:4009/api/v1/zona';
const URLalmacen = 'http://localhost:5015/api/v1/almacen';
const URLpedido = 'http://127.0.0.1:5001/api/v1/pedido';


const MAIN_QUEUE = 'micro_pedidos';
const RABBITMQ_URL = 'amqp://localhost'; // Cambia esta URL si RabbitMQ está en otro host

const sendToQueue = async (pedido) => {
    try {
      const connection = await amqp.connect(RABBITMQ_URL);
      const channel = await connection.createChannel();
  
      const msg = JSON.stringify(pedido); // Convertir el pedido a JSON
  
      // Asegurarse de que la cola exista
      await channel.sendToQueue(MAIN_QUEUE, Buffer.from(msg), {
        persistent: true
    });
  
      console.log('Pedido enviado a la cola:', pedido);
      
      // Cerramos la conexión
      await channel.close();
      await connection.close();
    } catch (error) {
      console.error('Error al enviar el pedido a la cola de RabbitMQ:', error.message);
    }
  };

export const getPedidosControllerGW = async (req, res) => {
    console.log("......get pedido controller");
    const cacheKey = 'pedidos_cache';
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
        const response = await axios.get(URLpedido);
        console.log("Respuesta de la API de pedidos:", response.data);

        if (response && response.data) {
            // Guardar en caché los datos de respuesta (opcional si Redis funciona)
            try {
                await redisClient.setEx(cacheKey, 3600, JSON.stringify(response.data));
            } catch (redisSetError) {
                console.error("Error al guardar datos en Redis:", redisSetError.message);
            }
            res.status(200).json(response.data);
        } else {
            res.status(404).json({ message: 'Not Found' });
        }

    } catch (error) {
        console.error("Error al obtener pedidos:", error.message);
        res.status(500).send('Error fetching orders');
    }
};

export const postInfoPedido = async (req, res) => {
    try {
        const {
            cliente_id, subtotal, descuento, total, fecha,
            tipo, estado, observacion, tipo_pago, ubicacion_id,
            detalles
        } = req.body;

        let latitud, longitud;
        try {
            const ubicacionRes = await axios.get(`http://localhost:4009/api/v1/ubicacion/${ubicacion_id}`);
            latitud = ubicacionRes.data.latitud;
            longitud = ubicacionRes.data.longitud;

            if (!latitud || !longitud) {
                return res.status(400).json({ message: 'Coordenadas no disponibles' });
            }
        } catch (error) {
            return res.status(404).json({ message: 'Ubicación no encontrada' });
        }

        const [responseZona, responseAlmacen, resultado] = await Promise.all([
            axios.get(URLzona),
            axios.get(URLalmacen),
            axios.post(URLpedido, {
                cliente_id, subtotal, descuento, total, fecha,
                tipo, estado, observacion, tipo_pago, ubicacion_id
            })
        ]);

        const warehouseRegions = processWarehouseRegions(responseZona.data);
        const warehouses = processWarehouses(responseAlmacen.data);
        const coordinates = [Number(longitud), Number(latitud)];
        const analysis = analyzeLocation(warehouseRegions, coordinates, warehouses);

        if (!resultado.data) {
            return res.status(400).json({ message: 'Invalid input data' });
        }

        const pedidoId = resultado.data.id;
        const regionId = analysis.region.warehouseId;
        const almacenId = analysis.nearestWarehouse.id;

        // Process each order detail
        const detallesProcessed = await Promise.all(detalles.map(async (detalle) => {
            const { producto_id, cantidad, promocion_id } = detalle;

            // Fetch product and promotion info in parallel
            const [productoInfo, promocionInfo, cantidadPromos] = await Promise.all([
                axios.get(`http://localhost:4025/api/v1/producto/${producto_id}`),
                promocion_id ? axios.get(`http://localhost:4025/api/v1/promocion/${promocion_id}`) : Promise.resolve(null),
                promocion_id ? axios.get(`http://localhost:4025/api/v1/cantidadprod/${promocion_id}/${producto_id}`) : Promise.resolve(null),
            ]);

            // Calculate price based on promotion
            const precio = await axios.get(
                promocion_id
                    ? `http://localhost:4125/api/v1/precioZonaProducto/${regionId}/${promocion_id}`
                    : `http://localhost:4225/api/v1/preciopromo/${regionId}/${producto_id}`
            );

            const precioFinal = precio.data.precio;
            const descuento_inicial = precio.data.descuento;
            const precioTotalAPagar = precioFinal - descuento_inicial;
            const pagoFinalARealizar = precioTotalAPagar * cantidad;
            const cantidadProductosPorPromo = cantidadPromos?.data?.cantidad;
            const cantidadProductos = cantidadProductosPorPromo*cantidad;

            // Create detail record
            await axios.post(`http://127.0.0.1:5001/api/v1/det_pedido`, {
                pedido_id: pedidoId,
                producto_id,
                cantidad,
                promocion_id
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
                    productos: [{
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
                        
                    }]
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
                    total: pagoFinalARealizar
                };
            }
        }));

        // Update warehouse and zone
        await Promise.all([
            axios.put(`http://127.0.0.1:5001/api/v1/pedido_almacen/${pedidoId}`, {
                almacen_id: almacenId
            }),
            axios.put(`http://localhost:4009/api/v1/ubicacion/${ubicacion_id}`, {
                zona_trabajo_id: regionId
            })
        ]);

        // Separate items into promotions and products
        const { promociones, productos } = detallesProcessed.reduce((acc, item) => {
            if ('productos' in item) {
                acc.promociones.push(item);
            } else {
                acc.productos.push(item);
            }
            return acc;
        }, { promociones: [], productos: [] });

        const subTotal = detallesProcessed.reduce((sum, detail) => sum + detail.subtotal, 0);
        const descuentoCupon = resultado.data.descuento;
        const precioFinal = subTotal - descuentoCupon;

        await axios.put(`http://127.0.0.1:5001/api/v1/pedido_precio/${pedidoId}`, {
            subtotal: subTotal,
            total: precioFinal
        });

        const response = {
            id: pedidoId,
            coordenadas: { latitud, longitud },
            detalles: {
                promociones,
                productos
            },  
            region_id: regionId,
            almacen_id: almacenId,
            subtotal: subTotal,
            descuento: descuentoCupon,
            total: precioFinal
        };
        await sendToQueue(response);
        res.status(201).json(response);
        

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: 'Error procesando la solicitud',
            error: error.message
        });
    }
};

const processWarehouseRegions = (zonas) => {
    return zonas.map((zona) => {
        try {
            let processedCoordinates = zona.poligono_coordenadas;

            if (!Array.isArray(processedCoordinates) || !processedCoordinates.every(coord =>
                Array.isArray(coord) && coord.length === 2 &&
                typeof coord[0] === 'number' && typeof coord[1] === 'number')) {
                throw new Error(`Formato inválido de coordenadas para zona ${zona.id}`);
            }

            return {
                warehouseId: zona.id,
                name: zona.nombre,
                polygon: {
                    type: "Feature",
                    properties: {
                        id: zona.id,
                        name: zona.nombre
                    },
                    geometry: {
                        type: "Polygon",
                        coordinates: [processedCoordinates]
                    }
                }
            };
        } catch (error) {
            console.error(`Error procesando zona ${zona.id}:`, error);
            return null;
        }
    }).filter(region => region !== null);
};

const processWarehouses = (almacenes) => {
    return almacenes.map((almacen) => ({
        id: almacen.id,
        name: almacen.nombre,
        location: [Number(almacen.longitud), Number(almacen.latitud)],
        departamento: almacen.departamento
    }));
};

function analyzeLocation(warehouseRegions, coordinates, warehouses) {
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
        throw new Error('Formato de coordenadas inválido');
    }

    const point = turf.point(coordinates);
    console.log('Analizando punto:', coordinates);

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
                    boundaries: region.polygon.geometry.coordinates[0]
                };
                break;
            }
        } catch (error) {
            console.error(`Error procesando la región ${region.name}:`, error);
            console.error('Detalles del error:', error.message);
        }
    }

    // Calcular almacenes cercanos y distancias
    let nearestWarehouse = null;
    let minDistance = Infinity;
    let allWarehouses = [];

    for (const warehouse of warehouses) {
        try {
            const warehousePoint = turf.point(warehouse.location);
            const distance = turf.distance(point, warehousePoint, { units: 'kilometers' });

            const warehouseInfo = {
                id: warehouse.id,
                name: warehouse.name,
                distance: Math.round(distance * 100) / 100,
                location: warehouse.location,
                departamento: warehouse.departamento
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

    // Si encontramos una región, buscar almacenes en esa región
    let warehousesInRegion = [];
    if (containingRegion) {
        warehousesInRegion = warehouses
            .filter(w => w.id.toString() === containingRegion.warehouseId.toString())
            .map(w => ({
                id: w.id,
                name: w.name,
                departamento: w.departamento,
                distance: Math.round(
                    turf.distance(
                        point,
                        turf.point(w.location),
                        { units: 'kilometers' }
                    ) * 100
                ) / 100
            }));
    }

    return {
        point: coordinates,
        region: containingRegion || 'El punto no está en ninguna región definida',
        nearestWarehouse,
        allWarehouses: allWarehouses,
        warehousesInRegion: warehousesInRegion.length > 0 ? warehousesInRegion : 'No hay almacenes en la región'
    };
}



export const UpdateAlmacenPedidosControllerGW = async (req, res) => {
    try {
        const {id} = req.params
        const response = await axios.put(`${URLpedidoDetalle}/${id}`,req.body);
        if (response) {
           //await redisClient.del('pedidos_cache');
            res.status(201).json(response.data);
        } else {
            res.status(400).json({ message: 'Invalid input data' });
        }
    } catch (error) {
        res.status(500).send('Error creating order');
    }
};

