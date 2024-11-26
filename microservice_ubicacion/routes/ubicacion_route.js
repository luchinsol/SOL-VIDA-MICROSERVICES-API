import {getAllUbicaciones,createUbicacion,updateRelacionesUbicaciones,deleteUbicaciones,createZonas,getZonas,updateZonas,deleteZonas} from '../controllers/ubicacion_controller.js'
import express from 'express'

const routerUbicacion= express.Router();
//TABLA UBICACIONES
routerUbicacion.post('/ubicacion',createUbicacion)
routerUbicacion.get('/ubicacion',getAllUbicaciones)
routerUbicacion.put('/updateZonaTrabajo/:idRelacionUbicacion',updateRelacionesUbicaciones)
routerUbicacion.delete('/ubicacion/:idUbicacion',deleteUbicaciones)
//TABLA ZONA_TRABAJO
routerUbicacion.post('/zona',createZonas)
routerUbicacion.get('/zona',getZonas)
routerUbicacion.put('/zona/:idZona',updateZonas)
routerUbicacion.delete('/zona/:idZona',deleteZonas)
export default routerUbicacion
