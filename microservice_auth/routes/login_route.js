
import express from 'express'
import { postMicroUserController,actualizarUsuarioController,getInfoUsers,putMicroUserController,getTelefonosDistribuidor,getTelefonos,existUserController, loginController, postUserController } from '../controllers/login_controller.js'

const routerLogin = express.Router()

routerLogin.post('/login',loginController)
routerLogin.post('/user',existUserController)
routerLogin.get('/user_telefono/:id',getTelefonos)
routerLogin.get('/user_telefonodistri/:id',getTelefonosDistribuidor)
routerLogin.post('/user_new',postUserController)

routerLogin.put('/user_micro', putMicroUserController)

routerLogin.get('/user_info_perfil/:id',getInfoUsers)
routerLogin.put('/actualizar_perfil_usuario/:id',actualizarUsuarioController)
//ENDPOINT PARA CREAR USUARIOS NUEVO FORMULARIO
routerLogin.post('/register_user', postMicroUserController);


export default routerLogin