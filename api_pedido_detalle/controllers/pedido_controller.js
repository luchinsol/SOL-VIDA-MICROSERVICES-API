import modelPedidoDetalle from "../models/pedido_model.js";

export const getPedidoController = async (req,res) => {
    try {
        const resultado = await modelPedidoDetalle.getPedidoDetalle()
       
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

export const postPedidoController = async (req,res)=>{
    try {
        const pedido = req.body
        const resultado = await modelPedidoDetalle.postPedidoDetalle(pedido)
        if(resultado){
            res.status(201).json(resultado)
        }
        else{
            res.status(400).json({message:'Invalid input data'})
        }
    } catch (error) {
        
    }
}