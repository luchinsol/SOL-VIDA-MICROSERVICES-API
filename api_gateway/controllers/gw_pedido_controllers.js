import axios from 'axios';
import redisClient from '../index.js';
import amqp from 'amqplib';
const URLpedido = 'http://localhost:5001/api/v1/pedido';//'http://localhost:5000/api/v1/pedido';
const URLpedidoDetalle = 'http://localhost:5001/api/v1/pedido_almacen';
const URLcliente = 'http://localhost:5002/api/v1/cliente'; // URL del servicio de clientes

const RABBITMQ_URL = 'amqp://localhost'; // Cambia esta URL si RabbitMQ está en otro host
const QUEUE_NAME = 'pedidos_queue'; // Nombre de la cola

let pedidosStorage = [];
const sendPedidoRabbit = async (pedidoCreado) => {
    try {
        // Establecemos la conexión con el servidor RABBIT MQ
        const connection = await amqp.connect('amqp://localhost')
        const channel = await connection.createChannel()

        // Definimos la cola
        const queue = 'colaPedidoRabbit'

        // Si no existe la colala creamos
        await channel.assertQueue(queue, {
            durable: false
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
/*
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
  };*/

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
    const { cliente_id, ...pedidoData } = req.body; // Extraemos cliente_id y los demás datos del pedido

    try {
        // Realizar una solicitud GET para obtener los datos del cliente
        const clienteResponse = await axios.get(`${URLcliente}/${cliente_id}`);

        if (clienteResponse && clienteResponse.data) {
            const clienteData = clienteResponse.data;

            // Enriquecer el cuerpo del pedido con los datos del cliente
            const pedidoEnriquecido = {
                ...pedidoData, // Datos originales del pedido
                cliente: clienteData, // Datos del cliente obtenidos
            };
            //ARRAY DE objetos
            console.log("nueva---->>>>>")
            console.log(pedidoEnriquecido)
            // Enviar el pedido enriquecido a la cola de mensajería
            //await sendToQueue(pedidoEnriquecido);
            await sendPedidoRabbit(pedidoEnriquecido)
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
    } catch (error) {
        console.error('Error al crear el pedido:', error.message);
        res.status(500).send('Error creando el pedido');
    }
};





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
};