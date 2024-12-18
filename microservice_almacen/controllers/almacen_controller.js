import modelAlmacen from "../models/almacen_model.js"

export const getAlmacenController = async (req, res) => {
    try {
        const resultado = await modelAlmacen.getAllAlmacen()

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

export const getAlmacenControllerId = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = await modelAlmacen.getAlmacenId(id) 

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

export const postAlmacenController = async (req, res) => {
    try {
        const resultado = req.body
        const response = await modelAlmacen.createAlmacen(resultado)

        if (response) {
            res.status(201).json(response)
        }
        else {
            res.status(400).json({ message: 'Invalid input data' })
        }
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const putAlmacenController = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = req.body
        const response = modelAlmacen.updateAlmacen(id, resultado)
        if (response) {
            res.status(200).json(response)
        }
        else {
            res.status(404).json({ message: 'Not Found' })
        }

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const deleteAlmacenController = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = modelAlmacen.deleteAlmacen(id)
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