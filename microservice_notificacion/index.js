import express from "express";
import cors from 'cors';
import morgan from "morgan";
import routerNotificaion from "./routes/notificacion_route.js";
import dotenv from 'dotenv'
dotenv.config()

const app_micro_notificacion = express()

const PORT = process.env.PORT_NOTIFY

app_micro_notificacion.use(cors())
app_micro_notificacion.use(morgan('combined'))
app_micro_notificacion.use(express.json())

app_micro_notificacion.use('/api/v1',routerNotificaion)

app_micro_notificacion.listen(PORT,()=>{
    console.log(`Microservice NOTIFICACION running http://localhost:${PORT}`)
})

export {app_micro_notificacion}
