
import express from 'express'
import { getTelefonos,existUserController, loginController } from '../controllers/login_controller.js'

const routerLogin = express.Router()

routerLogin.post('/login',loginController)
routerLogin.post('/user',existUserController)
routerLogin.get('/user_telefono/:id',getTelefonos)

export default routerLogin