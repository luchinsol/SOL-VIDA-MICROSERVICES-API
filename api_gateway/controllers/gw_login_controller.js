// gw_login_controller.js
import axios from "axios";
import dotenv from "dotenv";

// Carga las variables de entorno del archivo .env
dotenv.config();

const service_auth = process.env.MICRO_AUTH;
const service_cliente = process.env.MICRO_CLIENTE;
const service_conductor = process.env.MICRO_CONDUCTOR;
console.log(service_auth);

export const postNewUserCLienteControllerGW = async (req, res) => {
  try {
    const newUserCredencial = req.body;
    const response = await axios.post(
      `${service_auth}/user_new`,

      newUserCredencial.user
    );
    if (response.data.message === "User exist!") {
      return res.status(400).json({ message: response.data.message });
    }

    const usuarioId = response.data.id;

    const responseCliente = await axios.post(
      `${service_cliente}/cliente`,
      {
        usuario_id: usuarioId,
        ...newUserCredencial.cliente,
      }
    );
    if(responseCliente.data.message === 'Invalid input data'){
      return res.status(400).json({message:responseCliente.data.message})
    }
    res.status(201).json({user:response.data,conductor:responseCliente.data})
  } catch (error) {
    res.status(500).json({error:error.message})
  }
};

export const postNewUserConductorControllerGW = async (req, res) => {
  try {
    const newUserCredencial = req.body;
    const response = await axios.post(
      `${service_auth}/user_new`,

      newUserCredencial.user
    );
    if (response.data.message === "User exist!") {
      return res.status(400).json({ message: response.data.message });
    }

    const usuarioId = response.data.id;

    const responseConductor = await axios.post(
      `${service_conductor}/conductor`,
      {
        usuario_id: usuarioId,
        ...newUserCredencial.conductor,
      }
    );
    if(responseConductor.data.message === 'Invalid input data'){
      return res.status(400).json({message:responseConductor.data.message})
    }
    res.status(201).json({user:response.data,conductor:responseConductor.data})
  } catch (error) {
    res.status(500).json({error:error.message})
  }
};

export const postLoginController = async (req, res) => {
  try {
    const credenciales = req.body;
    const response = await axios.post(`${service_auth}/login`, credenciales);
    console.log("response----------", response.data);
    if (response && response.data.tokenUser) {
      // CONDUCTOR
      if (response.data.existsUser.rol_id == 5) {
        console.log("cond");
        const id_user = response.data.existsUser.id;
        const res_cond = await axios.get(
          `${service_conductor}/conductor_user/${id_user}`
        );
        console.log("conductor");
        console.log(res_cond.data);
        if (res_cond.status == 200) {
          res.status(201).json({
            driver: res_cond.data,
            user: response.data.existsUser,
            token: response.data.tokenUser,
          });
        } else {
          res.status(404).json({ message: "Not found" });
        }
      }
      // CLIENTE
      else if (response.data.existsUser.rol_id == 4) {
        console.log("cliente");
        const id_user = response.data.existsUser.id;
        const res_client = await axios.get(
          `${service_cliente}/cliente_user/${id_user}`
        );
        if (res_client.status == 200) {
          res.status(201).json({
            client: res_client.data,
            user: response.data.existsUser,
            token: response.data.tokenUser,
          });
        } else {
          res.status(404).json({ message: "Not found" });
        }
      }
      //CENTRAL
      else if (response.data.existsUser.rol_id == 3) {
        console.log("CENTRAL");
        res.status(201).json({
          user: response.data.existsUser,
          token: response.data.tokenUser
        });
      }
    } else {
      res.status(400).json({ message: "Invalid input data" });
    }
  } catch (error) {
    res.status(500).send("Error fetching clients");
  }
};

export const postUserExistController = async (req, res) => {
  try {
    console.log("........dentro del exist user GW");
    const credenciales = req.body;
    const response = await axios.post(`${service_auth}/user`, credenciales);
    const userExist = response.data;
    if (userExist.message == "User exist!") {
      res.status(201).json({ message: response.data.message });
    } else if (userExist.message == "User new") {
      res.status(201).json({ message: response.data.message });
    }
  } catch (error) {
    res.status(500).send("Error fetching clients");
  }
};
