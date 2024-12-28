import axios from "axios";
import redisClient from "../index.js";
const URLalmacen = "http://localhost:5015/api/v1/almacen"; //'http://localhost:5000/api/v1/pedido';
/*
export const getAlmacenControllerIdGW = async (req,res) => {
    
    // REDIS
    const cacheKey = `almacen_id_cache`; // Clave específica por ID
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
        //console.log(id,".....id")
        //console.log(`${URLalmacen}/${id}`)
        const response = await axios.get(`${URLalmacen}/${id}`)
        console.log(response.data,"---------------ubicacion id")
        console.log("....DATA")
        console.log(response)
        if(response && response.data){

         /*   try {
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

};
*/

// ****************************************

export const getAlmacenControllerIdGW = async (req, res) => {
  try {
    const { id } = req.params;

    const response = await axios.get(`${URLalmacen}/${id}`);

    if (response && response.data) {
      res.status(200).json(response.data);
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      res.status(404).json({ message: "Id not found" });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

/// *********************************************

export const getAlmacenControllerGW = async (req, res) => {
  const cacheKey = "almacen_cache";

  // REDIS
  /* let cacheData;
     try {
         cacheData = await redisClient.get(cacheKey)
         console.log("Dato de caché", cacheData)
     } catch (redisError) {
         console.error("Error al obtener datos de Redis:", redisError.message)
     }
 
     //VERIFICAR DATA CACHE
     if (cacheData) {
         return res.status(200).json(JSON.parse(cacheData))
     }*/

  try {
    const response = await axios.get(URLalmacen);
    if (response && response.data) {
      /* try {
                 await redisClient.setEx(cacheKey, 3600, JSON.stringify(response.data))
             } catch (redisSetError) {
                 console.error("Error al guardar datos en Redis:", redisSetError.message)
             }*/
      res.status(200).json(response.data);
    } else {
      res.status(404).json({ message: "Not Found" });
    }
  } catch (error) {
    res.status(500).send("Error fetching clients");
  }
};

export const postAlmacenControllerGW = async (req, res) => {
  try {
    const response = req.body;
    console.log(response, "<--------------data POST api gw");

    const resultado = await axios.post(URLalmacen, response);
    console.log(resultado, "<------------micro almacen API GW");
    if (resultado && resultado.data) {
      res.status(201).json(resultado.data);
    } else {
      res.status(400).json({ message: "Invalid input data" });
    }
  } catch (error) {
    console.log("----ERROR API GW");
    res.status(500).json({ error: error.message });
  }
};

export const putClienteControllerGW = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id, "....id");
    console.log(`${URLalmacen}/${id}`);
    const response = await axios.put(`${URLalmacen}/${id}`, req.body);
    console.log(response.data, "<--------------data POST api gw");
    if (response) {
      res.status(201).json(resultado.data);
    } else {
      res.status(400).json({ message: "Invalid input data" });
    }
  } catch (error) {
    res.status(500).send("Error Modificar Cliente");
  }
};

export const deleteClienteControllerGW = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id, ".....id");
    console.log(`${URLalmacen}/${id}`);
    const response = await axios.delete(`${URLalmacen}/${id}`);
    console.log(response.data, "---------conductores id");
    if (response) {
      res.status(201).json(response.data);
    } else {
      res.status(400).json({ message: "Invalid input data" });
    }
  } catch (error) {
    res.status(500).send("Error creating order");
  }
};
