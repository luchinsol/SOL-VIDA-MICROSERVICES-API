import {getNotificacionAlmacenGW,postNotificacionAlmacenGW} from '../controllers/gw_notificacion_controller.js'
import express from 'express'

const routerGWNotificacion = express.Router()

routerGWNotificacion.get('/apigw/v1/notificacion/:fecha/:id',getNotificacionAlmacenGW)
routerGWNotificacion.post('/apigw/v1/notificacion',postNotificacionAlmacenGW)

export default routerGWNotificacion