import modelPedidoDetalle from "../models/pedido_model.js";

export const getPedidoController = async (req,res) => {
    try {
        const resultado = await modelPedidoDetalle.getPedido()
       
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
export const getPedidoControllerId = async (req,res) => {
    try {
        const {id} = req.params
        const resultado = await modelPedidoDetalle.getPedidoId(id)
       
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
        const resultado = await modelPedidoDetalle.postPedido(pedido)
        if(resultado){
            res.status(201).json(resultado)
        }
        else{
            res.status(400).json({message:'Invalid input data'})
        }
    } catch (error) {
        
    }
}

export const updatePedidoController = async (req,res)=>{
    try {
        const {id}=req.params
        const pedido = req.body
        const resultado = await modelPedidoDetalle.updatePedido(id, pedido)
        if(resultado){
            res.status(201).json(resultado)
        }
        else{
            res.status(400).json({message:'Invalid input data'})
        }
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const deletePedidoController = async (req,res)=>{
    try {
        const {id}=req.params
        const resultado = await modelPedidoDetalle.deletePedido(id)
        if(resultado){
            res.status(201).json(resultado)
        }
        else{
            res.status(400).json({message:'Invalid input data'})
        }
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const getDetallePedidosAll = async (req,res) => {
    try {
        const {id} = req.params
        const resultado = await modelPedidoDetalle.getDetallePedidoAll(id)
       
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

export const updatePedidoAlmacenController = async (req,res)=>{
    try {
        const {idPedido}=req.params
        const pedido = req.body
        const resultado = await modelPedidoDetalle.updatePedidoAlmacen(idPedido, pedido)
        if(resultado){
            res.status(201).json(resultado)
        }
        else{
            res.status(400).json({message:'Invalid input data'})
        }
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}

export const getPedidosConteos = async (req,res) => {
    try {
        const {id} = req.params
        const resultado = await modelPedidoDetalle.getPedidosCount(id)
       
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


//ULTIMO PEDIDO REALIZADO POR EL CONDUCTOR
export const getPedidosConductorInfos = async (req,res) => {
    try {
        const {id} = req.params
        const resultado = await modelPedidoDetalle.getPedidosConductorInfo(id)
       
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

export const getPedidosSinConductores = async (req,res) => {
    try {
        const {id} = req.params
        const resultado = await modelPedidoDetalle.getPedidosSinConductor()
       
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
