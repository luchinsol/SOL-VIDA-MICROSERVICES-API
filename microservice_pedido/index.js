import express from "express";
import morgan from "morgan";
import { Server } from 'socket.io';
import amqp from 'amqplib';
import http from "http";
import routerPedido from "./routes/pedido_route.js";
import cors from 'cors';

const app_micro_pedido = express();
const server = http.createServer(app_micro_pedido);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 2000,
    reconnectionDelayMax: 2000,
    transports: ['websocket', 'polling']
});

server.setTimeout(120000);

// Store para órdenes pendientes y confirmaciones
let pendingOrders = [];
let pendingAcks = new Map();
let orderHistory = new Map();

app_micro_pedido.use(cors());
app_micro_pedido.use(morgan('combined'));
app_micro_pedido.use(express.json());
app_micro_pedido.use('/api/v1', routerPedido);

io.on('connection', (socket) => {
    console.log('Cliente conectado');
    
    // Enviar órdenes pendientes al cliente cuando se conecta
    socket.emit('update_orders', pendingOrders);
    
    // Manejar solicitud de sincronización después de reconexión
    socket.on('sync_request', ({ lastOrderTimestamp }) => {
        console.log('Sync request received with timestamp:', lastOrderTimestamp);
        if (lastOrderTimestamp) {
            const newOrders = Array.from(orderHistory.values())
                .filter(order => new Date(order.timestamp) > new Date(lastOrderTimestamp));
            
            if (newOrders.length > 0) {
                console.log('Sending missed orders:', newOrders.length);
                socket.emit('sync_update', newOrders);
            }
        }
    });

    socket.on('order_received', (data) => {
        const { orderId } = data;
        if (pendingAcks.has(orderId)) {
            console.log('Order acknowledged:', orderId);
            pendingAcks.delete(orderId);
            socket.emit('order_confirmed', { orderId, status: 'confirmed' });
        }
    });

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });

    socket.on('get_orders', () => {
        socket.emit('update_orders', pendingOrders);
    });
});

async function setupQueuesAndExchanges(channel) {
    // Setup Exchanges
    await channel.assertExchange(ARCHIVE_EXCHANGE, 'direct', {
        durable: true
    });
    
    await channel.assertExchange(DRIVERS_EXCHANGE, 'fanout', {
        durable: true
    });

    // Setup Main Queue
    await channel.assertQueue(MAIN_QUEUE, {
        durable: true,
        arguments: {
            'x-message-ttl': 1800000,
            'x-dead-letter-exchange': ARCHIVE_EXCHANGE,
            'x-dead-letter-routing-key': ARCHIVE_ROUTING_KEY
        }
    });

    // Setup Archive Queue
    await channel.assertQueue(ARCHIVE_QUEUE, {
        durable: true
    });

    // Bind Archive Queue
    await channel.bindQueue(ARCHIVE_QUEUE, ARCHIVE_EXCHANGE, ARCHIVE_ROUTING_KEY);
}


async function getAllArchivedOrders(channel) {
    const orders = [];
    let tempMessages = [];
    let msg;

    // Obtener todos los mensajes de la cola de archivo
    while ((msg = await channel.get(ARCHIVE_QUEUE, { noAck: false })) !== false) {
        try {
            const order = JSON.parse(msg.content.toString());
            orders.push(order);
            tempMessages.push({
                message: msg,
                content: msg.content
            });
            channel.ack(msg);
        } catch (error) {
            console.error('Error parsing archived order:', error);
            channel.ack(msg);
        }
    }

    // Volver a publicar todos los mensajes en la cola de archivo
    for (const msg of tempMessages) {
        await channel.sendToQueue(ARCHIVE_QUEUE, msg.content, {
            persistent: true
        });
    }

    return orders;
}


// Función para eliminar un pedido específico de la cola de archivo
async function deleteOrderFromArchiveQueue(channel, orderId) {
    try {
        let foundTarget = false;
        let messagesProcessed = 0;
        const maxMessages = 1000;
        const tempMessages = [];

        // Procesar todos los mensajes de la cola
        while (!foundTarget && messagesProcessed < maxMessages) {
            const message = await channel.get(ARCHIVE_QUEUE, { noAck: false });
            
            if (!message) break;

            try {
                const order = JSON.parse(message.content.toString());
                
                if (order.id === orderId) {
                    // Encontramos el pedido a eliminar
                    channel.ack(message);
                    foundTarget = true;
                    console.log(`[x] Pedido ${orderId} eliminado de la cola de archivo`);
                } else {
                    // Guardar temporalmente los otros mensajes
                    tempMessages.push({
                        content: message.content
                    });
                    channel.ack(message);
                }
            } catch (parseError) {
                console.error('Error parsing message:', parseError);
                channel.ack(message);
            }
            
            messagesProcessed++;
        }

        // Republicar los mensajes que no fueron eliminados
        for (const msg of tempMessages) {
            await channel.sendToQueue(ARCHIVE_QUEUE, msg.content, {
                persistent: true
            });
        }

        // Actualizar la cola de pedidos activos
        //await updateActiveOrdersQueue(channel, tempMessages.map(msg => msg.order));

        return foundTarget;
    } catch (error) {
        console.error('Error processing archive queue:', error);
        throw error;
    }
}


async function setupConsumer() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        await setupQueuesAndExchanges(channel);
        console.log('Esperando pedidos...');

        // Consume from main queue
        channel.consume(MAIN_QUEUE, async (msg) => {
            if (msg !== null) {
                const order = JSON.parse(msg.content.toString());
                console.log('Nuevo pedido recibido:', order);

                // Publish to archive and drivers exchanges
                channel.publish(
                    ARCHIVE_EXCHANGE,
                    ARCHIVE_ROUTING_KEY,
                    Buffer.from(JSON.stringify(order)),
                    { persistent: true }
                );

                channel.publish(
                    DRIVERS_EXCHANGE,
                    '',  // fanout exchange doesn't need routing key
                    Buffer.from(JSON.stringify(order)),
                    { persistent: true }
                );

                io.emit('new_order', order);
                channel.ack(msg);
            }
        });

        // Handle socket connections
        io.on('connection', async (socket) => {
            console.log(`Conductor conectado: ${socket.id}`);
            
            // Create unique queue for this driver
            const driverQueue = `driver_queue_${socket.id}`;
            await channel.assertQueue(driverQueue, { 
                exclusive: true,
                autoDelete: true 
            });
            
            // Bind to drivers exchange
            await channel.bindQueue(driverQueue, DRIVERS_EXCHANGE, '');
            
            // Send initial orders from archive
            const archivedOrders = await getAllArchivedOrders(channel);
            socket.emit('initial_orders', archivedOrders);

            // Setup consumer for this driver's queue
            channel.consume(driverQueue, (msg) => {
                if (msg) {
                    const order = JSON.parse(msg.content.toString());
                    socket.emit('new_order', order);
                    channel.ack(msg);
                }
            });

            socket.on('take_order', async (orderId) => {
                console.log(`[x] Pedido tomado: ${orderId}`);
                await deleteOrderFromArchiveQueue(channel, orderId);
                io.emit('order_taken', { id: orderId });
            });

            socket.on('disconnect', async () => {
                console.log(`Conductor desconectado: ${socket.id}`);
                // Queue will be auto-deleted due to autoDelete: true
            });
        });

    } catch (error) {
        console.error('Error al configurar el consumidor:', error);
        setTimeout(setupConsumer, 10000);
    }
}


const PORT = 5001;
const RABBITMQ_URL = 'amqp://localhost';
const QUEUE_NAME = 'colaPedidoRabbit';
const MAIN_QUEUE = 'micro_pedidos';
const ARCHIVE_QUEUE = 'pedidos_archive';
const DRIVERS_EXCHANGE = 'drivers_exchange';
const ARCHIVE_EXCHANGE = 'micro_pedidos_exchange';
const ARCHIVE_ROUTING_KEY = 'pedido.archived';

server.listen(PORT, async () => {
    console.log(`Microservice PEDIDO_DETALLE running http://127.0.0.1:${PORT}`);
    await setupConsumer();
});

export { app_micro_pedido, io, server };    