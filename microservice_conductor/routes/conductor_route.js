import {getConductorControllerId,getAllUsersConductores, createUserConductores, updateUserConductores, deleteUserConductores} from '../controllers/conductor_controller.js'
import express from 'express';

const routerConductor = express.Router();

routerConductor.get('/conductor', getAllUsersConductores)
routerConductor.get('/conductor/:id',getConductorControllerId)
routerConductor.post('/conductor',createUserConductores)
routerConductor.put('/conductor/:id',updateUserConductores)
routerConductor.delete('/conductor/:id',deleteUserConductores)


export default routerConductor;