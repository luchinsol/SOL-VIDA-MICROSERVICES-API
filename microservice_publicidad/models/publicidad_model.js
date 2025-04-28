import { db_pool } from "../publicidad_config.js"

const modelPublicidad ={
    getPublicidad: async () =>{
        try{
            const resultado = await db_pool.any(`SELECT * FROM public.banner`)
            return resultado
        }
        catch(error){
            throw new Error(`Error get data: ${error}`);
        }
    },
    getPublicidadBanners: async () => {
        try {
            const resultado = await db_pool.any(`
                SELECT 
                    b.id AS banner_id,
                    b.foto,
                    b.titulo AS banner_titulo,
                    b.descripcion,
                    b.fondo,
                    e.id AS evento_id,
                    e.fecha_inicio,
                    e.fecha_expiracion,
                    e.titulo AS evento_titulo
                FROM public.banner b
                INNER JOIN public.evento e 
                    ON b.evento_id = e.id
                WHERE CURRENT_DATE >= e.fecha_inicio 
                  AND CURRENT_DATE <= e.fecha_expiracion
            `);
            return resultado;
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    }
    
}
export default modelPublicidad