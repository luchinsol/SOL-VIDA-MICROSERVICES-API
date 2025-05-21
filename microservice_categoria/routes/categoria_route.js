import {getAllCategorias,getAllCategoriasPorID,getAllSubCategoriasPorID,getAllSubCategoriasNombrePorID} from '../controllers/categoria_controller.js'
import express from 'express'

const routerCategoria= express.Router();
//TABLA UBICACIONES
routerCategoria.get('/categoria',getAllCategorias)
//ENDPOINT QUE TE DA LAS CATEGORIAS ESPECIFICAS
routerCategoria.get('/categoria/:id',getAllCategoriasPorID)
//ENDPOINT QUE ME AYUDA A TRAER LA INFORMACION DE UNA SUBCATEGORIA EN ESPECIFICO
routerCategoria.get('/sub_categoria/:id',getAllSubCategoriasPorID)
//ENDPOINT QUE SOLO TRAE INFORMACION NECESARIA PARA LA VISTA DE PRODUCTOS PARA SUBCATEGORIA
routerCategoria.get('/sub_categoria_nombre/:id',getAllSubCategoriasNombrePorID)

export default routerCategoria
