import modelAuth from "../models/login_model.js"

export const loginController = async (req,res) => {
    try {
        const credenciales = req.body
        //console.log(credenciales)
        const resultado = await modelAuth.Login(credenciales)
       
        if(resultado.existsUser){
            res.status(201).json(resultado)
        }
        else if(resultado.message === 'Invalid credentials!'){
            res.status(400).json({message:resultado.message})
        }
        else{
            res.status(404).json({message:'Not Found'})
        }
    } catch (error) {
        res.status(500).json({error:error.message})
    }
}

export const existUserController = async (req,res) => {
    try {
        const credenciales = req.body
        console.log("controller",credenciales)
        const resultado = await modelAuth.existUser(credenciales)
        console.log("controller",resultado)
        if(resultado.message == 'User exist!'){
            res.status(201).json(resultado)
        }
        else if (resultado.message == 'User new'){
            res.status(201).json(resultado)
        }
    } catch (error) {
        res.status(500).json({error:error.message})
    }
}