import { getUsuariosPorDiaMes,getUsuariosTotalesMes,deleteClienteController,getClienteController_Id ,getClienteController, getClienteControllerId, postClienteController, putClienteController, putClienteCalificationController } from '../controllers/cliente_controller.js'
import express from 'express'

const routerCliente = express.Router()

routerCliente.get('/cliente',getClienteController)
routerCliente.get('/cliente/:id',getClienteControllerId)
routerCliente.get('/cliente_user/:id',getClienteController_Id)
routerCliente.get('/usuarios_totales/:mesAnio', getUsuariosTotalesMes);
routerCliente.get('/usuarios_por_dia/:mesAnio', getUsuariosPorDiaMes);
routerCliente.post('/cliente',postClienteController)
routerCliente.put('/cliente/:id',putClienteController)
routerCliente.delete('/cliente/:id',deleteClienteController)
routerCliente.put('/cliente_calificacion/:id',putClienteCalificationController)

export default routerCliente