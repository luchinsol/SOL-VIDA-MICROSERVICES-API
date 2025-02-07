import { getAllNotificacionesAlmacenes,createNotificacionesAlmacenes } from '../controllers/notificacion_controller.js';
import express from 'express';

const routerNotificacion = express.Router();
routerNotificacion.get('/notificacion/:fecha/:id',getAllNotificacionesAlmacenes)
routerNotificacion.post('/notificacion',createNotificacionesAlmacenes)


export default routerNotificacion;