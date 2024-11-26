import { db_pool } from "../publicidad_config.js"

const modelPublicidad ={
    getPublicidad: async () =>{
        try{
            const resultado = await db_pool.any(`SELECT * FROM public.banner`)
            return resultado
        }
        catch(error){
            throw new Error(`Error query get: ${error}`)
        }
    }
}
export default modelPublicidad