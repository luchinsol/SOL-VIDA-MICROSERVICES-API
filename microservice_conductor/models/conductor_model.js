import { db_pool } from "../conductor_config.js";

const modelUserConductor = {
    getAllUsersConductor: async () => {
        try {
            //const userConductores = await db_pool.any('select * from personal.usuario inner join personal.conductor on personal.usuario.id = personal.conductor.usuario_id')
            const userConductores = await db_pool.any(
                `select * from public.conductor`)
            return userConductores
        } catch (e) {
            throw new Error(`Error query clients: ${err}`);
        }
    },

    getConductorUserId: async (id) => {
        try {
            const resultado = await db_pool.one(`
                SELECT * FROM public.conductor WHERE id = $1`, [id])
            return resultado
        } catch (error) {
            throw new Error(`Error query get: ${error}`)
        }
    },

    deleteUserConductor: async (id) => {
        try {
            const result = await db_pool.result('DELETE FROM public.conductor WHERE ID = $1', [id]);
            return result.rowCount === 1; // Devuelve true si se eliminó un registro, false si no se encontró el registro
        } catch (error) {
            throw new Error(`Error en la eliminación del cliente: ${error.message}`);
        }
    },

    updateUserConductor: async (id, conductor) => {

        try {
            const resultado = await db_pool.one(`UPDATE public.conductor SET nombres=$1, apellidos=$2, n_licencia=$3, dni=$4, fecha_nacimiento=$5 WHERE id = $6 RETURNING *`,
                [conductor.nombres, conductor.apellidos, conductor.n_licencia, conductor.dni, conductor.fecha_nacimiento, id]);
            return resultado
        } catch (error) {
            throw new Error(`Error en la actualización del conductor: ${error.message}`);
        }
    },

    createUserConductor: async (conductor) => {

        try {
            
            const resultado = await db_pool.one(`
                INSERT INTO public.conductor (
                    usuario_id, nombres, apellidos, dni, fecha_nacimiento, n_licencia, n_soat, foto_licencia,
                     foto_soat, foto_otros, valoración, latitud, longitud, estado_registro, estado_trabajo
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
                ) RETURNING *
            `, [
                conductor.usuario_id, conductor.nombres,conductor.apellidos ,conductor.dni, conductor.fecha_nacimiento, 
                conductor.n_licencia, conductor.n_soat, conductor.foto_licencia,
                conductor.foto_soat, conductor.foto_otros, conductor.valoración, conductor.latitud, 
                conductor.longitud, conductor.estado_registro, conductor.estado_trabajo 
            ]);

            return resultado;

        } catch (error) {
            throw new Error(`Error query post ${error}`)
        }
    },

}

export default modelUserConductor;
