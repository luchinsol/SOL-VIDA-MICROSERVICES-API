import axios from 'axios';
import redisClient from '../index.js';
const URLpedido = 'http://microservice_pedido:5000/api/v1/pedido';//'http://localhost:5000/api/v1/pedido';


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

export const postPedidosControllerGW = async (req, res) => {
    try {
        const response = await axios.post(URLpedido, req.body);
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
