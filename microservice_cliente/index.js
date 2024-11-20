import express from "express";
import cors from 'cors';
import morgan from "morgan";

// IMPORT ROUTES
import routerCliente from "./routes/cliente_route.js";

const app_micro_cliente = express()

const PORT = 4002

app_micro_cliente.use(cors())
app_micro_cliente.use(morgan('combined'))
app_micro_cliente.use(express.json())

app_micro_cliente.use('/api/v1',routerCliente)

// MANEJO DE ERRORES
/*app_micro_pedido.use('/api', (req, res) => {
    //console.log("---no esta esa ruta")
    res.status(404).json({ error: 'Ruta no encontrada' });

});
// Manejo de errores
function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }
    res.status(500).json({ error: 'Error interno del servidor' });
}*/

app_micro_cliente.listen(PORT,()=>{
    console.log(`Microservice CLIENTE running http://localhost:${PORT}`)
})

export {app_micro_cliente}