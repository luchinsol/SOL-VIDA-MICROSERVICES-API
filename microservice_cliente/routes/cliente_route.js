import { getPromedioValoracionesPromocionId,getPromedioValoracionesProductoId,getConteoValoracionesPromocionControllerId,getConteoValoracionesProductoControllerId,postMicroClienteController,postMicroValoracionController,getUsuariosPorDiaMes,getUsuariosTotalesMes,deleteClienteController,getClienteController_Id ,getClienteController, getClienteControllerId, postClienteController, putClienteController, putClienteCalificationController,getValoracionesClientesLast,getValoracionesClientesPromoLast } from '../controllers/cliente_controller.js'
import express from 'express'

const routerCliente = express.Router()

routerCliente.get('/cliente',getClienteController)
routerCliente.get('/cliente/:id',getClienteControllerId)
routerCliente.get('/cliente_user/:id',getClienteController_Id)
routerCliente.get('/usuarios_totales/:mesAnio', getUsuariosTotalesMes);
routerCliente.get('/usuarios_por_dia/:mesAnio', getUsuariosPorDiaMes);
routerCliente.post('/cliente',postClienteController)
//ENDPOINT PARA POSTEAR UN NUEVO CLIENTE EN EL MICROSERVICIO
routerCliente.post('/cliente_micro',postMicroClienteController)
routerCliente.put('/cliente/:id',putClienteController)
routerCliente.delete('/cliente/:id',deleteClienteController)
routerCliente.put('/cliente_calificacion/:id',putClienteCalificationController)
//ENDPOINT QUE ME PERMITE INGRESAR UNA OPINIÓN DE UN CLIENTE:
routerCliente.post('/calificacion',postMicroValoracionController);
//ENDPOINT QUE CUENTA LAS CALIFICACIONES QUE HAY EN UN DETERMINADO PRODUCTO
routerCliente.get('/calificacion_count_producto/:id',getConteoValoracionesProductoControllerId);
//ENDPOINT QUE CUENTA LAS CALIFICACIONES QUE HAY EN UN DETERMINADO PROMOCION
routerCliente.get('/calificacion_count_promocion/:id',getConteoValoracionesPromocionControllerId);
//ENDPOINT QUE CALCULA EL PROMEDIO DE LAS CALIFICACIONES RECIBIDAS POR LOS CLIENTES
routerCliente.get('/calificacion_promedio_producto/:id',getPromedioValoracionesProductoId);
//ENDPOINT QUE CALCULA EL PROMEDIO DE LAS CALIFICACIONES RECIBIDAS POR LOS CLIENTES DE UN PRODUCTO
routerCliente.get('/calificacion_promedio_producto/:id',getPromedioValoracionesProductoId);
//ENDPOINT QUE CALCULA EL PROMEDIO DE LAS CALIFICACIONES RECIBIDAS POR LOS CLIENTES DE UNA PROMOCION
routerCliente.get('/calificacion_promedio_promocion/:id',getPromedioValoracionesPromocionId);
//ULTIMAS VALORACIONES DE LOS CLIENTES DE LOS PRODUCTOS
routerCliente.get('/last_valoraciones_cliente_producto/:id',getValoracionesClientesLast)
//ULTIMAS VALORACIONES DE LOS CLIENTES DE LAS PROMOCIONES
routerCliente.get('/last_valoraciones_cliente_promos/:id',getValoracionesClientesPromoLast)
export default routerCliente