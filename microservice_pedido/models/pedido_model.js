import { db_pool } from '../config.js'
import amqp from 'amqplib';
const RABBITMQ_URL = 'amqp://localhost';
const QUEUE_NAME = 'new_orders';

// Función para conectar y obtener un canal de RabbitMQ
async function getRabbitMQChannel() {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    await channel.assertQueue(QUEUE_NAME, { durable: true });
    return channel;
}

const modelPedidoDetalle = {
    getPedido: async () => {
        try {
            const resultado = await db_pool.any(`
                SELECT * FROM public.pedido`)
            return resultado
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },
    getPedidoId: async (id) => {
        try {
            const resultado = await db_pool.oneOrNone(`
                SELECT * FROM public.pedido WHERE id=$1`, [id]);
            return resultado;
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },



    postPedido: async (pedido) => {
        try {
            const resultado = await db_pool.one(`
                INSERT INTO public.pedido (cliente_id,subtotal,descuento,total,fecha,tipo,estado,observacion,tipo_pago)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
                [pedido.cliente_id, pedido.subtotal, pedido.descuento, pedido.total, pedido.fecha, pedido.tipo, pedido.estado, pedido.observacion, pedido.tipo_pago]);
            return resultado;
        } catch (error) {
            throw new Error(`Error post data ${error}`);
        }
    },
    updatePedido: async (idPedido, pedido) => {
        try {
            const resultado = await db_pool.oneOrNone(`UPDATE public.pedido SET tipo=$1, estado=$2
                WHERE id=$3 RETURNING *`, [pedido.tipo, pedido.estado, idPedido])
            if (!resultado) {
                return null;
            }
            return resultado;
        } catch (error) {
            throw new Error(`Error put data: ${error.message}`);
        }
    },
    deletePedido: async (id) => {
        try {
            const resultado = await db_pool.result(`DELETE FROM public.pedido WHERE id=$1`, [id])
            return resultado.rowCount === 1
        } catch (error) {
            throw new Error(`Error delete data ${error.message}`);
        }
    },

    //BASE DE DATOS DE DETALLE PEDIDO
    getPedidoDetalle: async () => {
        try {
            const resultado = await db_pool.any(`
                SELECT * FROM public.detalle_pedido`)
            return resultado
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },
    getPedidoDetalleId: async (id) => {
        try {
            const resultado = await db_pool.oneOrNone(`
                SELECT * FROM public.detalle_pedido WHERE id=$1`, [id])
            return resultado
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },
    postPedidoDetalle: async (pedido) => {
        try {
            const resultado = await db_pool.one(`
                INSERT INTO public.detalle_pedido (pedido_id,producto_id,cantidad)
                 VALUES ($1,$2,$3) RETURNING *`,
                [pedido.pedido_id, pedido.producto_id, pedido.cantidad])
            return resultado
        } catch (error) {
            throw new Error(`Error post data ${error}`);
        }
    },
    updatePedidoDetalle: async (idPedido, pedido) => {
        try {
            const resultado = await db_pool.oneOrNone(`UPDATE public.detalle_pedido SET cantidad=$1
                WHERE id=$2 RETURNING *`, [pedido.cantidad, idPedido])
            if (!resultado) {
                return null;
            }
            return resultado;
        } catch (error) {
            throw new Error(`Error put data: ${error.message}`);
        }
    },
    deletePedidoDetalle: async (idPedido) => {
        try {
            const resultado = await db_pool.result(`DELETE FROM public.detalle_pedido WHERE id=$1`, [idPedido])
            return resultado.rowCount === 1
        } catch (error) {
            throw new Error(`Error delete data ${error.message}`);
        }
    },

    //ENDPOINT QUE TRAE EL PEDIDO
    getDetallePedidoAll: async (id) => {
        try {
            const resultado = await db_pool.any(`
               SELECT 
    ped.total, 
    ped.cliente_id, 
    ped.ubicacion_id, 
    ped.conductor_id, 
    ped.almacen_id, 
    det.producto_id, 
    det.cantidad, 
    det.promocion_id
FROM 
    public.pedido AS ped
INNER JOIN 
    public.detalle_pedido AS det ON ped.id = det.pedido_id
WHERE 
    ped.id = $1
ORDER BY det.producto_id ASC ;`, [id])
            return resultado
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    //ESTE ENDPOINT CUENTA CON LO SIGUIENTE EL NUMERO TOTAL DE PEDIDOS
    getPedidosCount: async (id) => {
        try {
            const resultado = await db_pool.oneOrNone(`
               SELECT COUNT(*) AS total_pedidos
FROM public.pedido
WHERE conductor_id = $1 AND estado = 'entregado';`, [id])
            return resultado
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },
    //ENDPOINT DEL ULTIMO PEDIDO
    getPedidosConductorInfo: async (id) => {
        try {
            const resultado = await db_pool.oneOrNone(`
               SELECT * 
FROM public.pedido
WHERE conductor_id = $1 AND estado = 'entregado'
ORDER BY fecha DESC
LIMIT 1;`, [id])
            return resultado
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },


    getPedidosSinConductor: async () => {
        try {
            const resultado = await db_pool.any(`
               SELECT * 
FROM public.pedido
WHERE conductor_id IS NULL AND estado = 'pendiente'
ORDER BY id ASC;
`)
            return resultado
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    updatePedidoAlmacen: async (idPedido, pedido) => {
        try {
            const resultado = await db_pool.oneOrNone(`UPDATE public.pedido SET almacen_id=$1
                WHERE id=$2 RETURNING *`, [pedido.almacen_id, idPedido])
            if (!resultado) {
                return null;
            }
            return resultado;
        } catch (error) {
            throw new Error(`Error put data: ${error.message}`);
        }
    },
    

    /*
    getPedidos: async (almacen_id) => {
        try {
            const pedido_almacen = await db_pool.any(
                `SELECT * FROM public.pedido WHERE almacen_id = $1`, [almacen_id]
            )
            let Almacenes = [1, 2, 3]
            // Get current date and time
            const now = new Date();

            // ISO format
            const isoTime = now.toISOString();  // 2024-12-26T10:30:15.123Z

            // Local time string
            const localTime = now.toLocaleString();  // 12/26/2024, 10:30:15 AM

            // Custom format using Date methods
            const customTime = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`; // 10:30:15

            for (var i = 0; i < pedido_almacen.length; i++) {
                if (pedido_almacen[i].hac - customTime >= 20) {
                    pedido_almacen[i].hac = customTime
                    while (pedido_almacen[i].cvr < 2) {
                        let AlmaX = Almacenes.filter(pedido_almacen[i].almacen_id)
                        pedido_almacen[i].cvr++
                        let tempAlmacenes = AlmaX
                        let newAlmacen = Voronoi(pedido_almacen[i].ubicacion_id, tempAlmacenes)
                        pedido_almacen[i].almacen_id = newAlmacen
                        const Almacen_Actual = await db_pool.one(`
                        UPDATE FROM public.pedido SET almacen_id=$1 where id=$2 RETURNING *`, pedido_almacen[i].almacen_id, pedido_almacen[i].id)
                        if (Almacen_Actual[i].estado == "en proceso") {
                            break;
                        }
                    }
                }
            }

            // hora actual
            let horaActual = new Date()
            let hora = horaActual.getHours()

            let bandeja_entrada = []
            let almacenes = ['A', 'B', 'C']
            let hora_entrega = 90
            for (var i = 0; i < bandeja_entrada.length; i++) {
                if (bandeja_entrada[i].hora_acumulada - hora === 45) {
                    bandeja_entrada[i].hora_acumulada = hora;

                    // la cantidad 2 depende de los almacenes menos 1
                    while (bandeja_entrada[i].cantidad_noentregado < 2) {
                        let nuevosAlmacenes = almacenes.filter(elemento => elemento !== bandeja_entrada[i].almacen_id);
                        bandeja_entrada[i].almacen_id = Voronoi(bandeja_entrada[i].ubicacion_id, nuevosAlmacenes)
                        const result = await db_pool.one(`UPDATE public.pedido SET almacen_id = $1 WHERE id = $2`,
                            [bandeja_entrada[i].almacen_id, bandeja_entrada[i].id]
                        )

                        bandeja_entrada[i].cantidad_noentregado++

                        if (bandeja_entrada[i].estado === 'entregado') {
                            break;
                        }


                    }
                    // la cantidad depende del número de almacenes
                    if (bandeja_entrada[i].cantidad_noentregado === 3) {
                        bandeja_entrada[i].estado = "rezagado"
                        const rezagado = await db_pool.one(`UPDATE public.pedido SET estado=$1 WHERE id=$2`, [
                            bandeja_entrada[i].estado, bandeja_entrada[i].id
                        ])
                    }
                }
            }
        } catch (error) {
            throw new Error(`Error Pedido Almacen ${error}`)
        }
    }*/

}

export default modelPedidoDetalle