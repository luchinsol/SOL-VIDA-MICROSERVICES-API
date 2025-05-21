import { db_pool } from "../codigo_config.js"

const modelCodigo = {
    getCodigo: async () => {
        try {
            const resultado = await db_pool.any(`
                SELECT * FROM public.cupon`)
            return resultado
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },
    getCodigosDetallesModelCliente: async (id) => {
        try {
            const resultado = await db_pool.any(`
                SELECT DISTINCT
  c.*,
  t.id AS tipo_id,
  t.nombre AS tipo_nombre,
  d.id AS descuento_id,
  d.tipo AS descuento_tipo,
  d.valor AS descuento_valor
FROM cupon c
LEFT JOIN cupon_cliente cc ON cc.cupon_id = c.id
LEFT JOIN tipo t ON c.tipo_id = t.id
LEFT JOIN descuento d ON c.descuento_id = d.id
WHERE (
    (c.tipo_id = 2 AND c.cliente_id IS NULL)
    OR c.cliente_id = $1
  )
  AND c.activo = TRUE
  AND c.usado = FALSE
  AND CURRENT_DATE BETWEEN c.fecha_inicio AND c.fecha_expiracion;`, [id])
            return resultado
        } catch (error) {
            throw new Error(`Error get data: ${error}`);
        }
    },

    postCreacionCodigoModelCliente: async (cupon) => {
        try {
            const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz123456789';
            let CODE = '';

            for (let i = 0; i < 5; i++) {
                const randomIndex = Math.floor(Math.random() * characters.length);
                CODE += characters.charAt(randomIndex);
            }
            const resultado = await db_pool.one(`
                        INSERT INTO cupon (
                codigo,
                tipo_id,
                cliente_id,
                fecha_inicio,
                fecha_expiracion,
                descuento_id,
                descripcion,
                titulo,
                terminos_y_condiciones
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9
            )
            RETURNING *
                    `, [
                CODE,
                1,
                cupon.cliente_id,
                cupon.fecha_inicio,
                cupon.fecha_expiracion,
                cupon.descuento_id,
                cupon.descripcion,
                cupon.titulo,
                cupon.terminos_condiciones
            ]);

            return resultado;

        } catch (error) {
            throw new Error(`Error post data ${error}`);
        }
    },


    postVerificacionCuponCliente: async (cupondata) => {
        try {
            const cupon = await db_pool.oneOrNone(`
                SELECT id, cliente_id FROM public.cupon
                WHERE id = $1 AND activo = TRUE AND usado = FALSE
              `, [cupondata.cupon_id]);

            if (!cupon) {
                throw new Error('El cupón no está disponible o ya fue usado.');
            }

            const insertado = await db_pool.one(`
                INSERT INTO cupon_cliente (cupon_id, cliente_id)
                VALUES ($1, $2)
                RETURNING *
              `, [cupondata.cupon_id, cupon.cliente_id]);
            await db_pool.none(`
                UPDATE cupon SET usado = TRUE
                WHERE id = $1
              `, [cupondata.cupon_id]);

            return insertado;

        } catch (error) {
            throw new Error(`Error al asignar cupón: ${error.message}`);
        }
    },
}

export default modelCodigo