import express from "express";
import cors from 'cors';
import morgan from "morgan";
import { createServer } from 'http';
import { Server } from 'socket.io';
import amqp from 'amqplib';

// IMPORT ROUTES
import routerPedido from "./routes/pedido_route.js";


const app_micro_pedido = express()
const server = createServer(app_micro_pedido);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});




const PORT = 5001
const RABBITMQ_URL = 'amqp://localhost';
const QUEUE_NAME = 'new_orders';

// Lista de pedidos pendientes en memoria
let pendingOrders = [];

app_micro_pedido.use(cors())
app_micro_pedido.use(morgan('combined'))
app_micro_pedido.use(express.json())

app_micro_pedido.use('/api/v1',routerPedido)

async function setupConsumer() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });

        console.log('Esperando pedidos...');
        
        channel.consume(QUEUE_NAME, (msg) => {
            if (msg !== null) {
                const order = JSON.parse(msg.content.toString());
                console.log('Nuevo pedido recibido:', order);

                // Agregar pedido a la lista de pendientes
                pendingOrders.push(order);

                // Emitir evento para actualizar a todos los clientes
                //io.emit('new_order', order);
                io.emit('update_orders', pendingOrders);

                // Confirmar el mensaje
                channel.ack(msg);
            }
        });

        // Manejo de errores de conexión
        connection.on('error', (error) => {
            console.error('Error de conexión RabbitMQ:', error);
            setTimeout(setupConsumer, 10000); // Reintentar conexión después de 5 segundos
        });

    } catch (error) {
        console.error('Error al configurar el consumidor:', error);
        setTimeout(setupConsumer, 10000); // Reintentar conexión después de 5 segundos
    }
}

// Configuración de Socket.IO
io.on('connection', (socket) => {
    console.log('Cliente conectado');
    
    // Enviar pedidos pendientes al cliente cuando se conecta
    socket.emit('pending_orders', pendingOrders);

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });
});


// MANEJO DE ERRORES
/*app_micro_pedido.use('/api', (req, res) => {
    //console.log("---no esta esa ruta")
    res.status(404).json({ error: 'Ruta no encontrada' });

});
// Manejo de errores
function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }
    res.status(500).json({ error: 'Error interno del servidor' });
}*/

app_micro_pedido.listen(PORT,()=>{
    console.log(`Microservice PEDIDO_DETALLE running http://localhost:${PORT}`)
    setupConsumer().catch(console.error);
})

export {app_micro_pedido}