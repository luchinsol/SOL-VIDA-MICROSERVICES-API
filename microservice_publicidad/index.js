import express from "express";
import cors from 'cors';
import morgan from "morgan";

// IMPORT ROUTES
import routePublicidad from "./routes/publicidad_route.js";

const app_micro_publicidad = express()

const PORT = 4008

app_micro_publicidad.use(cors())
app_micro_publicidad.use(morgan('combined'))
app_micro_publicidad.use(express.json())

app_micro_publicidad.use('/api/v1',routePublicidad)


app_micro_publicidad.listen(PORT,()=>{
    console.log(`Microservice PUBLICIDAD running http://localhost:${PORT}`)
})

export {app_micro_publicidad}