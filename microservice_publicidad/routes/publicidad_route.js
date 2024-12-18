import {getPublicidadController} from '../controllers/publicidad_controller.js'
import express from 'express'

const routePublicidad = express.Router()

routePublicidad.get('/publicidad',getPublicidadController)

export default routePublicidad
