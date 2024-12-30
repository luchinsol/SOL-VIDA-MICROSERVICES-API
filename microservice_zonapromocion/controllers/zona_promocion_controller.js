import modelZonaPromocion from '../models/zona_promocion_model.js'

export const getZonaPromociones = async (req, res) => {
    try {
        const { idzona } = req.params
        const { idprom } = req.params
        const resultado = await modelZonaPromocion.getZonaPromocion(idzona,idprom)

        if (!resultado) {
            return res.status(404).json({ message: "Data not found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};