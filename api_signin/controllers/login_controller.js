import modelLogin from "../models/login_model.js"

export const loginController = async (req,res) => {
    try {
        const credenciales = req.body
        //console.log(credenciales)
        const resultado = await modelLogin.Login(credenciales)
       
        if(resultado){
            res.status(201).json(resultado)
        }
        else{
            res.status(400).json({message:'Not Found'})
        }
    } catch (error) {
        res.status(500).json({error:error.message})
    }
}