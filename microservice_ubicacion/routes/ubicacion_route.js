import {getZonasId,getAllUbicaciones,getUbicacionesId,createUbicacion,updateRelacionesUbicaciones,deleteUbicaciones,createZonas,getZonas,updateZonas,deleteZonas} from '../controllers/ubicacion_controller.js'
import express from 'express'

const routerUbicacion= express.Router();
//TABLA UBICACIONES
routerUbicacion.get('/ubicacion',getAllUbicaciones)
routerUbicacion.get('/ubicacion/:id',getUbicacionesId)
routerUbicacion.post('/ubicacion',createUbicacion)
routerUbicacion.put('/ubicacion/:id',updateRelacionesUbicaciones)
routerUbicacion.delete('/ubicacion/:id',deleteUbicaciones)
//TABLA ZONA_TRABAJO
routerUbicacion.get('/zona',getZonas)
routerUbicacion.get('/zona/:id',getZonasId)
routerUbicacion.post('/zona',createZonas)
routerUbicacion.put('/zona/:id',updateZonas)
routerUbicacion.delete('/zona/:id',deleteZonas)
export default routerUbicacion
