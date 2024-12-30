import {getCantidadPromoProductos} from "../controllers/zona_producto_controller.js";
import express from 'express'

const routerZonaProducto = express.Router()

routerZonaProducto.get('/precioZonaProducto/:idzona/:idprod',getCantidadPromoProductos)

export default routerZonaProducto