import modelCliente from "../models/cliente_model.js"

export const getClienteController = async (req,res) => {
    try {
        const resultado = await modelCliente.getCliente()
       
        if(resultado){
            res.status(200).json(resultado)
        }
        else{
            res.status(404).json({message:'Not Found'})
        }
    } catch (error) {
        res.status(500).json({error:error.message})
    }
}

export const getClienteControllerId = async (req,res) => {
    try {
        const {id} = req.params
        const resultado = await modelCliente.getClienteUserId(id)
        
        if(resultado){
            res.status(200).json(resultado)
        }
        else{
            res.status(404).json({message:'Not Found'})
        }
    } catch (error) {
        res.status(500).json({error:error.message})
    }
}