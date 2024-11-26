import { getClientesControllerGW, getClientesControllerIdGW, postClienteControllerGW, putClienteControllerGW,deleteClienteControllerGW } from '../controllers/gw_cliente_controllers.js'
import express from 'express'

const routerGWCliente = express.Router()

routerGWCliente.get('/apigw/v1/cliente',getClientesControllerGW)
routerGWCliente.get('/apigw/v1/cliente/:id',getClientesControllerIdGW)
routerGWCliente.post('/apigw/v1/cliente',postClienteControllerGW)
routerGWCliente.put('/apigw/v1/cliente/:id',putClienteControllerGW)
routerGWCliente.delete('/apigw/v1/cliente/:id',deleteClienteControllerGW)

export default routerGWCliente