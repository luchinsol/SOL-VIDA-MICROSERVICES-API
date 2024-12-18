import modelUserConductor from "../models/conductor_model.js"
export const getAllUsersConductores = async (req, res) => {
    try {
        const resultado = await modelUserConductor.getAllUsersConductor()

        if (resultado) {
            res.status(200).json(resultado)
        }
        else {
            res.status(404).json({ message: 'Not Found' })
        }
    } catch (error) {
        res.status(304).json({ error: error.message })
    }
}

export const getConductorControllerId = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = await modelUserConductor.getConductorUserId(id)

        if (resultado) {
            res.status(200).json(resultado)
        }
        else {
            res.status(404).json({ message: 'Not Found' })
        }
    } catch (error) {
        res.status(304).json({ error: error.message })
    }
}

export const createUserConductores = async (req, res) => {
    try {
        const resultado = req.body
        const response = await modelUserConductor.createUserConductor(resultado)

        if (response) {
            res.status(201).json(response)
        }
        else {
            res.status(400).json({ message: 'Invalid input data' })
        }
    } catch (error) {
        res.status(409).json({ error: error.message })
    }
}

export const updateUserConductores = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = req.body
        const response = modelUserConductor.updateUserConductor(id, resultado)
        if (response) {
            res.status(200).json(response)
        }
        else {
            res.status(404).json({ message: 'Not Found' })
        }

    } catch (error) {
        res.status(400).json({ error: error.message })
    }
}

export const deleteUserConductores = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = modelUserConductor.deleteUserConductor(id)
        if (resultado) {
            res.status(200).json(resultado)
        }
        else {
            res.status(204).json({ message: 'Not Found' })
        }

    } catch (error) {
        res.status(404).json({ error: error.message })
    }
}
