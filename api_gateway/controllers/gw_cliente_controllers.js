import axios from 'axios';
import redisClient from '../index.js';
import amqp from 'amqplib';
import dotenv from 'dotenv'
dotenv.config()


const service_cliente = process.env.MICRO_CLIENTE
const service_producto = process.env.MICRO_PRODUCTO
console.log(service_cliente)

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
        const response = await axios.get(`${service_cliente}/cliente`);
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
        console.log(`${service_cliente}/cliente/${id}`)
        const response = await axios.get(`${service_cliente}/cliente/${id}`)
        console.log(response.data,"---------------client id")
        if(response && response.data){

            try {
                await redisClient.setEx(cacheKey,3600,JSON.stringify(response.data))
            } catch (redisSetError) {
                console.error("Error al guardar datos en Redis:",redisSetError.message)
            }
          //  await sendToQueue('clientes_queue', response.data);
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

        const resultado = await axios.post(`${service_cliente}/cliente`,response)
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
        console.log(`${service_cliente}/cliente/${id}`)
        const response = await axios.put(`${service_cliente}/cliente/${id}`,req.body)
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

export const putClienteCalificationControllerGw = async (req,res) =>{
    try {
        console.log("...hola")
        const {id} = req.params
        const body = req.body
        console.log(id)
        console.log(body)
        const response = await axios.put(`${service_cliente}/cliente_calificacion/${id}`,body)
        console.log(".....PUT...")
        console.log(response.data)
        if(response){
            res.status(200).json(response.data)
        }
        else{
            res.status(400).json({message:'Invalid input data'})
        }
    } catch (error) {
        res.status(500).send('Error Calificar Cliente')
    }
}

export const deleteClienteControllerGW = async (req, res) => {
    try {
        const { id }= req.params
        console.log(id,".....id")
        console.log(`${service_cliente}/cliente/${id}`)
        const response = await axios.delete(`${service_cliente}/cliente/${id}`);
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

//CONTROLLER QUE ME PERMITE INGRESAR UNA VALORACION
export const postValoracionControllerGW = async (req, res) => {
    try {
      const data = req.body;
  
      // 1. Insertar la nueva valoración
      const resultado = await axios.post(`${service_cliente}/calificacion`, data);
  
      if (!resultado.data) {
        return res.status(400).json({ message: 'La respuesta del servicio no contiene datos válidos' });
      }
  
      let promedio = null;
  
      // 2. Consultar promedio dependiendo del tipo
      if (resultado.data.producto_id) {
        const resProm = await axios.get(`${service_cliente}/calificacion_promedio_producto/${resultado.data.producto_id}`);
        promedio = resProm.data.promedio_calificacion;
        const actualizarProducto = await axios.put(`${service_producto}/actualizar_valoracion_producto/${resultado.data.producto_id}`,promedio)

    } else if (resultado.data.promocion_id) {
        const resProm = await axios.get(`${service_cliente}/calificacion_promedio_promocion/${resultado.data.promocion_id}`);
        promedio = resProm.data.promedio_calificacion;
        const actualizarPromocion = await axios.put(`${service_producto}/actualizar_valoracion_promocion/${resultado.data.promocion_id}`,promedio)    
    }
  
      // 3. Retornar valoración y promedio
      res.status(201).json({
        ...resultado.data,
        promedio: promedio ?? null
      });
  
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };


//CONTROLLER QUE ME TRAE UNICAMENTE LA CANTIDAD DE CLIENTES QUE REALIZARON UNA RESEÑA DE UN PRODUCTO
export const getCalificacionProductoControllerIdGW = async (req, res) => {
    try {
      const { id } = req.params;
  
      const response = await axios.get(`${service_cliente}/calificacion_count_producto/${id}`);
  
      if (!response.data || response.data.total_valoraciones === undefined) {
        return res.status(404).json({ message: "Datos no encontrados" });
      }
  
      res.status(200).json({
        producto_id: id,
        total_valoraciones: response.data.total_valoraciones
      });
  
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  

//CONTROLLER QUE ME TRAE UNICAMENTE LA CANTIDAD DE CLIENTES QUE REALIZARON UNA RESEÑA DE UNA PROMOCION
export const getCalificacionPromocionControllerIdGW = async (req, res) => {
    try {
      const { id } = req.params;
  
      const response = await axios.get(`${service_cliente}/calificacion_count_promocion/${id}`);
  
      if (!response.data || response.data.total_valoraciones === undefined) {
        return res.status(404).json({ message: "Datos no encontrados" });
      }
  
      res.status(200).json({
        promocion_id: id,
        total_valoraciones: response.data.total_valoraciones
      });
  
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }; 