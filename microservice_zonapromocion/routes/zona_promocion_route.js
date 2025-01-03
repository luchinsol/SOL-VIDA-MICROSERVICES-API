import {getZonaPromociones} from "../controllers/zona_promocion_controller.js";
import express from 'express'

const routerZonaPromocion = express.Router()
routerZonaPromocion.get('/preciopromo/:idzona/:idprom',getZonaPromociones)

export default routerZonaPromocion