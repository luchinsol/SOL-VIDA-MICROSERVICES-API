import { db_pool } from '../producto_config.js'

const modelProducto = {
    getProducto: async () => {
        try {
            const resultado = await db_pool.any(`
                    SELECT * FROM public.producto`)
            return resultado
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },
    getProductoId: async (id) => {
        try {
            const resultado = await db_pool.oneOrNone(`
                    SELECT * FROM public.producto WHERE id=$1`, [id]);
            return resultado;
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    getPromocion: async () => {
        try {
            const resultado = await db_pool.any(`
                    SELECT * FROM public.promocion`)
            return resultado
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    getPromocionId: async (id) => {
        try {
            const resultado = await db_pool.oneOrNone(`
                    SELECT * FROM public.promocion WHERE id=$1`, [id]);
            return resultado;
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    getCantidadPromoProducto: async (idPromocion, idProducto) => {
        try{
            const resultado = await db_pool.oneOrNone(
                `SELECT cantidad FROM public.producto_promocion WHERE promocion_id = $1 AND producto_id=$2`
                ,[idPromocion, idProducto]
            );
            return resultado;
        }catch(error){
            throw new Error(`Error get data: ${error}`);
        }
    }

    
}

export default modelProducto