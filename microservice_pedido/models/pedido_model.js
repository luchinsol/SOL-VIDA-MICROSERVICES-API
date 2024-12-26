import { db_pool } from '../config.js'



const modelPedidoDetalle = {
    getPedido: async () => {
        try {
            const resultado = await db_pool.any(`
                SELECT * FROM public.pedido`)
            return resultado
        } catch (error) {
            throw new Error(`Error query get: ${error}`)
        }
    },
    getPedidoId: async (id) => {
        try {
            const resultado = await db_pool.one(`
                SELECT * FROM public.pedido WHERE id=$1`,[id])
            return resultado
        } catch (error) {
            throw new Error(`Error query get: ${error}`)
        }
    },

    

    postPedido: async (pedido) => {
        try {
            const resultado = await db_pool.one(`
                INSERT INTO public.pedido (cliente_id,subtotal,descuento,total,fecha,tipo,estado,observacion,tipo_pago)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
                 [pedido.cliente_id,pedido.subtotal,pedido.descuento,pedido.total,pedido.fecha,pedido.tipo,pedido.estado,pedido.observacion,pedido.tipo_pago])
            return resultado
        } catch (error) {
            throw new Error(`Error query post: ${error}`)
        }
    },
    updatePedido: async (idPedido, pedido)=>{
        try{
            const resultado= await db_pool.result(`UPDATE public.pedido SET tipo=$1, estado=$2
                WHERE id=$2 RETURNING *`, [pedido.tipo,pedido.estado,idPedido])
            return resultado
        }catch(error){
            throw new Error(`Error Update ${error}`)
        }
    },
    deletePedido: async(idPedido) => {
        try{
            const resultado = await db_pool.result(`DELETE FROM public.pedido WHERE id=$1`,[idPedido])
            return resultado.rowCount === 1
        } catch(error){
            throw new Error(`Error en Eliminación ${error.message}`)
        }
    },

    getPedidoDetalle: async () => {
        try {
            const resultado = await db_pool.any(`
                SELECT * FROM public.detalle_pedido`)
            return resultado
        } catch (error) {
            throw new Error(`Error query get: ${error}`)
        }
    },
    getPedidoDetalleId: async (id) => {
        try {
            const resultado = await db_pool.one(`
                SELECT * FROM public.detalle_pedido WHERE id=$1`,[id])
            return resultado
        } catch (error) {
            throw new Error(`Error query get: ${error}`)
        }
    },


    getDetallePedidoAll: async(id)=>{
        try{
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
ORDER BY det.producto_id ASC ;`,[id])
            return resultado 
        }catch(error){
            throw new Error(`Error en Eliminación ${error.message}`)
        }
    },

    
    //ESTE ENDPOINT CUENTA CON LO SIGUIENTE EL NUMERO TOTAL DE PEDIDOS
    getPedidosCount: async(id)=>{
        try{
            const resultado = await db_pool.any(`
               SELECT COUNT(*) AS total_pedidos
FROM public.pedido
WHERE conductor_id = $1 AND estado = 'entregado';`,[id])
            return resultado 
        }catch(error){
            throw new Error(`Error en Eliminación ${error.message}`)
        }
    },
    //ENDPOINT DEL ULTIMO PEDIDO
    getPedidosConductorInfo: async(id)=>{
        try{
            const resultado = await db_pool.any(`
               SELECT * 
FROM public.pedido
WHERE conductor_id = $1 AND estado = 'entregado'
ORDER BY fecha DESC
LIMIT 1;`,[id])
            return resultado 
        }catch(error){
            throw new Error(`Error en Eliminación ${error.message}`)
        }
    },


    getPedidosSinConductor: async()=>{
        try{
            const resultado = await db_pool.any(`
               SELECT * 
FROM public.pedido
WHERE conductor_id IS NULL AND estado = 'pendiente'
ORDER BY id ASC;
`)
            return resultado 
        }catch(error){
            throw new Error(`Error en Eliminación ${error.message}`)
        }
    },

    updatePedidoAlmacen: async (idPedido, pedido)=>{
        try{
            const resultado= await db_pool.one(`UPDATE public.pedido SET almacen_id=$1
                WHERE id=$2 RETURNING *`, [pedido.almacen_id,idPedido])
            return resultado
        }catch(error){
            throw new Error(`Error Update ${error}`)
        }
    },

    getPedidos: async(almacen_id)=>{
    try{       
        const pedido_almacen = await db_pool.any(
                `SELECT * FROM public.pedido WHERE almacen_id = $1`,[almacen_id]
        )
    let Almacenes = [1,2,3]
    // Get current date and time
    const now = new Date();
        
    // ISO format
    const isoTime = now.toISOString();  // 2024-12-26T10:30:15.123Z

    // Local time string
    const localTime = now.toLocaleString();  // 12/26/2024, 10:30:15 AM

    // Custom format using Date methods
    const customTime = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`; // 10:30:15

    for (var i=0; i<pedido_almacen.length;i++){
            if(pedido_almacen[i].hac - customTime >= 20){
                pedido_almacen[i].hac = customTime
                while (pedido_almacen[i].cvr < 2){
                    let AlmaX = Almacenes.filter(pedido_almacen[i].almacen_id)
                    pedido_almacen[i].cvr++
                    let tempAlmacenes = AlmaX
                    let newAlmacen = Voronoi(pedido_almacen[i].ubicacion_id, tempAlmacenes)
                    pedido_almacen[i].almacen_id = newAlmacen
                    const Almacen_Actual = await db_pool.one(`
                        UPDATE FROM public.pedido SET almacen_id=$1 where id=$2 RETURNING *`, pedido_almacen[i].almacen_id,pedido_almacen[i].id)
                    if(Almacen_Actual[i].estado =="en proceso"){
                        break;
                    }
                }
            } 
        }
    }
    catch(error){
        throw new Error(`Error Pedido Almacen ${error}`)
    }
}


}

export default modelPedidoDetalle