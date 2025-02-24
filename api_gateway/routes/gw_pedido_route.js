import { UpdatePedidoConductorEstadoControllerGW,postInfoPedido,UpdateAlmacenPedidosControllerGW,getPedidosControllerGW, getPedidoHistoryConductorControllerGW, getPedidoAlmacenControllerGW} from '../controllers/gw_pedido_controllers.js'

import express from 'express'

const routerGWPedido = express.Router()

routerGWPedido.get('/apigw/v1/pedido/almacen/:idalmacen/:estado',getPedidoAlmacenControllerGW)
routerGWPedido.get('/apigw/v1/pedido',getPedidosControllerGW)
routerGWPedido.post('/apigw/v1/pedido',postInfoPedido)
routerGWPedido.put('/apigw/v1/pedido/:id',UpdateAlmacenPedidosControllerGW)
routerGWPedido.put('/apigw/v1/pedido_estado/:id',UpdatePedidoConductorEstadoControllerGW)
routerGWPedido.get('/apigw/v1/pedido_history/:id/:fecha',getPedidoHistoryConductorControllerGW)

export default routerGWPedido  