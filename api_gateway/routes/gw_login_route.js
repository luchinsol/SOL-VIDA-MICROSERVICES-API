import { postLoginController } from '../controllers/gw_login_controller.js'
import express from 'express'

const routerGWLogin = express.Router()

routerGWLogin.post('/apigw/v1/login',postLoginController)

export default routerGWLogin