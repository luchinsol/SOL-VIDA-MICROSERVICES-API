import { db_pool } from "../ubicacion_config.js";

const modelUbicacion = {
    //TABLA UBICACION
    getUbicacion: async () => {
        try {
            const resultado = await db_pool.any('SELECT * FROM public.ubicacion')
            return resultado;
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    getUbicacionId: async (id) => {
        try {
            const resultado = await db_pool.oneOrNone('SELECT * FROM public.ubicacion WHERE id = $1', [id])
            return resultado
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    createUbicacion: async (ubicacion) => {

        try {
            const ubicaciones = await db_pool.one('INSERT INTO public.ubicacion(departamento, provincia,distrito,direccion,latitud,longitud,cliente_id,zona_trabajo_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
                [ubicacion.departamento, ubicacion.provincia, ubicacion.distrito, ubicacion.direccion, ubicacion.latitud, ubicacion.longitud, ubicacion.cliente_id, ubicacion.zona_trabajo_id])
            return ubicaciones

        } catch (error) {
            throw new Error(`Error post data ${error}`);
        }


    },

    updateRelacionesUbicacion: async (idRelacionUbicacion, zona_trabajo) => {
        try {
            const resultado = await db_pool.oneOrNone(`UPDATE public.ubicacion SET zona_trabajo_id=$1 
                WHERE id=$2 RETURNING *`, [zona_trabajo.zona_trabajo_id, idRelacionUbicacion])
            if (!resultado) {
                return null;
            }
            return resultado;
        } catch (error) {
            throw new Error(`Error put data: ${error.message}`);
        }
    },

    deleteRelacionesUbicacion: async (idUbicacion) => {
        try {
            const result = await db_pool.result(`DELETE FROM public.ubicacion WHERE id = $1`, [idUbicacion])
            return result.rowCount === 1
        } catch (error) {
            throw new Error(`Error delete data ${error.message}`);
        }
    },

    //TABLA ZONA TRABAJO
    getZona: async () => {
        try {
            const resultado = await db_pool.any('SELECT * FROM public.zona_trabajo')
            //console.log("zonas")
            //console.log(zona)
            return resultado
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    getZonaId: async (id) => {
        try {
            const resultado = await db_pool.oneOrNone('SELECT * FROM public.zona_trabajo WHERE id = $1', [id]);
            //console.log("zonas")
            //console.log(zona)
            return resultado;
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    createZona: async (zona) => {

        try {
            const resultado = await db_pool.one('INSERT INTO public.zona_trabajo(nombre,poligono_coordenadas) VALUES ($1,$2) RETURNING *',
                [zona.nombre, zona.poligono_coordenadas])
            return resultado

        } catch (error) {
            throw new Error(`Error post data ${error}`);
        }


    },

    updateZona: async (id_zona, zona) => {
        try {
            const resultado = await db_pool.oneOrNone(`UPDATE public.zona_trabajo SET nombre=$1 
                WHERE id=$2 RETURNING *`, [zona.nombre, id_zona]);
            if (!resultado) {
                return null;
            }
            return resultado;
        } catch (error) {
            throw new Error(`Error put data: ${error.message}`);
        }
    },

    deleteZona: async (idZona) => {
        try {
            const resultado = await db_pool.result(`DELETE FROM public.zona_trabajo WHERE id = $1`, [idZona])
            return resultado.rowCount === 1
        } catch (error) {
            throw new Error(`Error delete data ${error.message}`);
        }
    },



}
export default modelUbicacion