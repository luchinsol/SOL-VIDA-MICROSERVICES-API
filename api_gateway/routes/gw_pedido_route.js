import { postInfoPedido,UpdateAlmacenPedidosControllerGW,getPedidosControllerGW, getPedidoHistoryConductorControllerGW} from '../controllers/gw_pedido_controllers.js'
import express from 'express'

const routerGWPedido = express.Router()

routerGWPedido.get('/apigw/v1/pedido',getPedidosControllerGW)
routerGWPedido.post('/apigw/v1/pedido',postInfoPedido)
//routerGWPedido.post('/apigw/v1/pedido',postPedidoControllerGW)
routerGWPedido.put('/apigw/v1/pedido/:id',UpdateAlmacenPedidosControllerGW)
//routerGWPedido.get('/apigw/v1/pedidoConsumer',getPedidos)
routerGWPedido.get('/apigw/v1/pedido_history/:id/:fecha',getPedidoHistoryConductorControllerGW)


export default routerGWPedido  