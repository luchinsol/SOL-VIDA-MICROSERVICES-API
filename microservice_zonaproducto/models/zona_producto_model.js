import { db_pool } from '../config.js'

const modelZonaProducto = {
    getCantidadPromoProducto: async (idZona, idProducto) => {
            try{
                const resultado = await db_pool.oneOrNone(
                    `SELECT precio FROM public.zona_producto WHERE zona_id = $1 AND producto_id=$2`
                    ,[idZona, idProducto]
                );
                return resultado;
            }catch(error){
                throw new Error(`Error get data: ${error}`);
            }
    }
}
export default modelZonaProducto