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

// routes
import routerGWCliente from './routes/gw_cliente_route.js';
import routerGWPedido from './routes/gw_pedido_route.js';
import routerGWLogin from './routes/gw_login_route.js';

import { createClient } from 'redis';

// Configuración de Redis
const redisClient = createClient({
    url: 'redis://127.0.0.1:6379',
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
connectRedis();

const app = express();
const SECRET_KEY = 'aguasol'; // Usa la misma clave que en el microservicio de autenticación
app.use(express.json());

// Usa Morgan para registrar las solicitudes
app.use(morgan('combined'));

// Middleware para verificar el token
function verificarToken(req, res, next) {
    if (req.path === '/apigw/v1/login') {
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
app.use(routerGWLogin);

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`API Gateway running http://localhost:${PORT}`);
});

export default redisClient;

