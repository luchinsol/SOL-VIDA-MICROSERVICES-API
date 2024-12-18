import { db_pool } from "../ubicacion_config.js";

const modelUbicacion = { 
    //TABLA UBICACION
    getUbicacion : async() => {
        try {
            const ubicaciones = await db_pool.any('SELECT * FROM public.ubicacion')
            return ubicaciones
        } catch (error) {
            throw new Error(`Error conseguir ${error}`)
        }
    },

    createUbicacion :async(ubicacion) => {
        
        try {
            const ubicaciones = await db_pool.one('INSERT INTO public.ubicacion(departamento, provincia,distrito,direccion,latitud,longitud,cliente_id,zona_trabajo_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
            [ubicacion.departamento,ubicacion.provincia,ubicacion.distrito,ubicacion.direccion,ubicacion.latitud,ubicacion.longitud,ubicacion.cliente_id,ubicacion.zona_trabajo_id])
            return ubicaciones

        } catch (error) {
            throw new Error(`Error de inserción : ${error}`)
        }
       

    },

    deleteRelacionesUbicacion : async(idUbicacion) =>{
        try {
            const resultado = await db_pool.result(`DELETE FROM public.ubicacion WHERE id = $1`,[idUbicacion])
            return resultado.rowCount === 1
        } catch (error) {
            throw new Error(`Error en la eliminacion de ubicacion: ${error.message}`)
        }
    },
    updateRelacionesUbicacion : async(idRelacionUbicacion,zona_trabajo) => {
        try{
            const ubicacion = await db_pool.one(`UPDATE public.ubicacion SET zona_trabajo_id=$1 
                WHERE id=$2 RETURNING *`,[zona_trabajo,idRelacionUbicacion])
            return ubicacion

        }catch(error){
            throw new Error(`Error update ${error}`)
        }
    },
    //TABLA ZONA TRABAJO
    getZona : async() => {
        try {
            const zona = await db_pool.any('SELECT * FROM public.zona_trabajo')
            //console.log("zonas")
            //console.log(zona)
            return zona
        } catch (error) {
            throw new Error(`Error conseguir ${error}`)
        }
    },

    createZona :async(zona) => {
        
        try {
            const ubicaciones = await db_pool.one('INSERT INTO public.zona_trabajo(nombre,poligono_coordenadas) VALUES ($1,$2) RETURNING *',
            [zona.nombre,zona.poligono_coordenadas])
            return ubicaciones

        } catch (error) {
            throw new Error(`Error de inserción : ${error}`)
        }
       

    },

    updateZona : async(id_zona,zona) => {
        try{
            const ubicacion = await db_pool.one(`UPDATE public.zona_trabajo SET nombre=$1 
                WHERE id=$2 RETURNING *`,[zona,id_zona])
            return ubicacion

        }catch(error){
            throw new Error(`Error update ${error}`)
        }
    },

    deleteZona : async(idZona) =>{
        try {
            const resultado = await db_pool.result(`DELETE FROM public.zona_trabajo WHERE id = $1`,[idZona])
            return resultado.rowCount === 1
        } catch (error) {
            throw new Error(`Error en la eliminacion de Zona: ${error.message}`)
        }
    },



}
export default modelUbicacion