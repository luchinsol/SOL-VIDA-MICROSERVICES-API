import { UpdatePedidoConductorEstadoControllerGW,postInfoPedido,UpdateAlmacenPedidosControllerGW,getPedidosControllerGW} from '../controllers/gw_pedido_controllers.js'
import express from 'express'

const routerGWPedido = express.Router()

routerGWPedido.get('/apigw/v1/pedido',getPedidosControllerGW)
routerGWPedido.post('/apigw/v1/pedido',postInfoPedido)
routerGWPedido.put('/apigw/v1/pedido/:id',UpdateAlmacenPedidosControllerGW)
routerGWPedido.put('/apigw/v1/pedido_estado/:id',UpdatePedidoConductorEstadoControllerGW)




export default routerGWPedido  