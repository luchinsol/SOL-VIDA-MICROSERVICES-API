/*const express = require ("express")
const jwt = require("jsonwebtoken")

const app = express()

app.get("/api",(req,res)=>{
    res.json({
        mensaje:"Node js jwt"
    })
})

app.post("/api/login",(req,res)=>{
    const user = {
        "id":1,
        "user":"Luis",
        "email":"luchin@gmail.com"
    }
    jwt.sign({user:user},'claveKey',{expiresIn:'30s'},(err,token)=>{
        res.json({
            token:token,

        })
    })
   // res.json(user)
})
// RUTA DE USUARIO
app.post("/api/posts",verificarToken,(req,res)=>{
    
    jwt.verify(req.token,'claveKey', (error,authData)=>{
        if(error){
            res.sendStatus(403)
        }
        else{
            res.json({mensaje:"POST fue creado",
                authData:authData
            })
        }
    })
    
    
})

// Authorization: Bearer
function verificarToken(req,res,next){
    const BearerHeader = req.headers['authorization']
    if(typeof BearerHeader !== 'undefined'){
       const BearerToken = BearerHeader.split(" ")[1]
       req.token =BearerToken
       next() 
    }
    else{
        // acceso prohibido
        res.sendStatus(403)
    }
}

//// INICIO
app.listen(3000,function(){
    console.log("api running...")
})*/

// gateway.mjs
import express from 'express';
import jwt from 'jsonwebtoken';
import morgan from 'morgan'; // Importa Morgan
import cors from 'cors';
import amqp from 'amqplib';
import http from "http";
import { Server } from "socket.io";

// routes
import routerGWCliente from './routes/gw_cliente_route.js';
import routerGWPedido from './routes/gw_pedido_route.js';
import routerGWConductor from './routes/gw_conductor_route.js'
import routerGWUbicacion from './routes/gw_ubicacion_route.js'
import routerIntegracion from './routes/gw_integracion_route.js';
import routerGWAlmacen from './routes/gw_almacen_routes.js';
import routerGWAlmacenZona from './routes/gw_almacen_zona_trabajo_route.js';
import routerGWLogin from './routes/gw_login_route.js';
import { createClient } from 'redis';

//import { startConsumer } from './controllers/gw_pedido_controllers.js';

// Configuración de Redis
const redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`,
    //url: 'redis://127.0.0.1:6379',
    socket: {
        reconnectStrategy: (retries) => {
            const delay = Math.min(retries * 100, 3000); // Máximo 3 segundos entre reconexiones
            console.log(`Attempting to reconnect to Redis... Retry #${retries}`);
            return delay;
        }
    }
});

// Eventos para manejar la conexión de Redis
redisClient.on('connect', () => console.log('Connected to Redis'));
redisClient.on('reconnecting', () => console.log('Reconnecting to Redis...'));
redisClient.on('end', () => console.log('Redis connection closed'));
redisClient.on('error', (err) => console.error('Redis error:', err));

// Conecta el cliente de Redis con manejo de errores
async function connectRedis() {
    try {
        await redisClient.connect();
    } catch (err) {
        console.error('Redis initial connection error:', err);
        // Intentar reconectar en caso de error inicial
        setTimeout(connectRedis, 3000);
    }
}
//connectRedis();

const app = express();
const server = http.createServer(app);
/*
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    },
    pingTimeout: 60000,
    pingInterval: 25000
});
let pendingOrders = [];
const RABBITMQ_URL = 'amqp://localhost';
const QUEUE_NAME = 'colaPedidoRabbit';

async function setupConsumer() {
    try {
        const connection = await amqp.connect(RABBITMQ_URL);
        const channel = await connection.createChannel();

        await channel.assertQueue(QUEUE_NAME, { durable: true });

        console.log('Gateway: Esperando pedidos en RabbitMQ...');

        channel.consume(QUEUE_NAME, async (msg) => {
            if (msg) {
                try {
                    const order = JSON.parse(msg.content.toString());
                    console.log('Nuevo pedido recibido:', order);

                    // Agregar timestamp y almacenar pedido
                    const orderWithTimestamp = {
                        ...order,
                        timestamp: new Date().toISOString()
                    };
                    pendingOrders.push(orderWithTimestamp);

                    // Emitir el evento a todos los clientes conectados
                    io.emit('orders_updated', {
                        status: 'success',
                        action: 'new_order',
                        data: pendingOrders,
                        lastOrder: orderWithTimestamp,
                        message: 'Nuevo pedido recibido'
                    });

                    // No se confirma el mensaje (ack) para simplificar la prueba
                } catch (error) {
                    console.error('Error procesando el mensaje:', error);
                }
            }
        });

        connection.on('close', () => {
            console.error('Conexión a RabbitMQ cerrada, intentando reconectar...');
            setTimeout(setupConsumer, 5000);
        });

        connection.on('error', (err) => {
            console.error('Error de conexión a RabbitMQ:', err);
        });
    } catch (error) {
        console.error('Error configurando consumidor de RabbitMQ:', error);
        setTimeout(setupConsumer, 5000);
    }
}


io.on('connection', (socket) => {
    console.log(`Cliente conectado: ${socket.id}`);

    // Enviar pedidos iniciales al cliente
    socket.emit('orders_updated', {
        status: 'success',
        action: 'initial_load',
        data: pendingOrders,
        message: 'Cargando pedidos iniciales'
    });

    // Evento para refrescar los pedidos
    socket.on('get_orders', () => {
        socket.emit('orders_updated', {
            status: 'success',
            action: 'refresh',
            data: pendingOrders,
            message: 'Pedidos actualizados'
        });
    });

    // Manejo de desconexión
    socket.on('disconnect', () => {
        console.log(`Cliente desconectado: ${socket.id}`);
    });
});*/
/*
const server = http.createServer(app);
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

    socket.on('update_orders', () => {
        console.log('Cliente desconectado');
    });

    socket.on('new_order', (data) => {
        //console.log(data);
        console.log("---->>> ENTRE A SOCKET.IO ------>>");
        io.emit('En tiempo real Pedido :)', data);
    });

    io.emit('testy')

    /*  io.engine.on('upgrade', (request, socket, head) => {
          console.log('Upgrade request');
      });


});
*/

const SECRET_KEY = 'aguasol'; // Usa la misma clave que en el microservicio de autenticación
app.use(cors())
app.use(express.json());

// Usa Morgan para registrar las solicitudes
app.use(morgan('combined'));

// Middleware para verificar el token
function verificarToken(req, res, next) {
    if (req.path === '/apigw/v1/login' || req.path === '/apigw/v1/user') {
        return next();
    }
    
    const BearerHeader = req.headers['authorization'];
    if (typeof BearerHeader !== 'undefined') {
        const BearerToken = BearerHeader.split(" ")[1];
        
        // Verifica el token utilizando jwt.verify
        jwt.verify(BearerToken, SECRET_KEY, (err, decoded) => {
            if (err) {
                return res.sendStatus(403); // Acceso prohibido
            }
            
            req.user = decoded.user;
            next();
        });
    } else {
        res.sendStatus(403);
    }
}

// ROUTES GW
app.use(verificarToken, routerGWCliente);
app.use(verificarToken, routerGWPedido);
app.use(verificarToken, routerGWConductor);
app.use(verificarToken, routerGWUbicacion);
app.use(verificarToken, routerIntegracion);
app.use(verificarToken, routerGWAlmacen);
app.use(verificarToken, routerGWAlmacenZona);
app.use(routerGWLogin);

const PORT = 3000;
app.listen(PORT, async () => {
    console.log(`API Gateway running http://localhost:${PORT}`);
    //await setupConsumer();
    /*
    try {
        //await startConsumer();
        console.log('Consumidor de RabbitMQ iniciado correctamente');
    } catch (error) {
        console.error('Error al iniciar el consumidor de RabbitMQ:', error);
    }
    */
});

//export default{ app, io, server,redisClient };
export default redisClient;

