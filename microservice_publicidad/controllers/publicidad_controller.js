import modelPublicidad from "../models/publicidad_model.js"

export const getPublicidadController  = async(req, res)=>{
    try{
        const resultado = await modelPublicidad.getPublicidad()
        if(resultado){
            res.status(200).json(resultado)
        }
        else {
            res.status(404).json({message: 'Not found'})
        }

    } catch(error){
        res.status(500).json({error: error.message})
    }
}