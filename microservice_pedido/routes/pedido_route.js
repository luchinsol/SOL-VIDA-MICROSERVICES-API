import { getPedidosSinConductores,getPedidosConductorInfos,getPedidosConteos,updatePedidoAlmacenController,getDetallePedidosAll,getPedidoController, postPedidoController,updatePedidoController,deletePedidoController,getPedidoControllerId } from "../controllers/pedido_controller.js";
import express from 'express'

const routerPedido = express.Router()
//TABLA PEDIDO
routerPedido.get('/pedido',getPedidoController)
routerPedido.get('/pedido/:id',getPedidoControllerId)
routerPedido.post('/pedido',postPedidoController)
routerPedido.put('/pedido/:idPedido',updatePedidoController)
routerPedido.delete('/pedido/:idPedido',deletePedidoController)
//TABLA DETALLE PEDIDO
routerPedido.get('/det_pedido',getPedidoController)
//ENPOINTS PARA LAS NECESIDADES ACTUALES
routerPedido.get('/allpedidodetalle/:id',getDetallePedidosAll)
routerPedido.put('/pedido_almacen/:idPedido',updatePedidoAlmacenController)
//CONTEO DE PEDIDOS
 // DASHBOARD : conteo de pedidos
routerPedido.get('/pedido_conteo/:id',getPedidosConteos)
//DASHBOARD: ULTIMO PEDIDO
routerPedido.get('/pedido_conductor/:id',getPedidosConductorInfos)
//All Pedidos sin Conductor
routerPedido.get('/pedido_sin_conductor',getPedidosSinConductores)

export default routerPedido