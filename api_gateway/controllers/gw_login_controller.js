// gw_login_controller.js
import axios from 'axios';

const URLlogin = 'http://localhost:5004/api/v1/login';//'http://microservice_auth:5000/api/v1/login';
const URLuser = 'http://microservice_auth:5000/api/v1/user';//'http://microservice_auth:5000/api/v1/user';


export const postLoginController = async (req, res) => {
    try {
        const credenciales = req.body;
        const response = await axios.post(URLlogin, credenciales);
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
        const response = await axios.post(URLuser,credenciales)
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
