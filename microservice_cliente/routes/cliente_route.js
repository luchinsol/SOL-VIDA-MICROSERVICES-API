import { deleteClienteController,getClienteController_Id ,getClienteController, getClienteControllerId, postClienteController, putClienteController } from '../controllers/cliente_controller.js'
import express from 'express'

const routerCliente = express.Router()

routerCliente.get('/cliente',getClienteController)
routerCliente.get('/cliente/:id',getClienteControllerId)
routerCliente.get('/cliente_user/:id',getClienteController_Id)
routerCliente.post('/cliente',postClienteController)
routerCliente.put('/cliente/:id',putClienteController)
routerCliente.delete('/cliente/:id',deleteClienteController)

export default routerCliente