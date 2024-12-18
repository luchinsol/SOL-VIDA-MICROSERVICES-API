import axios from 'axios';
import redisClient from '../index.js';
//const router = express.Router();
// URLs de los microservicios
const CLIENTE_SERVICE_URL = 'http://localhost:5002/api/v1/cliente'; // Cambia el puerto y endpoint según tu configuración
const PEDIDO_SERVICE_URL = 'http://localhost:5001/api/v1/pedido';
const PEDIDO_SERVICE_COUNT_URL = 'http://localhost:5001/api/v1/pedido_conteo';
const CONDUCTOR_SERVICE_URL = 'http://localhost:5011/api/v1/conductor';
const UBICACION_SERVICE_URL = 'http://localhost:4009/api/v1/ubicacion';
const DETALLE_PEDIDO_SERVICE_URL = 'http://localhost:5001/api/v1/allpedidodetalle';
const PEDIDO_SERVICE_CONDUCTOR_URL = 'http://localhost:5001/api/v1/pedido_conductor';
const PEDIDO_SERVICE_SIN_CONDUCTOR_URL = 'http://localhost:5001/api/v1/pedido_sin_conductor';

/*
export const getIntegracionControllerClienteGW = async (req, res) => {
    try {
        const { id } = req.params
        const cliente_res = await axios.get(CLIENTE_SERVICE_URL + `/${id}`)
        console.log(cliente_res.data)
        return res.status(200).json(JSON.parse(cliente_res.data));
    }
    catch (error) {
        res.status(500).send('Error fetching Integracion Cliente')
    }
};
*/


// DASHBOARD : CONTEO DE PEDIDO
export const getIntegracionControllerConductorPedidoGW = async (req, res) => {
    try {
        const { id } = req.params; // Obtiene el id de los parámetros de la URL
        const pedido_res = await axios.get(`${PEDIDO_SERVICE_COUNT_URL}/${id}`); // Consulta al microservicio de pedidos

        // Filtrar los pedidos que coincidan con el conductor_id proporcionado
        //const pedidos = pedido_res.data; // Asumiendo que data es un array de pedidos
        //const pedidosFiltrados = pedidos.filter(pedido => pedido.conductor_id == id);

        // Retornar el conteo de pedidos encontrados
        return res.status(200).json(pedido_res.data);
    } catch (error) {
        console.error('Error fetching Integracion Cliente:', error.message);
        return res.status(500).send('Error fetching Integracion Cliente');
    }
};

/*
export const getIntegracionControllerPedidoGW = async (req, res) => {
    // REDIS
    const cacheKey = `integracion_id_cache`; // Clave específica por ID
    let cacheData;

    try {
        cacheData = await redisClient.get(cacheKey)
        console.log("Dato de caché:", cacheData)
    } catch (redisError) {
        console.error("Error al obtener datos de Redis:", redisError.message)
    }

    if (cacheData) {
        return res.status(200).json(JSON.parse(cacheData))
    }

    try {
        const { id } = req.params;

        // Obtener la información del pedido
        const pedidoRes = await axios.get(`${PEDIDO_SERVICE_URL}/${id}`);
        const pedidoData = pedidoRes.data;

        // Obtener la información del cliente usando cliente_id
        const clienteRes = await axios.get(`${CLIENTE_SERVICE_URL}/${pedidoData.cliente_id}`);
        const clienteData = clienteRes.data;

        // Obtener la información del conductor usando conductor_id
        const conductorRes = await axios.get(`${CONDUCTOR_SERVICE_URL}/${pedidoData.conductor_id}`);
        const conductorData = conductorRes.data;

        // Obtener la información de la ubicación usando ubicacion_id
        const ubicacionRes = await axios.get(`${UBICACION_SERVICE_URL}/${pedidoData.ubicacion_id}`);
        const ubicacionData = ubicacionRes.data;

        //Obtener la información del 

        // Construir la respuesta con los datos requeridos
        const responseData = {
            pedido: {
                ...pedidoData,  // Incluye los datos del pedido original
                cliente: clienteData,  // Agrega la información del cliente
                conductor: conductorData,  // Agrega la información del conductor
                ubicacion: ubicacionData,  // Agrega la información de la ubicación
            }
        };

        if (responseData && responseData.pedido) {

            try {
                await redisClient.setEx(cacheKey, 3600, JSON.stringify(responseData.pedido))
            } catch (redisSetError) {
                console.error("Error al guardar datos en Redis:", redisSetError.message)
            }
            res.status(200).json(responseData);
        } else {
            res.status(404).json({ message: 'Not found ' })
        }

        // Responder con el JSON completo
        //res.status(200).json(responseData);

    } catch (error) {
        console.error('Error en la integración del pedido:', error.message);

        // En caso de error, responder con el estado 500
        res.status(500).send('Error fetching Integración Pedido');
    }
};*/

//PEDIDOS QUE APARECEN AL INICIO DE LA VISTA DE PEDIDOS DEL CONDUCTOR
export const getIntegracionAllPedidosGW = async (req, res) => {
    // REDIS - Clave de caché para pedidos sin conductor
    const cacheKeyPedidos = `pedidos_sin_conductor_cache`;

    try {
        // Verificar si los datos de pedidos están en caché
        const cacheDataPedidos = await redisClient.get(cacheKeyPedidos);
        if (cacheDataPedidos) {
            console.log("Datos de pedidos desde el caché:", cacheDataPedidos);
            return res.status(200).json(JSON.parse(cacheDataPedidos));
        }
    } catch (redisError) {
        console.error("Error al obtener datos de Redis para pedidos:", redisError.message);
    }

    // AXIOS - Consulta de pedidos sin conductor desde la BD
    try {
        const pedidosRes = await axios.get(`${PEDIDO_SERVICE_SIN_CONDUCTOR_URL}`);
        const pedidosSinConductor = pedidosRes.data;

        // Verificar si los datos de ubicaciones deben ser agregados y almacenados
        const pedidosConUbicacion = await Promise.all(
            pedidosSinConductor.map(async (pedido) => {
                try {
                    // Verificar si el pedido tiene un ID de ubicación
                    if (pedido.ubicacion_id) {
                        const cacheKeyUbicacion = `ubicacion_${pedido.ubicacion_id}`;

                        // Primero intentamos obtener la ubicación desde Redis
                        let ubicacionData = await redisClient.get(cacheKeyUbicacion);
                        if (ubicacionData) {
                            console.log(`Ubicación de caché para ${pedido.ubicacion_id}:`, ubicacionData);
                            pedido.ubicacion_id = JSON.parse(ubicacionData); // Reemplazamos con la ubicación desde Redis
                        } else {
                            // Si no está en caché, hacemos la llamada a la API externa
                            const ubicacionRes = await axios.get(
                                `${UBICACION_SERVICE_URL}/${pedido.ubicacion_id}`
                            );
                            ubicacionData = ubicacionRes.data;

                            // Guardamos la ubicación en Redis por 1 hora
                            await redisClient.setEx(cacheKeyUbicacion, 3600, JSON.stringify(ubicacionData));
                            pedido.ubicacion_id = ubicacionData; // Reemplazar con datos completos
                        }
                    }
                    return pedido;
                } catch (ubicacionError) {
                    console.error(
                        `Error al obtener la ubicación para ubicacion_id ${pedido.ubicacion_id}:`,
                        ubicacionError.message
                    );
                    pedido.ubicacion_id = null; // En caso de error, dejar nulo
                    return pedido;
                }
            })
        );

        // Agregar los detalles de los pedidos
        const pedidosConDetalle = await Promise.all(
            pedidosConUbicacion.map(async (pedido) => {
                try {
                    // Verificar si el pedido tiene un ID
                    if (pedido.id) {
                        const cacheKeyDetalle = `detalle_${pedido.id}`;

                        // Primero intentamos obtener el detalle desde Redis
                        let detalleData = await redisClient.get(cacheKeyDetalle);
                        if (detalleData) {
                            console.log(`Detalle pedido de caché para ${pedido.id}:`, detalleData);
                            pedido.detalle = JSON.parse(detalleData); // Agregar detalles a `pedido.detalle`
                        } else {
                            // Si no está en caché, hacemos la llamada a la API externa
                            const detalleRes = await axios.get(
                                `${DETALLE_PEDIDO_SERVICE_URL}/${pedido.id}`
                            );
                            detalleData = detalleRes.data;

                            // Guardamos el detalle en Redis por 1 hora
                            await redisClient.setEx(cacheKeyDetalle, 3600, JSON.stringify(detalleData));
                            pedido.detalle = detalleData; // Agregar los detalles completos
                        }
                    }
                    return pedido;
                } catch (detalleError) {
                    console.error(
                        `Error al obtener el detalle para pedido ${pedido.id}:`,
                        detalleError.message
                    );
                    pedido.detalle = null; // En caso de error, dejar los detalles nulos
                    return pedido;
                }
            })
        );

        // Guardar la lista completa de pedidos con ubicaciones y detalles en caché por 1 hora
        if (pedidosConDetalle.length > 0) {
            try {
                await redisClient.setEx(cacheKeyPedidos, 3600, JSON.stringify(pedidosConDetalle));
            } catch (redisSetError) {
                console.error("Error al guardar datos de pedidos en Redis:", redisSetError.message);
            }
        }

        return res.status(200).json(pedidosConDetalle);
    } catch (error) {
        console.error("Error al acceder al endpoint de pedidos sin conductor:", error.message);
        return res.status(500).send("Error al obtener pedidos sin conductor");
    }
};



/*
export const getIntegracionControllerConductorGW = async (req, res) => {
    try {
        const { id } = req.params
        const conductor_res = await axios.get(CONDUCTOR_SERVICE_URL + `/${id}`)
        console.log(conductor_res.data)
        return res.status(200).json(JSON.parse(conductor_res.data));
    }
    catch (error) {
        res.status(500).send('Error fetching Integracion Conductor')
    }
};
*/

export const getIntegracionCompletaGW = async (req, res) => {
    try {
        const { clienteId, pedidoId, conductorId, ubicacionId } = req.params;

        if (!clienteId || !pedidoId || !conductorId || !ubicacionId) {
            return res.status(400).json({ error: 'Se requieren clienteId, pedidoId y conductorId en la URL' });
        }
        const clienteRes = await axios.get(`${CLIENTE_SERVICE_URL}/${clienteId}`)
        const pedidoRes = await axios.get(`${PEDIDO_SERVICE_URL}/${pedidoId}`)
        const conductorRes = await axios.get(`${CONDUCTOR_SERVICE_URL}/${conductorId}`)
        const ubicacionRes = await axios.get(`${UBICACION_SERVICE_URL}/${ubicacionId}`)

        const data = {
            cliente: clienteRes.data,
            pedido: pedidoRes.data,
            conductor: conductorRes.data,
            ubicacion: ubicacionRes.data
        };

        res.status(200).json(data);
    } catch (error) {
        console.error('Error en la integración completa:', error.message);

        if (error.response) {
            res.status(error.response.status).json({ error: error.response.data });
        } else {
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
};


export const getIntegraciaonCompletaDetallesGW = async (req, res) => {
    try {
        const { pedidoId } = req.params;

        console.log(`${DETALLE_PEDIDO_SERVICE_URL}/${pedidoId}`)
        const pedidoRes = await axios.get(`${DETALLE_PEDIDO_SERVICE_URL}/${pedidoId}`)
        const pedidoData = pedidoRes.data;


        console.log('pedidoData:', pedidoData);

        const ubicaciones = Array.from(
            new Set(
                pedidoData
                    .map(pedido => pedido.ubicacion_id)
                    .filter(id => id !== null && id !== undefined)
            )
        );
        console.log('Lista de ubicaciones válidas (sin repetidos):', ubicaciones);
        

        const ubicacionRes = await axios.get(`${UBICACION_SERVICE_URL}/${ubicaciones[0]}`);
        const ubicacionData = ubicacionRes.data;

        const clientes = Array.from(
            new Set(
                pedidoData
                    .map(pedido => pedido.cliente_id)
                    .filter(id => id !== null && id !== undefined)
            )
        );
        console.log('Lista de clientes válidas (sin repetidos):', clientes);
        const clienteRes = await axios.get(`${CLIENTE_SERVICE_URL}/${clientes[0]}`);
        const clienteData = clienteRes.data;


        const data = {
            pedido: pedidoData,
            //conductor: conductorData,
            ubicacion: ubicacionData,
            cliente: clienteData,
        };

        res.status(200).json(data);
    } catch (error) {
        console.error('Error en la integración completa:', error.message);

        if (error.response) {
            res.status(error.response.status).json({ error: error.response.data });
        } else {
            res.status(500).json({ error: 'Error interno del servidor' });
        }
    }
};


// DASHBOARD : ULTIMO PEDIDO REALIZADO
export const getInformacionConductorPedido = async (req, res) => {
    try {
        const { id } = req.params;

        // Obtener la información del pedido
        const pedidoRes = await axios.get(`${PEDIDO_SERVICE_CONDUCTOR_URL}/${id}`);
        const pedidoData = pedidoRes.data;

        // Obtener la información del conductor usando CLIENTE --->corregir
        const conductorRes = await axios.get(`${CONDUCTOR_SERVICE_URL}/${id}`);
        const conductorData = conductorRes.data; 

        // Construir la respuesta con los datos requeridos
        const responseData = {
                pedidos:pedidoData,  // Incluye los datos del pedido original
                conductores:conductorData
        };

        if (responseData) {
            res.status(200).json(responseData);
        } else {
            res.status(404).json({ message: 'Not found ' })
        }


    } catch (error) {
        console.error('Error en la integración del pedido:', error.message);
        res.status(500).send('Error fetching Integración Pedido');
    }
};



