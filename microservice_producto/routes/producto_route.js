import {getCantidadPromoProductos,getProductoController, getProductoControllerId,getPromocionController,getPromocionControllerId } from "../controllers/producto_controller.js";
import express from 'express'

const routerProducto = express.Router()
routerProducto.get('/producto',getProductoController)
routerProducto.get('/producto/:id',getProductoControllerId)

routerProducto.get('/promocion',getPromocionController)
routerProducto.get('/promocion/:id',getPromocionControllerId)

routerProducto.get('/cantidadprod/:idprom/:idprod',getCantidadPromoProductos)

export default routerProducto