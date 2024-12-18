import { db_pool } from "../almacen_config.js";

const modelAlmacen = {
    getAllAlmacen: async () => {
        try {
            //const userConductores = await db_pool.any('select * from personal.usuario inner join personal.conductor on personal.usuario.id = personal.conductor.usuario_id')
            const userConductores = await db_pool.any(
                `select * from public.almacen`)
            return userConductores
        } catch (e) {
            throw new Error(`Error query clients: ${err}`);
        }
    },

    getAlmacenId: async (id) => {
        try {
            const resultado = await db_pool.one(`
                SELECT * FROM public.almacen WHERE id = $1`, [id])
            return resultado
        } catch (error) {
            throw new Error(`Error query get: ${error}`)
        }
    },

    deleteAlmacen: async (id) => {
        try {
            const result = await db_pool.result('DELETE FROM public.almacen WHERE ID = $1', [id]);
            return result.rowCount === 1; // Devuelve true si se eliminó un registro, false si no se encontró el registro
        } catch (error) {
            throw new Error(`Error en la eliminación del cliente: ${error.message}`);
        }
    },

    updateAlmacen: async (id, almacen) => {

        try {
            const resultado = await db_pool.one(`UPDATE public.almacen SET nombre=$1, horario=$2, departamento=$3, provincia=$4, direccion=$5 WHERE id = $6 RETURNING *`,
                [almacen.nombre, almacen.horario, almacen.departamento, almacen.provincia, almacen.direccion, id]);
            return resultado
        } catch (error) {
            throw new Error(`Error en la actualización del conductor: ${error.message}`);
        }
    },

    createAlmacen: async (almacen) => {

        try {
            
            const resultado = await db_pool.one(`
                INSERT INTO public.almacen (
                    nombre, latitud, longitud, horario, departamento, provincia,
                    direccion
                ) VALUES (
                    $1, $2, $3, $4, $5, $6, $7
                ) RETURNING *
            `, [
                almacen.nombre, almacen.latitud, almacen.longitud, almacen.horario,
                almacen.departamento,almacen.provincia,almacen.direccion
            ]);

            return resultado;

        } catch (error) {
            throw new Error(`Error query post ${error}`)
        }
    },



}

export default modelAlmacen;