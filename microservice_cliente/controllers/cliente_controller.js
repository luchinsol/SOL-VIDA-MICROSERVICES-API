import modelCliente from "../models/cliente_model.js"

export const getClienteController = async (req, res) => {
    try {
        const resultado = await modelCliente.getCliente()

        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
          }
          res.status(200).json(resultado);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
};

export const getClienteControllerId = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = await modelCliente.getClienteUserId(id) 

        if (!resultado) {
            return res.status(404).json({ message: "Data not found" });
          }
          res.status(200).json(resultado);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
};
export const getClienteController_Id = async (req, res) => {
  try {
      const { id } = req.params
      const resultado = await modelCliente.getClienteUser_Id(id) 

      if (!resultado) {
          return res.status(404).json({ message: "Data not found" });
        }
        res.status(200).json(resultado);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
};

export const postClienteController = async (req, res) => {
    try {
        const resultado = req.body
        const response = await modelCliente.postCliente(resultado)

        if (!response) {
            return res.status(400).json({ message: "Invalid input data" });
          }
          res.status(201).json(response);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
};

export const putClienteController = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = req.body
        const response = await modelCliente.putCliente(id, resultado);
        if (!response) {
            return res.status(404).json({ message: "Not Found" });
          }
          res.status(200).json(response);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
};

export const deleteClienteController = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = await modelCliente.deleteCliente(id)
        if (!resultado) {
            return res.status(404).json({ message: "Not Found" });
          }
          res.status(200).json({message:"Delete succesfully"});
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
};