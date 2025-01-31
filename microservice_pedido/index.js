import express from "express";
import morgan from "morgan";
import { Server } from 'socket.io';
import amqp from 'amqplib';
import http from "http";
import routerPedido from "./routes/pedido_route.js";

import cors from 'cors';
import dotenv from 'dotenv'
dotenv.config();

const app_micro_pedido = express();
const server = http.createServer(app_micro_pedido);

const PORT = process.env.PORT_PEDIDO
const RABBITMQ_URL = process.env.RABBITMQ_URL//'amqp://rabbitmq'//'amqp://localhost';
console.log("...cola d pedidos en stack.yml")
console.log(RABBITMQ_URL)
const QUEUE_NAME = 'colaPedidoRabbit';
const MAIN_QUEUE = 'micro_pedidos';
const ARCHIVE_QUEUE = 'pedidos_archive';
const DRIVERS_EXCHANGE = 'drivers_exchange';
const ARCHIVE_EXCHANGE = 'micro_pedidos_exchange';
const ARCHIVE_ROUTING_KEY = 'pedido.archived';
const EXPIRED_ORDERS_QUEUE = 'pedidos_expirados_queue';
const ARCHIVE_QUEUE_1 = 'pedidos_archive_1';
const ARCHIVE_QUEUE_2 = 'pedidos_archive_2';
const ARCHIVE_QUEUE_3 = 'pedidos_archive_3';
const DRIVERS_EXCHANGE_1 = 'drivers_exchange_1';
const DRIVERS_EXCHANGE_2 = 'drivers_exchange_2';
const DRIVERS_EXCHANGE_3 = 'drivers_exchange_3';
const EXPIRED_ORDERS_EXCHANGE = 'expired_orders_exchange';


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
let connection = null;
let channel = null;

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

    socket.on('test_connection', (data) => {
        console.log('Test connection received:', data);
        socket.emit('test_connection_response', { status: 'ok' });
    });



    
});

async function setupConnection() {
    try {
        // Use global variables instead of local ones
        connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();

        console.log('RabbitMQ connection established successfully');

        return { connection, channel };
    } catch (error) {
        console.error('Error establishing RabbitMQ connection:', error);
        throw error;
    }
}


async function setupQueuesAndExchanges() {
    try {
        // Ensure connection exists
        if (!connection || !channel) {
            await setupConnection();
        }

        // Rest of your existing setupQueuesAndExchanges logic...
        await channel.assertExchange(ARCHIVE_EXCHANGE, 'direct', {
            durable: true
        });

        await channel.assertExchange(DRIVERS_EXCHANGE_1, 'fanout', {
            durable: true
        });
        await channel.assertExchange(DRIVERS_EXCHANGE_2, 'fanout', {
            durable: true
        });
        await channel.assertExchange(DRIVERS_EXCHANGE_3, 'fanout', {
            durable: true
        });

        await channel.assertExchange(EXPIRED_ORDERS_EXCHANGE, 'direct', { durable: true });
        await channel.assertQueue(EXPIRED_ORDERS_QUEUE, { durable: true });
        await channel.bindQueue(EXPIRED_ORDERS_QUEUE, EXPIRED_ORDERS_EXCHANGE, 'expired');

        // Setup Main Queue
        await channel.assertQueue(MAIN_QUEUE, {
            durable: true,
            arguments: {
                'x-message-ttl': 1800000,
                'x-dead-letter-exchange': ARCHIVE_EXCHANGE,
                'x-dead-letter-routing-key': ARCHIVE_ROUTING_KEY
            }
        });

        await channel.assertQueue(ARCHIVE_QUEUE_1, {
            durable: true
        });

        await channel.assertQueue(ARCHIVE_QUEUE_2, {
            durable: true
        });

        await channel.assertQueue(ARCHIVE_QUEUE_3, {
            durable: true
        });

        await channel.bindQueue(ARCHIVE_QUEUE_1, ARCHIVE_EXCHANGE, `${ARCHIVE_ROUTING_KEY}.1`);
        await channel.bindQueue(ARCHIVE_QUEUE_2, ARCHIVE_EXCHANGE, `${ARCHIVE_ROUTING_KEY}.2`);
        await channel.bindQueue(ARCHIVE_QUEUE_3, ARCHIVE_EXCHANGE, `${ARCHIVE_ROUTING_KEY}.3`);



        return channel;
    } catch (error) {
        console.error('Error setting up queues:', error);
        throw error;
    }
}

function getArchiveQueueByAlmacenId(almacenId) {
    switch (almacenId) {
        case 1:
            return {
                queue: ARCHIVE_QUEUE_1,
                routingKey: `${ARCHIVE_ROUTING_KEY}.1`
            };
        case 2:
            return {
                queue: ARCHIVE_QUEUE_2,
                routingKey: `${ARCHIVE_ROUTING_KEY}.2`
            };
        case 3:
            return {
                queue: ARCHIVE_QUEUE_3,
                routingKey: `${ARCHIVE_ROUTING_KEY}.3`
            };
        default:
            return {
                queue: ARCHIVE_QUEUE_1,  // Cola por defecto
                routingKey: `${ARCHIVE_ROUTING_KEY}.1`
            };
    }
}

function getDriverExchangeByAlmacenId(almacenId) {
    switch (almacenId) {
        case 1:
            return DRIVERS_EXCHANGE_1;
        case 2:
            return DRIVERS_EXCHANGE_2;
        case 3:
            return DRIVERS_EXCHANGE_3;
        default:
            return DRIVERS_EXCHANGE_1;
    }
}

async function getArchivedOrdersByStore(channel, almacenId) {
    const queueName = `pedidos_archive_${almacenId}`;
    const orders = [];
    let tempMessages = [];
    let msg;

    while ((msg = await channel.get(queueName, { noAck: false })) !== false) {
        try {
            const order = JSON.parse(msg.content.toString());
            orders.push(order);
            tempMessages.push({
                message: msg,
                content: msg.content
            });
            channel.ack(msg);
        } catch (error) {
            console.error(`Error parsing archived order from ${queueName}:`, error);
            channel.ack(msg);
        }
    }

    // Volver a publicar los mensajes
    for (const msg of tempMessages) {
        await channel.sendToQueue(queueName, msg.content, {
            persistent: true
        });
    }

    return orders;
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

function emitStoreEvent(order) {
    if (!order.AlmacenesPendientes || order.AlmacenesPendientes.length === 0) {
        return false;
    }

    // Obtener el almacén actual (segundo elemento o siguiente)
    const currentStore = order.AlmacenesPendientes[1]; // Tomamos el segundo elemento
    if (!currentStore) return false;

    // Actualizar el almacen_id en la orden
    order.almacen_id = currentStore.id;

    // Emitir evento específico para el almacén
    const eventName = `almacen${currentStore.id}`;
    io.emit(eventName, {
        ...order,
        current_store: currentStore.nombre_evento
    });

    return true;
}


async function setupExpiredOrdersConsumer() {
    try {
        if (!connection || !channel) {
            await setupConnection();
        }

        function processOrderRotation(order) {
            // Increment ID for rotation
            order.id = order.id + 1;

            // If no more stores in AlmacenesPendientes, set to null
            if (!order.AlmacenesPendientes || order.AlmacenesPendientes.length === 0) {
                order.AlmacenesPendientes = null;
            } else {
                // Update almacen_id with the first element
                order.almacen_id = order.AlmacenesPendientes[0];

                // Remove the first element from AlmacenesPendientes
                order.AlmacenesPendientes = order.AlmacenesPendientes.slice(1);

                // Send to main queue
                channel.sendToQueue(MAIN_QUEUE,
                    Buffer.from(JSON.stringify(order)),
                    { persistent: true }
                );

                console.log('Sent rotated order to main queue');
            }

            return order;
        }

        await channel.consume(EXPIRED_ORDERS_QUEUE, async (msg) => {
            if (msg) {
                try {
                    const order = JSON.parse(msg.content.toString());
                    processOrderRotation(order);

                    // Acknowledge the message
                    channel.ack(msg);
                } catch (error) {
                    console.error('Error processing order rotation:', error);
                    channel.nack(msg);
                }
            }
        }, { noAck: false });

        console.log('Consumer for expired orders queue set up');
    } catch (error) {
        console.error('Error setting up expired orders consumer:', error);
        throw error;
    }
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

        channel.consume(EXPIRED_ORDERS_QUEUE, async (msg) => {
            if (msg !== null) {
                try {
                    const order = JSON.parse(msg.content.toString());
                    console.log('Procesando pedido expirado:', order.id);

                    // Verificar si el pedido tiene almacenes pendientes
                    if (order.AlmacenesPendientes && order.AlmacenesPendientes.length > 0) {
                        const nextStore = order.AlmacenesPendientes[0];

                        // Crear pedido actualizado
                        const updatedOrder = {
                            ...order,
                            almacen_id: nextStore.id,
                            AlmacenesPendientes: order.AlmacenesPendientes,
                            rotated_at: new Date().toISOString(),
                            is_rotation: true,
                            current_store: nextStore
                        };

                        // Publicar en la cola principal para continuar el flujo
                        await channel.sendToQueue(
                            MAIN_QUEUE,
                            Buffer.from(JSON.stringify(updatedOrder)),
                            { persistent: true }
                        );

                        console.log(`Pedido ${order.id} reencolado en cola principal para rotación`);
                    } else {
                        console.log(`Pedido ${order.id} sin almacenes pendientes, finalizando flujo`);
                        // Aquí podrías emitir un evento de pedido finalizado si es necesario
                        io.emit('pedido_sin_almacenes', order);
                    }

                    channel.ack(msg);
                } catch (error) {
                    console.error('Error procesando pedido expirado:', error);
                    // Decidir si hacer reject o requeue según el tipo de error
                    channel.reject(msg, false);
                }
            }
        });

        // Consume from main queue
        channel.consume(MAIN_QUEUE, async (msg) => {
            if (msg !== null) {
                const order = JSON.parse(msg.content.toString());
                console.log('Nuevo pedido recibido:', order);

                // Verificar si hay almacenes pendientes
                if (order.AlmacenesPendientes && order.AlmacenesPendientes.length > 0) {
                    // Obtener el primer almacén pendiente
                    const currentStore = order.AlmacenesPendientes[0];
                    const eventName = currentStore.nombre_evento.toLowerCase().replace(' ', '_');

                    // Crear copia del pedido para modificar
                    const updatedOrder = { ...order };

                    // Actualizar la lista de almacenes pendientes
                    updatedOrder.AlmacenesPendientes = order.AlmacenesPendientes.slice(1);

                    // Agregar información del almacén actual
                    updatedOrder.current_store = currentStore;

                    console.log(`Emitiendo evento para: ${eventName}`);

                    const { routingKey } = getArchiveQueueByAlmacenId(order.almacen_id);
                    const driverExchange = getDriverExchangeByAlmacenId(order.almacen_id);

                    // Publish to archive and drivers exchanges
                    channel.publish(
                        ARCHIVE_EXCHANGE,
                        routingKey,
                        Buffer.from(JSON.stringify(updatedOrder)),
                        { persistent: true }
                    );

                    channel.publish(
                        DRIVERS_EXCHANGE,
                        '',  // fanout exchange doesn't need routing key
                        Buffer.from(JSON.stringify(updatedOrder)),
                        { persistent: true }
                    );

                    // Emitir el evento con el nombre del almacén
                    io.emit(eventName, updatedOrder);
                    console.log(`Evento ${eventName} emitido con éxito`);
                    console.log(updatedOrder);
                    console.log('Orden guardada en cola:', getArchiveQueueByAlmacenId(order.almacen_id).queue);
                } else {
                    console.log('No hay almacenes pendientes para este pedido');
                }

                channel.ack(msg);
            }
        });

        // Handle socket connections
        io.on('connection', async (socket) => {
            console.log(`Cliente conectado: ${socket.id}`);

            socket.on('register_driver', async (data) => {
                const almacenId = data.almacenId;
                const archiveQueue = `pedidos_archive_${almacenId}`;
                const driverExchange = `drivers_exchange_${almacenId}`;

                console.log(`Conductor registrado para almacén ${almacenId}`);

                // Create unique queue for this driver
                const driverQueue = `driver_queue_${socket.id}`;
                await channel.assertQueue(driverQueue, {
                    exclusive: true,
                    autoDelete: true
                });

                // Bind to store-specific exchange
                await channel.bindQueue(driverQueue, driverExchange, '');

                // Send initial orders from store-specific archive
                const archivedOrders = await getArchivedOrdersByStore(channel, almacenId);
                socket.emit('initial_orders', archivedOrders);

                // Setup consumer for this driver's queue
                channel.consume(driverQueue, (msg) => {
                    if (msg) {
                        const order = JSON.parse(msg.content.toString());
                        if (order.almacen_id === almacenId) {
                            socket.emit('new_order', order);
                        }
                        channel.ack(msg);
                    }
                });
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

            socket.on('pedido_rechazado', async (data) => {
                try {
                    const pedidoData = typeof data === 'string' ? JSON.parse(data) : data;
        
                    // Verificar si hay almacenes pendientes
                    if (pedidoData.AlmacenesPendientes && pedidoData.AlmacenesPendientes.length > 0) {
                        // Publicar en el exchange de pedidos expirados
                        await channel.publish(
                            EXPIRED_ORDERS_EXCHANGE,
                            'expired',
                            Buffer.from(JSON.stringify(pedidoData)),
                            { persistent: true }
                        );
        
                        console.log(`Pedido ${pedidoData.id} enviado a cola de expirados para rotación`);
        
                        // Notificar a todos los conductores que el pedido expiró globalmente
                        io.emit('pedido_expirado_global', {
                            pedidoId: pedidoData.id,
                            timestamp: new Date().toISOString()
                        });
                    } else {
                        console.log('No hay más almacenes disponibles');
                        io.emit('pedido_sin_almacenes', pedidoData);
                    }
                } catch (error) {
                    console.error('Error en manejo de pedido rechazado:', error);
                    socket.emit('error_rotation', {
                        error: error.message,
                        timestamp: new Date().toISOString()
                    });
                }
            });
        });

    } catch (error) {
        console.error('Error al configurar el consumidor:', error);
        setTimeout(setupConsumer, 10000);
    }
}


console.log("...cola d pedidos en stack.yml")
console.log(RABBITMQ_URL)



server.listen(PORT, async () => {
    console.log(`Microservice PEDIDO_DETALLE running http://localhost:${PORT}`);
    await setupConnection();
    await setupConsumer();
    //await setupExpiredOrdersConsumer(); // Add this line
});

export { app_micro_pedido, io, server };    