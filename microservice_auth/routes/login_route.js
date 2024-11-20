
import express from 'express'
import { existUserController, loginController } from '../controllers/login_controller.js'

const routerLogin = express.Router()

routerLogin.post('/login',loginController)
routerLogin.post('/user',existUserController)

export default routerLogin