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
        const response = await axios.post(`${service_notificacion}/notificacion`,data)
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


export const getNotificacionClienteGW = async (req, res) => {
    try {
        const { fecha } = req.params;
        const response = await axios.get(`${service_notificacion}/notificacion_cliente/${fecha}`);

        if (response && response.data) {
            const formattedData = response.data.map(item => {
                // Asegurarse de que el formato sea compatible con Date
                const dateTimeString = item.fecha.replace(' ', 'T'); // "2025-05-19T10:47:29.817"
                const dateObj = new Date(dateTimeString);

                // Extraer fecha como YYYY/MM/DD
                const year = dateObj.getFullYear();
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const day = String(dateObj.getDate()).padStart(2, '0');
                const formattedFecha = `${year}/${month}/${day}`;

                // Extraer hora como HH:mm:ss
                const hours = String(dateObj.getHours()).padStart(2, '0');
                const minutes = String(dateObj.getMinutes()).padStart(2, '0');
                const seconds = String(dateObj.getSeconds()).padStart(2, '0');
                const formattedHora = `${hours}:${minutes}:${seconds}`;

                return {
                    id: item.id,
                    foto: item.foto,
                    titulo: item.titulo,
                    fecha: formattedFecha,
                    hora: formattedHora,
                    descripcion: item.descripcion
                };
            });

            res.status(200).json(formattedData);
        }
    } catch (error) {
        if (error.response && error.response.status === 404) {
            res.status(404).json({ message: 'Id not found' });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
};



export const postNotificacionClienteGW = async (req,res)=>{
    try {
        const data = req.body
        const response = await axios.post(`${service_notificacion}/notificacion_cliente`,data)
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