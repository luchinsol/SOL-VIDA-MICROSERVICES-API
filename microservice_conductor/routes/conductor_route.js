import {getEventoConductoresPorId,getConductorControllerId,getAllUsersConductores, createUserConductores, updateUserConductores, deleteUserConductores, getAllEventos, updateEventosConductores,getEventoConductorEspecificos} from '../controllers/conductor_controller.js'
import express from 'express';

const routerConductor = express.Router();

routerConductor.get('/conductor', getAllUsersConductores)
routerConductor.get('/conductor/:id',getConductorControllerId)
routerConductor.post('/conductor',createUserConductores)
routerConductor.put('/conductor/:id',updateUserConductores)
routerConductor.put('/conductor_evento/:id',updateEventosConductores)
routerConductor.delete('/conductor/:id',deleteUserConductores)
routerConductor.get(`/eventos`,getAllEventos)
routerConductor.get(`/eventos/:id`,getEventoConductoresPorId)
routerConductor.get(`/conductor_evento/:id`,getEventoConductorEspecificos)

export default routerConductor;