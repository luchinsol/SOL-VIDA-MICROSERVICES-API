import modelUbicacion from "../models/ubicacion_model.js"
//TABLA DE UBICACIONES
export const getAllUbicaciones = async (req, res) => {
    try {
        const resultado = await modelUbicacion.getUbicacion();
        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const getUbicacionesId = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = await modelUbicacion.getUbicacionId(id)

        if (!resultado) {
            return res.status(404).json({ message: "Data not found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createUbicacion = async (req, res) => {
    try {
        const resultado = req.body;
        const response = await modelUbicacion.createUbicacion(resultado);
        if (!response) {
            return res.status(400).json({ message: "Invalid input data" });
        }
        res.status(201).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const updateRelacionesUbicaciones = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = req.body;
        const response = await modelUbicacion.updateRelacionesUbicacion(id, resultado);
        if (!response) {
            return res.status(404).json({ message: "Not Found" });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteUbicaciones = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = await modelUbicacion.deleteRelacionesUbicacion(id)
        if (!resultado) {
            return res.status(404).json({ message: "Not Found" });
        }
        res.status(200).json({ message: "Delete succesfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
//TABLA ZONA TRABAJO
export const getZonas = async (req, res) => {
    try {
        const resultado = await modelUbicacion.getZona();
        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const getZonasId = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await modelUbicacion.getZonaId(id);
        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createZonas = async (req, res) => {
    try {
        const resultado = req.body;
        const response = await modelUbicacion.createZona(resultado);
        if (!response) {
            return res.status(400).json({ message: "Invalid input data" });
        }
        res.status(201).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateZonas = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = req.body;
        const response = await modelUbicacion.updateZona(id, resultado);
        if (!response) {
            return res.status(404).json({ message: "Not Found" });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteZonas = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = await modelUbicacion.deleteZona(id)
        if (!resultado) {
            return res.status(404).json({ message: "Not Found" });
          }
          res.status(200).json({message:"Delete succesfully"});
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      };


