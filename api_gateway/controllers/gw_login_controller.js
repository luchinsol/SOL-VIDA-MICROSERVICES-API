// gw_login_controller.js
import axios from 'axios';
import dotenv from 'dotenv';

// Carga las variables de entorno del archivo .env
dotenv.config();

const service_auth = process.env.MICRO_AUTH
console.log(service_auth)

export const postLoginController = async (req, res) => {
    try {
        const credenciales = req.body;
        const response = await axios.post(`${service_auth}/login`, credenciales);
        //console.log("response----------",response)
        if (response && response.data.tokenUser) {
            // Envía el token al cliente
            res.status(201).json({ user: response.data.userData, token: response.data.tokenUser });
        } else {
            res.status(400).json({ message: 'Invalid input data' });
        }
    } catch (error) {
        res.status(500).send('Error fetching clients');
    }
};

export const postUserExistController = async (req,res) => {
    try {
        console.log("........dentro del exist user GW")
        const credenciales  = req.body
        const response = await axios.post(`${service_auth}/user`,credenciales)
        const userExist = response.data
        if(userExist.message == 'User exist!'){
            res.status(201).json({message:response.data.message})
        }
        else if(userExist.message == 'User new'){
            res.status(201).json({message:response.data.message})
        }
    } catch (error) {
        res.status(500).send('Error fetching clients');

    }
}
