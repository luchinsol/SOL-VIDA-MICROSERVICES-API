import modelUbicacion from "../models/categoria_model.js"
//TABLA DE UBICACIONES
export const getAllCategorias = async (req, res) => {
    try {
        const resultado = await modelUbicacion.getAllCategoria();
        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllCategoriasPorID = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = await modelUbicacion.getAllCategoriaPorID(id);
        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllSubCategoriasPorID = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = await modelUbicacion.getSubcategoriaById(id);
        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getAllSubCategoriasNombrePorID = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = await modelUbicacion.getSubcategoriaByIdNombre(id);
        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
