import {getCantidadPromoProductos,getProductoController, getProductoControllerId,getPromocionController,getPromocionControllerId,actualizarValoracionProducto,actualizarValoracionPromocion } from "../controllers/producto_controller.js";
import express from 'express'

const routerProducto = express.Router()
routerProducto.get('/producto',getProductoController)
routerProducto.get('/producto/:id',getProductoControllerId)

routerProducto.get('/promocion',getPromocionController)
routerProducto.get('/promocion/:id',getPromocionControllerId)

routerProducto.get('/cantidadprod/:idprom/:idprod',getCantidadPromoProductos)
//ACTUALIZAR LA VALORACIÓN PRODUCTO
routerProducto.put('/actualizar_valoracion_producto/:id',actualizarValoracionProducto)
//ACTUALIZAR LA VALORACION PROMOCION
routerProducto.put('/actualizar_valoracion_promocion/:id',actualizarValoracionPromocion)

export default routerProducto