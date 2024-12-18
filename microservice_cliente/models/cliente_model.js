import { db_pool } from "../cliente_config.js"

const modelCliente = {
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
                SELECT * FROM public.cliente WHERE id = $1`, [id])
            return resultado
        } catch (error) {
            throw new Error(`Error query get: ${error}`)
        }
    }, 
    postCliente: async (cliente) => {
        try {
            const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
            let CODE = '';

                for (let i = 0; i < 5; i++) {
                    const randomIndex = Math.floor(Math.random() * characters.length);
                    CODE += characters.charAt(randomIndex);
                }
            
            
            
            const resultado = await db_pool.one(`
                INSERT INTO public.cliente (
                    usuario_id, nombre, apellidos, direccion, telefono, email, distrito, ruc, fecha_nacimiento,
                    fecha_creacion_cuenta, sexo, dni, codigo, calificacion, saldo_beneficios, direccion_empresa,
                    suscripcion, nombre_empresa, frecuencia, quiereretirar, medio_retiro, banco_retiro, numero_cuenta
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23
                ) RETURNING *
            `, [
                cliente.usuario_id, cliente.nombre, cliente.apellidos, cliente.direccion, cliente.telefono,
                cliente.email, cliente.distrito, cliente.ruc, cliente.fecha_nacimiento, cliente.fecha_creacion_cuenta,
                cliente.sexo, cliente.dni, CODE, cliente.calificacion, cliente.saldo_beneficios,
                cliente.direccion_empresa, cliente.suscripcion, cliente.nombre_empresa, cliente.frecuencia,
                cliente.quiereretirar, cliente.medio_retiro, cliente.banco_retiro, cliente.numero_cuenta
            ]);

            return resultado;

        } catch (error) {
            throw new Error(`Error query post ${error}`)
        }
    },
    putCliente: async (id, cliente) => {
        try {
            const resultado = await db_pool.one(`
                UPDATE public.cliente SET nombre = $1, apellidos = $2, telefono = $3,
                email = $4 WHERE id = $5`, [
                cliente.nombre, cliente.apellidos, cliente.telefono, cliente.email, id
            ])
            return resultado
        } catch (error) {
            throw new Error(`Error query put ${error}`)
        }
    },
    deleteCliente: async (id) => {
        try {
            const resultado = db_pool.one(`DELETE FROM public.cliente WHERE id = $1`,
                [id]
            )
            return resultado
        } catch (error) {
            throw new Error(`Error query delete ${error}`)
        }
    }

}

export default modelCliente