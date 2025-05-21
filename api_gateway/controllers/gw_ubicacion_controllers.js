import axios from 'axios';
import redisClient from '../index.js';
import dotenv from 'dotenv'

dotenv.config()

const service_ubicacion = process.env.MICRO_UBICACION

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
        console.log(`${service_ubicacion}/ubicacion/${id}`)
        const response = await axios.get(`${service_ubicacion}/ubicacion/${id}`)
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

export const ubicacionClienteControllerGW = async (req,res) => {
    try{
        //LLAMADA AL MICROSERVICIO DE UBICACION PARA LA INSERCIÓN DE REGISTROS CON SU BODY RESPECTIVO
        const response = await axios.post(
            `${service_ubicacion}/ubicacion_cliente`,
            req.body
        );
        if (response){
            res.status(201).json(response.data);
        } else{
            res.status(400).json({ message: "Invalid input data"});
        }
    } catch(error){
        res.status(500).send("Error creating location");
    }
};

//ENDPOINT QUE TRAE LA UBICACION DEL CLIENTE QUE INGRESO EN SU APP
export const getUltimaUbicacionClienteControllerGW = async (req,res) => {
    //TRAER LA ULTIMA UBICACION DEL CLIENTE 
    try {
        const { id } = req.params
        const response = await axios.get(`${service_ubicacion}/ultima_ubicacion/${id}`)
        if (response){
            res.status(200).json(response.data);
        } else{
            res.status(400).json({ message: "Invalid input data"});
        }

    } catch (error) {
        res.status(500).json({error:error.message})
    }

}


//ENDPOINT QUE SIRVE PARA ACTUALIZAR LA UBICACIÓN DEL CLIENTE QUE INGRESO EN SU APP
export const actualizarUltimaUbicacionClienteControllerGW = async (req,res) => {
        try {
          const { id } = req.params;
          const response = await axios.put(
            `${service_ubicacion}/actualizar_ubicacion/${id}`,
            req.body
          );
         
          if (response) {
            res.status(201).json(response.data);
          } else {
            res.status(400).json({ message: "Invalid put data" });
          }
        } catch (error) {
          res.status(500).send("Error PUT cliente");
        }
}



//ENDPOINT QUE TRAE TODAS LAS UBICACIONES REGISTRADAS POR EL CLIENTE EN SU APP
export const getAllUbicacionesClienteControllerGW = async (req,res) => {
    //TRAER LA ULTIMA UBICACION DEL CLIENTE 
    try {
        const { cliente } = req.params
        const response = await axios.get(`${service_ubicacion}/all_ubicacion/${cliente}`)
        if (response){
            res.status(200).json(response.data);
        } else{
            res.status(400).json({ message: "Invalid input data"});
        }

    } catch (error) {
        res.status(500).json({error:error.message})
    }

}