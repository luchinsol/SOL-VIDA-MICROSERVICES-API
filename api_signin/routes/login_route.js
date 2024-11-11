
import express from 'express'
import { loginController } from '../controllers/login_controller.js'

const routerLogin = express.Router()

routerLogin.post('/login',loginController)

export default routerLogin