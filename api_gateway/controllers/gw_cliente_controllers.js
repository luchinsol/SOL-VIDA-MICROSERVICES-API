import axios from 'axios';
import redisClient from '../index.js';
import amqp from 'amqplib';

const URLcliente = 'http://localhost:5002/api/v1/cliente';
const URLuser = 'http://microservice_auth:5000/api/v1/user';
const QUEUE_PEDIDOS = 'pedidos_queue';
const QUEUE_CLIENTE_PEDIDOS = 'cliente_pedidos_queue';

const sendToQueue = async (queue, message) => {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();
    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    console.log(`Mensaje enviado a la cola ${queue}:`, message);
    await channel.close();
    await connection.close();
};

export const getClientesControllerGW = async (req, res) => {
    const cacheKey = 'clientes_cache'

    // REDIS    
    let cacheData;
    try {
        cacheData = await redisClient.get(cacheKey)
        console.log("Dato de caché", cacheData)
    } catch (redisError) {
        console.error("Error al obtener datos de Redis:", redisError.message)
    }

    //VERIFICAR DATA CACHE
    if (cacheData) {
        return res.status(200).json(JSON.parse(cacheData))
    }



    try {
        const response = await axios.get(URLcliente);
        if (response && response.data) {
            try {
                await redisClient.setEx(cacheKey, 3600, JSON.stringify(response.data))
            } catch (redisSetError) {
                console.error("Error al guardar datos en Redis:", redisSetError.message)
            }
            res.status(200).json(response.data);
        } else {
            res.status(404).json({ message: 'Not Found' });
        }
    } catch (error) {
        res.status(500).send('Error fetching clients');
    }
};

export const getClientesControllerIdGW = async (req,res) => {
    
    // REDIS
    const cacheKey = `cliente_id_cache`; // Clave específica por ID
    let cacheData; 
    
    try {
        cacheData = await redisClient.get(cacheKey)
        console.log("Dato de caché:",cacheData)
    } catch (redisError) {
        console.error("Error al obtener datos de Redis:",redisError.message)
    }

    if(cacheData){
        return res.status(200).json(JSON.parse(cacheData))
    }

    // AXIOS - BD
    try {
        const { id } = req.params
        console.log(id,".....id")
        console.log(`${URLcliente}/${id}`)
        const response = await axios.get(`${URLcliente}/${id}`)
        console.log(response.data,"---------------client id")
        if(response && response.data){

            try {
                await redisClient.setEx(cacheKey,3600,JSON.stringify(response.data))
            } catch (redisSetError) {
                console.error("Error al guardar datos en Redis:",redisSetError.message)
            }
            await sendToQueue('clientes_queue', response.data);
            res.status(200).json(response.data);
        }else{
            res.status(404).json({ message: 'Not found '})
        }

    } catch (error) {
        res.status(500).json({error:error.message})
    }

}

export const postClienteControllerGW = async (req,res) => {
    try {
        const response = req.body
        console.log(response,"<--------------data POST api gw")

        const resultado = await axios.post(URLcliente,response)
        console.log(resultado,"<------------micro cliente API GW")
        if(resultado && resultado.data){
            res.status(201).json(resultado.data)
        }
        else{
            res.status(400).json({message:'Invalid input data'})
        }
        
    } catch (error) {
        console.log("----ERROR API GW")
        res.status(500).json({error:error.message})
    }
}


export const putClienteControllerGW = async (req,res) => {
    try {
        const {id}= req.params
        console.log(id,"....id")
        console.log(`${URLcliente}/${id}`)
        const response = await axios.put(`${URLcliente}/${id}`,req.body)
        console.log(response.data,"<--------------data POST api gw")
        if(response){
            res.status(200).json(resultado.data)
        }
        else{
            res.status(400).json({message:'Invalid input data'})
        }
        
    } catch (error) {
        res.status(500).send('Error Modificar Cliente')
    }
}

export const deleteClienteControllerGW = async (req, res) => {
    try {
        const { id }= req.params
        console.log(id,".....id")
        console.log(`${URLcliente}/${id}`)
        const response = await axios.delete(`${URLcliente}/${id}`);
        console.log(response.data,"---------conductores id")
        if (response) {
            res.status(200).json(response.data);
        } else {
            res.status(404).json({ message: 'Invalid input data' });
        }
    } catch (error) {
        res.status(500).send('Error creating order');
    }
};  
