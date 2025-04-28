import { getAllUbicacionesClienteControllerGW,actualizarUltimaUbicacionClienteControllerGW,getUltimaUbicacionClienteControllerGW,getUbicacionesControllerIdGW,ubicacionClienteControllerGW} from '../controllers/gw_ubicacion_controllers.js'
import express from 'express'

const routerGWUbicacion = express.Router()

routerGWUbicacion.get('/apigw/v1/ubicacion/:id',getUbicacionesControllerIdGW)
//POST NECESARIO PARA LOS CLIENTES EN LA APLICACION DE SOL VIDA
routerGWUbicacion.post('/apigw/v1/ubicacion_cliente',ubicacionClienteControllerGW)
//GET DEL PEDIDO SELECCIONADO POR EL CLIENTE EN LA APP DE SOL VIDA
routerGWUbicacion.get('/apigw/v1/ubicacion_seleccionada/:id',getUltimaUbicacionClienteControllerGW)
//PUT QUE ME SIRVE PARA ACTUALIZAR LA DATA DEL CLIENTE
routerGWUbicacion.put('/apigw/v1/actualizar_ubicacion/:id',actualizarUltimaUbicacionClienteControllerGW)
//ALL UBICACIONES DEL CLIENTE REGISTRADAS
routerGWUbicacion.get('/apigw/v1/allubicaciones/:cliente',getAllUbicacionesClienteControllerGW)


export default routerGWUbicacion