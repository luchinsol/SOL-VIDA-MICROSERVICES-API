import { getUbicacionesControllerIdGW} from '../controllers/gw_ubicacion_controllers.js'
import express from 'express'

const routerGWUbicacion = express.Router()

routerGWUbicacion.get('/apigw/v1/ubicacion/:id',getUbicacionesControllerIdGW)

export default routerGWUbicacion