import {getInformacionConductorPedido,getIntegracionControllerConductorPedidoGW,getIntegraciaonCompletaDetallesGW,getIntegracionControllerClienteGW,getIntegracionCompletaGW,getIntegracionControllerPedidoGW,getIntegracionAllPedidosGW } from "../controllers/gw_integracion_controller.js"
import express from 'express'

const routerIntegracion= express.Router()

routerIntegracion.get('/apigw/v1/integrar/:id',getIntegracionControllerClienteGW)
routerIntegracion.get('/apigw/v1/integrar/:clienteId/:pedidoId/:conductorId/:ubicacionId', getIntegracionCompletaGW);
routerIntegracion.get('/apigw/v1/integrarpedido/:id', getIntegracionControllerPedidoGW);
routerIntegracion.get('/apigw/v1/pedidosSinConductor', getIntegracionAllPedidosGW);
routerIntegracion.get('/apigw/v1/pedidoDetalleFinal/:pedidoId', getIntegraciaonCompletaDetallesGW);
routerIntegracion.get('/apigw/v1/pedidoConductor/:id',getIntegracionControllerConductorPedidoGW)
routerIntegracion.get('/apigw/v1/pedidoConductorInfo/:id',getInformacionConductorPedido)

export default routerIntegracion
