import axios from 'axios';
import redisClient from '../index.js';
import dotenv from 'dotenv'

dotenv.config()

const service_conductor = process.env.MICRO_CONDUCTOR

export const getConductoresControllerGW = async (req, res) => {
    console.log("......get conductor controller");
    const cacheKey = 'conductores_cache';
    try {
        console.log("........Intentando obtener datos de Redis");
        let cachedData;
        try {
            cachedData = await redisClient.get(cacheKey);
            console.log("Datos de caché:", cachedData);
        } catch (redisError) {
            console.error("Error al obtener datos de Redis:", redisError.message);
        }

        if (cachedData) {
            return res.status(200).json(JSON.parse(cachedData));
        }

        const response = await axios.get(`${service_conductor}/conductor`);
        console.log("Respuesta de la API de pedidos:", response.data);

        if (response && response.data) {
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
        res.status(500).send('Error fetching conductores');
    }
};

//Info Conductor
export const getConductoresControllerIdGW = async (req,res) => {
    
    // REDIS
    const cacheKey = `conductor_id_cache`; // Clave específica por ID
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
        console.log(`${service_conductor}/conductor/${id}`)
        const response = await axios.get(`${service_conductor}/conductor/${id}`)
        console.log(response.data,"---------------client id")
        if(response && response.data){

            try {
                await redisClient.setEx(cacheKey,3600,JSON.stringify(response.data))
            } catch (redisSetError) {
                console.error("Error al guardar datos en Redis:",redisSetError.message)
            }
            res.status(200).json(response.data);
        }else{
            res.status(404).json({ message: 'Not found '})
        }

    } catch (error) {
        res.status(500).json({error:error.message})
    }

}

export const postConductoresControllerGW = async (req, res) => {
    try {
        const response = await axios.post(`${service_conductor}/conductor`, req.body);
        if (response) {
            res.status(201).json(response.data);
        } else {
            res.status(400).json({ message: 'Invalid input data' });
        }
    } catch (error) {
        res.status(500).send('Error creating order');
    }
};  


export const putConductoresControllerGW = async (req, res) => {
    try {
        const { id }= req.params
        console.log(id,".....id")
        console.log(`${service_conductor}/conductor/${id}`)
        const response = await axios.put(`${service_conductor}/conductor/${id}`, req.body);
        console.log(response.data,"---------conductores id")
        if (response) {
            res.status(201).json(response.data);
        } else {
            res.status(400).json({ message: 'Invalid input data' });
        }
    } catch (error) {
        res.status(500).send('Error creating driver');
    }
};  

export const deleteConductoresControllerGW = async (req, res) => {
    try {
        const { id }= req.params
        console.log(id,".....id")
        console.log(`${service_conductor}/conductor/${id}`)
        const response = await axios.delete(`${service_conductor}/conductor/${id}`);
        console.log(response.data,"---------conductores id")
        if (response) {
            res.status(201).json(response.data);
        } else {
            res.status(400).json({ message: 'Invalid input data' });
        }
    } catch (error) {
        res.status(500).send('Error creating order');
    }
};  

export const getEventoConductores = async (req,res) => {
    // AXIOS - BD
    try {
        const { id } = req.params
        console.log(id,".....id")
        //console.log(`${service_conductor}/conductor_evento/${id}`)
        const response = await axios.get(`${service_conductor}/conductor_evento/${id}`)
        //console.log(response.data,"---------------client id")
        if(response && response.data){
            res.status(200).json(response.data);
        }else{
            res.status(404).json({ message: 'Not found '})
        }

    } catch (error) {
        res.status(500).json({error:error.message})
    }
}





