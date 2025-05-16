import {getCodigoController,getCodigosDetallesControllerCliente,postCreacionCodigoControllerCliente,postVerificacionCodigoControllerCliente} from '../controllers/codigo_controller.js'
import express from 'express'

const routerCodigo = express.Router()

routerCodigo.get('/codigo',getCodigoController)
routerCodigo.get('/codigo_cliente/:id',getCodigosDetallesControllerCliente)
routerCodigo.post('/codigo_cliente',postCreacionCodigoControllerCliente)
routerCodigo.post('/verificacion_cliente',postVerificacionCodigoControllerCliente)

export default routerCodigo