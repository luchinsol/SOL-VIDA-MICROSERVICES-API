import {getConductorControllerId,getAllUsersConductores, createUserConductores, updateUserConductores, deleteUserConductores} from '../controllers/conductor_controller.js'
import express from 'express';

const routerConductor = express.Router();

routerConductor.post('/conductor',createUserConductores)
routerConductor.delete('/conductor/:id',deleteUserConductores)
routerConductor.put('/conductor/:id',updateUserConductores)
routerConductor.get('/conductor', getAllUsersConductores)
routerConductor.get('/conductor/:id',getConductorControllerId)

export default routerConductor;