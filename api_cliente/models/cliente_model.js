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
    },
    postCliente : async () => {
        try {
            const resultado = await db_pool.one(`
                INSERT INTO public.cliente (usuario_id,nombre,apellidos,direccion,telefono,email,distrito,ruc,fecha_nacimiento,
                fecha_creacion_cuenta,sexo,dni,codigo,calificacion,saldo_beneficios,direccion_empresa,suscripcion,nombre_empresa,frecuencia,quiereretirar,medio_retiro,banco_retiro,numero_cuenta)
                 VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23) RETURNING *`)
            return resultado

        } catch (error) {
            throw new Error(`Error query post ${error}`)
        }
    } 
}

export default modelCliente