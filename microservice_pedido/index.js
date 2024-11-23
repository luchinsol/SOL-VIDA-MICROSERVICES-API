import express from "express";
import cors from 'cors';
import morgan from "morgan";

// IMPORT ROUTES
import routerPedido from "./routes/pedido_route.js";


const app_micro_pedido = express()

const PORT = 5001

app_micro_pedido.use(cors())
app_micro_pedido.use(morgan('combined'))
app_micro_pedido.use(express.json())

app_micro_pedido.use('/api/v1',routerPedido)

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

app_micro_pedido.listen(PORT,()=>{
    console.log(`Microservice PEDIDO_DETALLE running http://localhost:${PORT}`)
})

export {app_micro_pedido}