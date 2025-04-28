import  {getCategoriasControllerGW,getCategoriaControllerIdGW,getSubategoriaControllerIdGW,getSubategoriaProductoControllerIdGW,getSubategoriaPromocionControllerIdGW} from '../controllers/gw_categoria_controller.js'
import express from 'express'

const routerGWCategoria = express.Router()

//ENDPOINT QUE TRAE TODAS LAS CATEGORIAS HASTA LA FECHA
routerGWCategoria.get('/apigw/v1/categoria',getCategoriasControllerGW)
//ENDPOINT QUE TE TRAE UNA CATEGORIA EN ESPECIFICO
routerGWCategoria.get('/apigw/v1/categoria/:id',getCategoriaControllerIdGW)
//ENDPONT QUE TE TRAE UNA SUBCATEGORIA EN ESPECIFICO
routerGWCategoria.get('/apigw/v1/sub_categoria/:id',getSubategoriaControllerIdGW)
//ENDPOINT QUE TE TRAE UN PRODUCTO DE UNA SUBCATEGORIA EN ESPECIFICO
routerGWCategoria.get('/apigw/v1/sub_categoria_producto/:id/:id_prod',getSubategoriaProductoControllerIdGW)
//ENDPOINT QUE TE TRAE UNA PROMOCION EN ESPECIFICO DE UNA SUBCATEGORIA
routerGWCategoria.get('/apigw/v1/sub_categoria_promocion/:id/:id_prom',getSubategoriaPromocionControllerIdGW)
export default routerGWCategoria