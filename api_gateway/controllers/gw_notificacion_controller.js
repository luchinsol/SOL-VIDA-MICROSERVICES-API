import axios from 'axios'
import dotenv from 'dotenv'
dotenv.config()

const service_notificacion = process.env.MICRO_NOTIFICACION

export const getNotificacionAlmacenGW = async (req,res) => {
    try{
        const {fecha,id} = req.params
        const response = await axios.get(`${service_notificacion}/notificacion/${fecha}/${id}`)
        if(response && response.data){
            res.status(200).json(response.data)
        }
    }catch(error){
        if(error.response && error.response.status === 404){
            res.status(404).json({message:'Id not found'})
        }
        else{
            res.status(500).json({error:error.message})
        }
    }
}

export const postNotificacionAlmacenGW = async (req,res)=>{
    try {
        const data = req.body
        const response = await axios.post(`${service_notificacion}/notificacion`,response)
        if(response && response.data){
            res.status(201).json(response.data)
        }
        else{
            res.status(400).json({message:"Invalid input data"})
        }
    } catch (error) {
        res.status(500).json({error:error.message})
    }
}