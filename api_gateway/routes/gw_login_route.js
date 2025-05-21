import { postNewUserClienteControllerGW,postLoginController, postNewUserCLienteControllerGW, postNewUserConductorControllerGW, postUserExistController } from '../controllers/gw_login_controller.js'
import express from 'express'

const routerGWLogin = express.Router()

routerGWLogin.post('/apigw/v1/login',postLoginController)
routerGWLogin.post('/apigw/v1/user',postUserExistController)
routerGWLogin.post('/apigw/v1/register_conductor',postNewUserConductorControllerGW)
routerGWLogin.post('/apigw/v1/register_cliente',postNewUserCLienteControllerGW)
routerGWLogin.post('/apigw/v1/register_micro_cliente',postNewUserClienteControllerGW)


export default routerGWLogin