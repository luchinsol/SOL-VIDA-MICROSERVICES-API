import { db_pool } from "../categoria_config.js";

const modelCategoria = {
    //TABLA CATEGORIA
    getAllCategoria: async () => {
        try {
            const resultado = await db_pool.any('SELECT * FROM public.categoria ORDER BY id ASC')
            return resultado;
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    //TABLA CATEGORIA POR ID
    getAllCategoriaPorID: async (id) => {
        try {
            const resultado = await db_pool.any(`
SELECT 
    c.id AS categoria_id, 
    c.nombre AS categoria_nombre,
    s.id AS subcategoria_id, 
    s.nombre AS subcategoria_nombre,
    s.icono,
    s.fecha_inicio,
    s.fecha_fin,
    sp.producto_id,
    NULL AS promocion_id
FROM public.categoria c
INNER JOIN public.subcategoria s ON s.categoria_id = c.id
INNER JOIN public.subcategoria_producto sp ON sp.subcategoria_id = s.id
WHERE c.id = $1
UNION ALL
SELECT 
    c.id AS categoria_id, 
    c.nombre AS categoria_nombre,
    s.id AS subcategoria_id, 
    s.nombre AS subcategoria_nombre,
    s.icono,
    s.fecha_inicio,
    s.fecha_fin,
    NULL AS producto_id,
    spp.promocion_id
FROM public.categoria c
INNER JOIN public.subcategoria s ON s.categoria_id = c.id
INNER JOIN public.subcategoria_promocion spp ON spp.subcategoria_id = s.id
WHERE c.id = $1
ORDER BY subcategoria_id ASC;
            `, [id]);
    
            return resultado;
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    //TABLA SUB-CATEGORIA POR ID
    getSubcategoriaById: async (subcategoriaId) => {
        try {
            const resultado = await db_pool.any(`
                SELECT 
                    s.id AS subcategoria_id, 
                    s.nombre AS subcategoria_nombre,
                    s.icono,
                    s.fecha_inicio,
                    s.fecha_fin,
                    sp.producto_id,
                    NULL AS promocion_id
                FROM public.subcategoria s
                INNER JOIN public.subcategoria_producto sp ON sp.subcategoria_id = s.id
                WHERE s.id = $1
    
                UNION ALL
    
                SELECT 
                    s.id AS subcategoria_id, 
                    s.nombre AS subcategoria_nombre,
                    s.icono,
                    s.fecha_inicio,
                    s.fecha_fin,
                    NULL AS producto_id,
                    spp.promocion_id
                FROM public.subcategoria s
                INNER JOIN public.subcategoria_promocion spp ON spp.subcategoria_id = s.id
                WHERE s.id = $1
    
                ORDER BY subcategoria_id ASC;
            `, [subcategoriaId]);
    
            return resultado;
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },
    
    getSubcategoriaByIdNombre: async (subcategoriaId) => {
        try {
            const resultado = await db_pool.any(`
                SELECT *
                FROM public.subcategoria
                WHERE id = $1
                ORDER BY id ASC;
            `, [subcategoriaId]);
            return resultado;
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    }
    


}

export default modelCategoria