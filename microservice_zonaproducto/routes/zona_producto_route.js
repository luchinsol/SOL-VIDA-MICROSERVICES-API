import {getCantidadPromoProductos,getPromoProductosDetalles} from "../controllers/zona_producto_controller.js";
import express from 'express'

const routerZonaProducto = express.Router()

routerZonaProducto.get('/precioZonaProducto/:idzona/:idprod',getCantidadPromoProductos)
routerZonaProducto.get('/precioZonaProducto/:idprod',getPromoProductosDetalles)

export default routerZonaProducto