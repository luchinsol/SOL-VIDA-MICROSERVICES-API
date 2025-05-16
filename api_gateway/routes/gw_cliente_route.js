import { getClientesControllerGW,putClienteCalificationControllerGw, getClientesControllerIdGW, postClienteControllerGW, putClienteControllerGW,deleteClienteControllerGW,postValoracionControllerGW } from '../controllers/gw_cliente_controllers.js'
import express from 'express'

const routerGWCliente = express.Router()

routerGWCliente.get('/apigw/v1/cliente',getClientesControllerGW)
routerGWCliente.get('/apigw/v1/cliente/:id',getClientesControllerIdGW)
routerGWCliente.post('/apigw/v1/cliente',postClienteControllerGW)
routerGWCliente.put('/apigw/v1/cliente/:id',putClienteControllerGW)
routerGWCliente.put('/apigw/v1/cliente_calificar/:id',putClienteCalificationControllerGw)
routerGWCliente.delete('/apigw/v1/cliente/:id',deleteClienteControllerGW)
//ENDPOINT QUE ME PERMITE INGRESAR UNA CALIFICACION COMO CLIENTE
routerGWCliente.post('/apigw/v1/calificacion',postValoracionControllerGW)

export default routerGWCliente