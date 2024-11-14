import { getClienteController, getClienteControllerId, postClienteController } from '../controllers/cliente_controller.js'
import express from 'express'

const routerCliente = express.Router()

routerCliente.get('/cliente',getClienteController)
routerCliente.get('/cliente/:id',getClienteControllerId)
routerCliente.post('/cliente',postClienteController)

export default routerCliente