// gw_login_controller.js
import axios from 'axios';

const URLlogin = 'http://localhost:4004/api/v1/login';

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
