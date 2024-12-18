import modelUbicacion from "../models/ubicacion_model.js"
//TABLA DE UBICACIONES
export const getAllUbicaciones = async (req,res) => {
    try {
        const allubicaciones = await modelUbicacion.getUbicacion();
        res.status(200).json(allubicaciones);
    } catch (error) {
        res.status(500).json({error:error.message});

    }
}


export const getUbicacionesId = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = await modelUbicacion.getUbicacionId(id)

        if (resultado) {
            res.status(200).json(resultado)
        }
        else {
            res.status(404).json({ message: 'Not Found' })
        }
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const createUbicacion = async (req,res) => {
    try{
        const newUbicacion = req.body;
        console.log(newUbicacion)
        const ubicacionCreated = await modelUbicacion.createUbicacion(newUbicacion);
        console.log(ubicacionCreated);
        res.status(200).json(ubicacionCreated);
    }
    catch(e){
        console.error('Error en createUbicacion:', e);
        res.status(500).json({error:e.message})
    }
}


export const updateRelacionesUbicaciones = async (req,res) => {
    try {
        const {idRelacionUbicacion} = req.params;
        const idrubi = parseInt(idRelacionUbicacion,10);
        const zona =req.body;
        const resultado = await modelUbicacion.updateRelacionesUbicacion(idrubi,zona.zona_trabajo_id); 

        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({error:error.message});

    }

}


export const deleteUbicaciones = async (req,res) => {
    try {
        const {idUbicacion} = req.params
        const idubirelacion = parseInt(idUbicacion,10)
        const resultado = await modelUbicacion.deleteRelacionesUbicacion(idubirelacion)
        if (resultado) {
            res.json({ mensaje: 'Ubicación eliminada exitosamente' });
        } else {
            // Si rowCount no es 1, significa que no se encontró un cliente con ese ID
            res.status(404).json({ error: 'No se encontró la ubicación con el ID proporcionado' });
        }
    } catch (error) {
        res.status(500).json({error:error.message});

    }

}
//TABLA ZONA TRABAJO
export const getZonas = async (req,res) => {
    try {
        const allZonas = await modelUbicacion.getZona();
        res.status(200).json(allZonas);
    } catch (error) {
        res.status(500).json({error:error.message});

    }
}

export const createZonas = async (req,res) => {
    try{
        const newZona = req.body;
        const zonaCreated = await modelUbicacion.createZona(newZona);
        res.status(200).json(zonaCreated);
    }
    catch(e){
        res.status(500).json({error:e.message})
    }
}

export const updateZonas = async (req,res) => {
    try {
        const {idZona} = req.params;
        const idzona = parseInt(idZona,10);
        const zona =req.body;
        const resultado = await modelUbicacion.updateZona(idzona,zona.nombre); 

        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({error:error.message});

    }

}

export const deleteZonas = async (req,res) => {
    try {
        const {idZona} = req.params
        const idzona = parseInt(idZona,10)
        const resultado = await modelUbicacion.deleteZona(idzona)
        if (resultado) {
            res.json({ mensaje: 'Ubicación eliminada exitosamente' });
        } else {
            // Si rowCount no es 1, significa que no se encontró un cliente con ese ID
            res.status(404).json({ error: 'No se encontró la ubicación con el ID proporcionado' });
        }
    } catch (error) {
        res.status(500).json({error:error.message});

    }

}


