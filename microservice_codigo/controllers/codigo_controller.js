import modelCodigo from "../models/codigo_model.js"

export const getCodigoController = async (req, res) => {
    try {
        const resultado = await modelCodigo.getCodigo()

        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
          }
          res.status(200).json(resultado);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
};

export const getCodigosDetallesControllerCliente = async (req, res) => {
    try {
        const {id} = req.params
        const resultado = await modelCodigo.getCodigosDetallesModelCliente(id)

        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
          }
          res.status(200).json(resultado);
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
};

export const postCreacionCodigoControllerCliente = async (req, res) => {
  try {
      const resultado = req.body
      const response = await modelCodigo.postCreacionCodigoModelCliente(resultado)

      if (!response) {
          return res.status(400).json({ message: "Invalid input data" });
        }
        res.status(201).json(response);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
};


export const postVerificacionCodigoControllerCliente = async (req, res) => {
  try {
      const resultado = req.body
      const response = await modelCodigo.postVerificacionCuponCliente(resultado)
      if (!response) {
          return res.status(400).json({ message: "Invalid input data" });
        }
        res.status(201).json(response);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
};