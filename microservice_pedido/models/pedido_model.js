import { db_pool } from '../config.js'
import amqp from 'amqplib';
const RABBITMQ_URL ='amqp://rabbitmq';// 'amqp://localhost';
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
                INSERT INTO public.pedido (cliente_id,subtotal,descuento,total,fecha,tipo,estado,observacion,tipo_pago,ubicacion_id)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
                [pedido.cliente_id, pedido.subtotal, pedido.descuento, pedido.total, pedido.fecha, pedido.tipo, pedido.estado, pedido.observacion, pedido.tipo_pago,pedido.ubicacion_id]);
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
                INSERT INTO public.detalle_pedido (pedido_id,producto_id,cantidad,promocion_id)
                 VALUES ($1,$2,$3,$4) RETURNING *`,
                [pedido.pedido_id, pedido.producto_id, pedido.cantidad,pedido.promocion_id])
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
    
    updatePedidoPrecio: async (idPedido, pedido) => {
        try {
            const resultado = await db_pool.oneOrNone(`UPDATE public.pedido SET subtotal=$1, total =$2
                WHERE id=$3 RETURNING *`, [pedido.subtotal, pedido.total, idPedido])
            if (!resultado) {
                return null;
            }
            return resultado;
        } catch (error) {
            throw new Error(`Error put data: ${error.message}`);
        }
    },

    updatePedidoConductor: async (idPedido, pedido) => {
        try{
            const resultado = await db_pool.oneOrNone(`UPDATE public.pedido SET conductor_id=$1
                WHERE id=$2 RETURNING *`, [pedido.conductor_id, idPedido])
            if (!resultado) {
                return null;
            }
            return resultado;
        }catch(error){
            throw new Error(`Error put data: ${error.message}`);
        }
    },

    getPedidoHistoryConductor: async (id, fecha) => {
        try {
            const resultado = await db_pool.manyOrNone(`
                SELECT 
                    pp.id, 
                    pp.cliente_id, 
                    pp.subtotal, 
                    pp.descuento, 
                    pp.total, 
                    pp.fecha, 
                    pp.tipo, 
                    pp.foto, 
                    pp.estado, 
                    pp.observacion, 
                    pp.tipo_pago, 
                    pp.beneficiado_id, 
                    pp.ubicacion_id, 
                    pp.conductor_id, 
                    pp.almacen_id,
                    pdp.id AS id_detalle, 
                    pdp.producto_id, 
                    pdp.cantidad, 
                    pdp.promocion_id
                FROM public.pedido AS pp
                INNER JOIN public.detalle_pedido AS pdp ON pp.id = pdp.pedido_id
                WHERE pp.conductor_id = $1
                AND pp.estado = 'entregado'
                AND DATE(pp.fecha) = $2
                ORDER BY pp.id, pdp.id;
            `, [id, fecha]);
    
            // Agrupar los pedidos
            const pedidosAgrupados = resultado.reduce((acc, row) => {
                // Buscar si el pedido ya existe en el array acumulador
                let pedido = acc.find(p => p.id === row.id);
    
                if (!pedido) {
                    // Si no existe, creamos la estructura del pedido
                    pedido = {
                        id: row.id,
                        cliente: row.cliente_id,
                        total: row.total,
                        fecha:row.fecha,
                        tipo:row.tipo,
                        estado:row.estado,
                        ubicacion:row.ubicacion_id,
                        detalles_pedido: []
                    };
                    acc.push(pedido);
                }
    
                // Agregamos el detalle de pedido a la lista
                pedido.detalles_pedido.push({
                    id: row.id_detalle,
                    producto_id: row.producto_id,
                    cantidad: row.cantidad,
                    promocion_id: row.promocion_id
                });
    
                return acc;
            }, []);
    
          
            return pedidosAgrupados;
    
        } catch (error) {
            throw new Error(`Error get data ${error}`);
        }
    },

    updatePedidoConductorEstado: async (idPedido, pedido) => {
        try{
            const resultado = await db_pool.oneOrNone(`UPDATE public.pedido SET conductor_id=$1, estado=$2, almacen_id=$3
                WHERE id=$4 RETURNING *`, [pedido.conductor_id, pedido.estado, pedido.almacen_id ,idPedido])
            if (!resultado) {
                return null;
            }
            return resultado;
        }catch(error){
            throw new Error(`Error put data: ${error.message}`);
        }
    }

}

export default modelPedidoDetalle