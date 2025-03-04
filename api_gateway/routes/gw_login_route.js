import { postLoginController, postNewUserConductorControllerGW, postUserExistController } from '../controllers/gw_login_controller.js'
import express from 'express'

const routerGWLogin = express.Router()

routerGWLogin.post('/apigw/v1/login',postLoginController)
routerGWLogin.post('/apigw/v1/user',postUserExistController)
routerGWLogin.post('/apigw/v1/register_conductor',postNewUserConductorControllerGW)

export default routerGWLogin