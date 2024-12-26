import axios from 'axios';
import redisClient from '../index.js';
const URLubicacion = 'http://localhost:4009/api/v1/ubicacion';//'http://localhost:5000/api/v1/pedido';

export const getUbicacionesControllerIdGW = async (req,res) => {
    
    // REDIS
    const cacheKey = `ubicacion_id_cache`; // Clave específica por ID
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
        console.log(`${URLubicacion}/${id}`)
        const response = await axios.get(`${URLubicacion}/${id}`)
        console.log(response.data,"---------------ubicacion id")
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

