import { db_pool } from '../config.js'

const modelPedidoDetalle = {
    getPedidoDetalle: async () => {
        try {
            const resultado = await db_pool.any(`
                SELECT * FROM public.pedido`)
            return resultado
        } catch (error) {
            throw new Error(`Error query get: ${error}`)
        }
    },
    postPedidoDetalle: async (pedido) => {
        try {
            const resultado = await db_pool.one(`
                INSERT INTO public.pedido (ruta_id,cliente_id,subtotal,descuento,total,fecha,tipo,estado,observacion,tipo_pago)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
                 [pedido.ruta_id,pedido.cliente_id,pedido.subtotal,pedido.descuento,pedido.total,pedido.fecha,pedido.tipo,pedido.estado,pedido.observacion,pedido.tipo_pago])
            return resultado
        } catch (error) {
            throw new Error(`Error query post: ${error}`)
        }
    }
}

export default modelPedidoDetalle