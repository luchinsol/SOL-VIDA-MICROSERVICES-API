import { getPedidos,UpdateAlmacenPedidosControllerGW,getPedidosControllerGW, postPedidoControllerGW } from '../controllers/gw_pedido_controllers.js'
import express from 'express'

const routerGWPedido = express.Router()

routerGWPedido.get('/apigw/v1/pedido',getPedidosControllerGW)
routerGWPedido.post('/apigw/v1/pedido',postPedidoControllerGW)
routerGWPedido.put('/apigw/v1/pedido_almacen/:id',UpdateAlmacenPedidosControllerGW)
routerGWPedido.get('/apigw/v1/pedidoConsumer',getPedidos)

export default routerGWPedido  