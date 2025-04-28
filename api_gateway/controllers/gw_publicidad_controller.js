import axios from 'axios';
import redisClient from '../index.js';
import dotenv from 'dotenv'

dotenv.config()

const service_publicidad = process.env.MICRO_PUBLICIDAD

export const getPublicidadControllerGW = async (req,res) => {
    try{
        const response = await axios.get(`${service_publicidad}/publicidad_banners`)
        if (response){
            res.status(200).json(response.data);
        }else{
            res.status(400).json({message: "Invalid input data"});
        }
    }catch(error){
        res.status(500).json({error:error.message})
    }
}