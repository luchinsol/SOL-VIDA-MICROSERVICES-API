
import express from 'express'
import { getTelefonosDistribuidor,getTelefonos,existUserController, loginController, postUserController } from '../controllers/login_controller.js'

const routerLogin = express.Router()

routerLogin.post('/login',loginController)
routerLogin.post('/user',existUserController)
routerLogin.get('/user_telefono/:id',getTelefonos)
routerLogin.get('/user_telefonodistri/:id',getTelefonosDistribuidor)
routerLogin.post('/user_new',postUserController)

export default routerLogin