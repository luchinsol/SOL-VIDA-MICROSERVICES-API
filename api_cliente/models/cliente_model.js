import { db_pool } from "../cliente_config.js"

const modelCliente ={
    getCliente: async () => {
        try {
            const resultado = await db_pool.any(`
                SELECT * FROM public.cliente`)
            return resultado
        } catch (error) {
            throw new Error(`Error query get: ${error}`)
        }
    },
    getClienteUserId: async (id) => {
        try {
            const resultado = await db_pool.one(`
                SELECT * FROM public.cliente WHERE usuario_id = $1`,[id])
            return resultado
        } catch (error) {
            throw new Error(`Error query get: ${error}`)
        }
    } 
}

export default modelCliente