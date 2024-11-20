import { getPedidoController, postPedidoController } from "../controllers/pedido_controller.js";
import express from 'express'

const routerPedido = express.Router()

routerPedido.get('/pedido',getPedidoController)
routerPedido.post('/pedido',postPedidoController)

export default routerPedido