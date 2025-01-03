import { db_pool } from '../config.js'

const modelZonaPromocion = {

    getZonaPromocion: async (idZona,idPromocion) => {
            try{
                const resultado = await db_pool.oneOrNone(
                    `SELECT precio,descuento FROM public.zona_promocion WHERE zona_id = $1 AND promocion_id=$2`
                    ,[idZona, idPromocion]
                );
                return resultado;
            }catch(error){
                throw new Error(`Error get data: ${error}`);
            }
        }

}

export default modelZonaPromocion