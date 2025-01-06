import axios from 'axios';
import redisClient from '../index.js';
import amqp from 'amqplib';
import * as turf from '@turf/turf';
const URLpedidoDetalle = 'http://localhost:5001/api/v1/pedido_almacen';
const URLcliente = 'http://localhost:5002/api/v1/cliente'; // URL del servicio de clientes
const URLzona = 'http://localhost:4009/api/v1/zona';
const URLalmacen = 'http://localhost:5015/api/v1/almacen';
const URLpedido = 'http://127.0.0.1:5001/api/v1/pedido';


const RABBITMQ_URL = 'amqp://localhost'; // Cambia esta URL si RabbitMQ está en otro host
const QUEUE_NAME = 'colaPedidoRabbit'; // Nombre de la cola


//let pedidosStorage = [];
/*const sendPedidoRabbit = async (pedidoCreado) => {
    try {
        // Establecemos la conexión con el servidor RABBIT MQ
        const connection = await amqp.connect('amqp://localhost')
        const channel = await connection.createChannel()

        // Definimos la cola
        const queue = 'colaPedidoRabbit'

        // Si no existe la colala creamos
        await channel.assertQueue(queue, {
            durable: true
        })

        //console.log(pedidoCreado)
        // Enviamos el mensaja a la cola
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(pedidoCreado)))
        //console.log("ENVIANDO A RABBIT MQ")
        //console.log(JSON.stringify(pedidoCreado))

        setTimeout(() => {
            connection.close();

        }, 500);

    } catch (error) {
        throw new Error(`Error en el envío a RabbitMQ: ${error}`)
    }
}
*/


const sendToQueue = async (pedido) => {
    try {
      const connection = await amqp.connect(RABBITMQ_URL);
      const channel = await connection.createChannel();
  
      const msg = JSON.stringify(pedido); // Convertir el pedido a JSON
  
      // Asegurarse de que la cola exista
      await channel.assertQueue(QUEUE_NAME, {
        durable: true, // La cola será persistente
      });
  
      // Enviar el mensaje a la cola
      channel.sendToQueue(QUEUE_NAME, Buffer.from(msg), {
        persistent: true, // El mensaje será persistente
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
            subtotal: subTotal,
            descuento: descuentoCupon,
            total: precioFinal
        };

        res.status(201).json(response);
        await sendToQueue(response);

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




/*
export const postPedidosControllerGW = async (req, res) => {
    console.log("-------------->>>>>>>>")
   // const { cliente_id, ...pedidoData } = req.body; // Extraemos cliente_id y los demás datos del pedido

    try {
        await sendToQueue(req.body)
        // Realizar una solicitud GET para obtener los datos del cliente
       // const clienteResponse = await axios.get(`${URLcliente}/${cliente_id}`);
        
       // console.log(clienteResponse)
        console.log("nueva---->>>>>")
        /*
        if (clienteResponse && clienteResponse.data) {
            const clienteData = clienteResponse.data;

            // Enriquecer el cuerpo del pedido con los datos del cliente
            const pedidoEnriquecido = {
                ...pedidoData, // Datos originales del pedido
                cliente: clienteData, // Datos del cliente obtenidos
            };
            //ARRAY DE objetos
            
            console.log(pedidoEnriquecido)
            // Enviar el pedido enriquecido a la cola de mensajería
            //await sendToQueue(pedidoEnriquecido);
            
            //array utilizarlo -> SUGERENCIA: 
            //CONSUMIR EN SOCKET IO Y ALLI COLOCARLO EN UNA LISTA DE OBJETOS

            // Enviar la respuesta con los datos del pedido
            res.status(201).json({
                message: 'Pedido creado y enviado a la cola.',
                pedido: pedidoEnriquecido
            });
        } else {
            // Si no se obtiene respuesta del cliente, devolver error
            res.status(404).json({ message: 'Cliente no encontrado.' });
        }
            res.status(201).json({
                message: 'Pedido creado y enviado a la cola.',
                pedido: pedidoEnriquecido
            });
    } catch (error) {
        console.error('Error al crear el pedido:', error.message);
        res.status(500).send('Error creando el pedido');
    }
};*/




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

/*
export const startConsumer = async () => {
    try {
        console.log('Iniciando el consumidor...');
        
        // Conectar a RabbitMQ
        const connection = await amqplib.connect(RABBITMQ_URL);
        console.log('Conexión a RabbitMQ establecida.');
        
        // Crear un canal
        const channel = await connection.createChannel();
        
        // Asegurar que la cola exista
        await channel.assertQueue(QUEUE_NAME, { durable: true });
        console.log(`Esperando mensajes en la cola: ${QUEUE_NAME}`);
        
        // Consumir mensajes
        channel.consume(
            QUEUE_NAME,
            (message) => {
                if (message) {
                    try {
                        // Convertir el mensaje a objeto
                        const pedido = JSON.parse(message.content.toString());
                        
                        // Agregar timestamp al pedido
                        const pedidoConTimestamp = {
                            ...pedido,
                            fechaRecepcion: new Date().toISOString()
                        };
                        
                        // Almacenar en el array global
                        pedidosStorage.push(pedidoConTimestamp);
                        
                        console.log('Pedido recibido y almacenado:', pedidoConTimestamp);
                        
                        // Confirmar el procesamiento del mensaje
                        channel.ack(message);
                    } catch (error) {
                        console.error('Error al procesar el mensaje:', error.message);
                        // Rechazar el mensaje sin reencolar
                        channel.nack(message, false, false);
                    }
                }
            },
            { noAck: false }
        );

        // Manejar cierre de conexión
        connection.on('close', async () => {
            console.log('Conexión a RabbitMQ cerrada. Intentando reconectar...');
            // Esperar 5 segundos antes de reintentar
            setTimeout(startConsumer, 5000);
        });

        console.log('Consumidor iniciado exitosamente');
    } catch (error) {
        console.error('Error al iniciar el consumidor:', error.message);
        // Reintentar conexión
        setTimeout(startConsumer, 5000);
    }
};

// Obtener todos los pedidos
export const getPedidos = (req, res) => {
    if (pedidosStorage.length > 0) {
        res.status(200).json({
            success: true,
            count: pedidosStorage.length,
            pedidos: pedidosStorage
        });
    } else {
        res.status(404).json({
            success: false,
            message: 'No hay pedidos disponibles.',
            count: 0
        });
    }
};*/