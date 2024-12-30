import express from "express";
import morgan from "morgan";
import { Server } from 'socket.io';
import amqp from 'amqplib';
import http from "http";
import routerPedido from "./routes/pedido_route.js";

const app_micro_pedido = express();
const server = http.createServer(app_micro_pedido);
const io = new Server(server, {
    reconnection: true,
    reconnectionAttempts: 10,  // Número máximo de intentos
    reconnectionDelay: 2000,  // Retardo entre intentos en milisegundos
    reconnectionDelayMax:2000
});
server.setTimeout(120000)

io.on('connection', (socket) => {
    console.log('Cliente conectado');
    //console.log("holaa");

    socket.on('disconnect', () => {
        console.log('Cliente desconectado');
    });

    // RECIBIENDO 
    socket.on('update_orders', (data) => {
        console.log('Recibiendo tiempo Real',data)
    })}


);


const PORT = 5001;
const RABBITMQ_URL = 'amqp://localhost';
const QUEUE_NAME = 'colaPedidoRabbit';

let pendingOrders = [];

app_micro_pedido.use(morgan('combined'));
app_micro_pedido.use(express.json());
app_micro_pedido.use('/api/v1', routerPedido);

async function setupConsumer() {
console.log("....CONSUMER......")
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();
        await channel.assertQueue(QUEUE_NAME, { durable: true });

        console.log('Esperando pedidos...');
        
        channel.consume(QUEUE_NAME, (msg) => {
            if (msg !== null) {
                console.log("....encolando")
                const order = JSON.parse(msg.content.toString());
                console.log('Nuevo pedido recibido:', order);
                pendingOrders.push(order);
                io.emit('update_orders', pendingOrders);
                channel.ack(msg);
            }
        });

        connection.on('error', (error) => {
            console.error('Error de conexión RabbitMQ:', error);
            setTimeout(setupConsumer, 10000);
        });
    } catch (error) {
        console.error('Error al configurar el consumidor:', error);
        setTimeout(setupConsumer, 10000);
    }
}



// Use server.listen instead of app_micro_pedido.listen
server.listen(PORT, () => {
    console.log(`Microservice PEDIDO_DETALLE running http://127.0.0.1:${PORT}`);
    
    setupConsumer();
});

export { app_micro_pedido ,io, server};