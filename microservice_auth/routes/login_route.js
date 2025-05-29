
import express from 'express'
import { postMicroUserController,getFirebaseuid,getTelefonosDistribuidor,getTelefonos,existUserController, loginController, postUserController, putTelefono } from '../controllers/login_controller.js'

const routerLogin = express.Router()

routerLogin.post('/login',loginController)
routerLogin.post('/user',existUserController)
routerLogin.get('/user_telefono/:id',getTelefonos)
routerLogin.get('/user_telefonodistri/:id',getTelefonosDistribuidor)
routerLogin.post('/user_new',postUserController)
routerLogin.post('/user_micro_new',postMicroUserController)

//
routerLogin.get('/userfirebase/:firebaseUID',getFirebaseuid)
routerLogin.put('/userfirebase_phone/:firebaseUID/',putTelefono)

export default routerLogin