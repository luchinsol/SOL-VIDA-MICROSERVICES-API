import { updatePedidoConductoresEstado,updatePedidoConductores,updatePedidoPrecios,updatePedidoAlmacenController,getDetallePedidosAll,deletePedidoDetalleController,updatePedidoDetallesController,postDetallePedidos,getDetallePedidosId,getPedidosSinConductores,getPedidosConductorInfos,getPedidosConteos,getDetallePedidos,getPedidoController, postPedidoController,updatePedidoController,deletePedidoController,getPedidoControllerId } from "../controllers/pedido_controller.js";
import express from 'express'

const routerPedido = express.Router()
//TABLA PEDIDO
routerPedido.get('/pedido',getPedidoController)
routerPedido.get('/pedido/:id',getPedidoControllerId)
routerPedido.post('/pedido',postPedidoController)
routerPedido.put('/pedido/:id',updatePedidoController)
routerPedido.delete('/pedido/:id',deletePedidoController)
//TABLA DETALLE PEDIDO
routerPedido.get('/det_pedido',getDetallePedidos)
routerPedido.get('/det_pedido/:id',getDetallePedidosId)
routerPedido.post('/det_pedido',postDetallePedidos)
routerPedido.put('/det_pedido/:id',updatePedidoDetallesController)
routerPedido.delete('/det_pedido/:id',deletePedidoDetalleController)
//ENPOINTS PARA LAS NECESIDADES ACTUALES
routerPedido.get('/allpedidodetalle/:id',getDetallePedidosAll)
//CONTEO DE PEDIDOS
 // DASHBOARD : conteo de pedidos
routerPedido.get('/pedido_conteo/:id',getPedidosConteos)
//DASHBOARD: ULTIMO PEDIDO
routerPedido.get('/pedido_conductor/:id',getPedidosConductorInfos)
//All Pedidos sin Conductor
routerPedido.get('/pedido_sin_conductor',getPedidosSinConductores)
//Pedidos de Almacen 
//routerPedido.get('/pedido_almacen/:id_almacen',getPedidosAlmacen)
//ACTUALIZACION DEL ALMACEN POR CADA PEDIDO
routerPedido.put('/pedido_almacen/:id',updatePedidoAlmacenController)
routerPedido.put('/pedido_precio/:id',updatePedidoPrecios)
//PEDIDO ACTUALIZADO
routerPedido.put('/pedido_conductor/:id',updatePedidoConductores)
//ENDPOINT PARA ACTUALIZAR TODOS LOS PEDIDOS CON SU RESPECTIVO ALMACEN Y PEDIDOS
routerPedido.put('/pedido_estado/:id',updatePedidoConductoresEstado)

export default routerPedido