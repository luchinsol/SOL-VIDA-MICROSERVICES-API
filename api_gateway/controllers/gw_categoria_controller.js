import axios from 'axios';
import dotenv from 'dotenv'
import * as turf from "@turf/turf";

dotenv.config()

const service_categoria = process.env.MICRO_CATEGORIA
const service_producto = process.env.MICRO_PRODUCTO;
const service_zonaproducto = process.env.MICRO_ZONAPRODUCTO;
const service_zonapromocion = process.env.MICRO_ZONAPROMOCION;
const service_ubicacion = process.env.MICRO_UBICACION;
const service_cliente = process.env.MICRO_CLIENTE

//const service_almacen = process.env.MICRO_ALMACEN;



//ENDPOINT QUE TRAE TODAS LAS UBICACIONES REGISTRADAS POR EL CLIENTE EN SU APP
export const getCategoriasControllerGW = async (req, res) => {
  //TRAER LA ULTIMA UBICACION DEL CLIENTE 
  try {
    const response = await axios.get(`${service_categoria}/categoria`)
    if (response) {
      res.status(200).json(response.data);
    } else {
      res.status(400).json({ message: "Invalid get data" });
    }

  } catch (error) {
    res.status(500).json({ error: error.message })
  }

}
//FUNCION PARA TRAER LAS REGIONES Y PROCESARLAS
const processWarehouseRegions = (zonas) => {
  return zonas
    .map((zona) => {
      try {
        let processedCoordinates = zona.poligono_coordenadas;

        // Validación más estricta del formato de coordenadas
        if (
          !Array.isArray(processedCoordinates) ||
          processedCoordinates.length < 3 || // Un polígono válido necesita al menos 3 puntos
          !processedCoordinates.every(
            (coord) =>
              Array.isArray(coord) &&
              coord.length === 2 &&
              !isNaN(coord[0]) &&
              !isNaN(coord[1])
          )
        ) {
          throw new Error(`Formato inválido de coordenadas para zona ${zona.id}`);
        }

        // Asegurar que el polígono esté cerrado (primer y último punto iguales)
        const first = processedCoordinates[0];
        const last = processedCoordinates[processedCoordinates.length - 1];
        if (first[0] !== last[0] || first[1] !== last[1]) {
          processedCoordinates = [...processedCoordinates, first];
        }

        // Verificar que el polígono sea válido
        const polygon = turf.polygon([processedCoordinates]);
        if (!turf.booleanValid(polygon)) {
          throw new Error(`Polígono inválido para zona ${zona.id}`);
        }

        return {
          warehouseId: zona.id,
          name: zona.nombre,
          polygon: polygon,
          centroid: turf.centroid(polygon).geometry.coordinates
        };
      } catch (error) {
        console.error(`Error procesando zona ${zona.id}:`, error);
        return null;
      }
    })
    .filter((region) => region !== null);
};

//CALCULO DE LA ZONA
const determineWorkZone = (warehouseRegions, coordinates, maxDistanceKm = 50) => {
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
    throw new Error("Formato de coordenadas inválido");
  }

  const point = turf.point(coordinates);
  let closestRegion = null;
  let minDistance = Infinity;

  // Primero verificar si el punto está dentro de alguna región
  for (const region of warehouseRegions) {
    try {
      const isInside = turf.booleanPointInPolygon(point, region.polygon);
      if (isInside) {
        // Verificar también la distancia al centroide para mayor precisión
        const distanceToCentroid = turf.distance(point, turf.point(region.centroid));
        if (distanceToCentroid < minDistance) {
          minDistance = distanceToCentroid;
          closestRegion = region;
        }
      }
    } catch (error) {
      console.error(`Error verificando región ${region.name}:`, error);
    }
  }

  // Si encontramos una región que contiene el punto
  if (closestRegion) {
    return closestRegion.warehouseId;
  }

  // Si no está dentro de ninguna región, verificar la región más cercana
  for (const region of warehouseRegions) {
    try {
      const distance = turf.distance(point, turf.point(region.centroid));
      if (distance < minDistance) {
        minDistance = distance;
        closestRegion = region;
      }
    } catch (error) {
      console.error(`Error calculando distancia a región ${region.name}:`, error);
    }
  }

  // Solo devolver la región más cercana si está dentro del radio máximo permitido
  return minDistance <= maxDistanceKm ? closestRegion?.warehouseId : null;
};

//OBTENER LA ZONA DE TRABAJO
export const getZonaTrabajo = (zonas, coordinates, maxDistanceKm = 50) => {
  try {
    // Validar coordenadas de entrada
    const [longitude, latitude] = coordinates;
    if (isNaN(longitude) || isNaN(latitude) || 
        longitude < -180 || longitude > 180 || 
        latitude < -90 || latitude > 90) {
      throw new Error("Coordenadas inválidas");
    }

    // Procesar las regiones
    const warehouseRegions = processWarehouseRegions(zonas);
    if (warehouseRegions.length === 0) {
      throw new Error("No hay regiones válidas para evaluar");
    }

    // Determinar la zona de trabajo con distancia máxima configurable
    const zona_trabajo_id = determineWorkZone(warehouseRegions, coordinates, maxDistanceKm);

    return zona_trabajo_id;
  } catch (error) {
    console.error('Error al determinar la zona de trabajo:', error);
    return null;
  }
};

//CATEGORIA ESPECIFICA PARA NUESTRO ENDPOINT NECESARIO PARA TRAER UNA CATEGORIA EN ESPECIFICO
export const getCategoriaControllerIdGW = async (req, res) => {
  try {

    const { id, ubicacion_id } = req.params;

     const MAX_DISTANCE_KM = 50; // Radio máximo en kilómetros

    //ZONA DE TRABAJO VARIABLE
    let zona_trabajo_id = null;

    if (ubicacion_id) {
      try {
        // Obtener la información de la ubicación
        const ubicacionRes = await axios.get(
          `${service_ubicacion}/ubicacion/${ubicacion_id}`
        );

        const latitud = ubicacionRes.data.latitud;
        const longitud = ubicacionRes.data.longitud;

        if (!latitud || !longitud) {
          return res.status(400).json({ message: "Coordenadas no disponibles" });
        }

        // Obtener zonas para calcular la zona de trabajo
        const responseZona = await axios.get(`${service_ubicacion}/zona`);



        // Solo necesitamos coordenadas y zonas para determinar la zona_trabajo_id
         const coordinates = [longitud, latitud];
        

        // Usar la función existente para determinar la zona de trabajo
        zona_trabajo_id = getZonaTrabajo(responseZona.data, coordinates, MAX_DISTANCE_KM);

        if (!zona_trabajo_id) {
          return res.status(404).json({
            message: "Ubicación fuera de las zonas de reparto",
            error: "ZONA_NO_DISPONIBLE"
          });
        }

        // Si es necesario, actualizar la zona de trabajo en la ubicación
        await axios.put(`${service_ubicacion}/ubicacion/${ubicacion_id}`, {
          zona_trabajo_id: zona_trabajo_id
        });
      } catch (error) {
        console.error('Error al procesar ubicación:', error);
        return res.status(404).json({ message: "Ubicación no encontrada o error al procesar" });
      }
    }

    // Obtener la categoría y subcategorías relacionadas con la nueva estructura
    const response = await axios.get(`${service_categoria}/categoria/${id}`);

    if (!response || !response.data) {
      return res.status(400).json({ message: "Invalid get data" });
    }

    // Extraer la data con la nueva estructura
    const categoriaData = response.data;

    const enrichedData = {};

    enrichedData.id = categoriaData.id;
    enrichedData.nombre = categoriaData.nombre;
    enrichedData.zona_trabajo_id = zona_trabajo_id;

    // Crear una copia del objeto para no modificar el original directamente
    enrichedData.subcategorias = await Promise.all(categoriaData.subcategorias.map(async (subcategoria) => {
      // Procesar array de productos
      const productosEnriquecidos = await Promise.all(subcategoria.productos.map(async (productoId) => {
        try {
          // Obtener detalles del producto y su precio de zona en paralelo
          const [productoResp, precioZonaResp] = await Promise.all([
            axios.get(`${service_producto}/producto/${productoId}`),
            axios.get(`${service_zonaproducto}/precioZonaProductoDetalle/${zona_trabajo_id}/${productoId}`)
          ]);

          const productoDetalle = productoResp.data || null;
          const precioZonaProducto = precioZonaResp.data || null;

          // Calcular el porcentaje de descuento si hay descuento y precio
          let porcentajeDescuento = null;
          if (precioZonaProducto?.descuento > 0 && precioZonaProducto?.precio > 0) {
            porcentajeDescuento = Math.round((precioZonaProducto.descuento / precioZonaProducto.precio) * 100);
          }

          // Estructura modificada para el estilo
          const estiloModificado = precioZonaProducto ? {
            id: precioZonaProducto.estilo_id,
            colores: [
              { color_fondo: precioZonaProducto.color_fondo },
              { color_boton: precioZonaProducto.color_boton },
              { color_letra: precioZonaProducto.color_letra }
            ]
          } : null;

          // Extraer solo la información necesaria
          const productoEnriquecido = {
            id: productoId,
            nombre: productoDetalle?.nombre || null,
            foto: productoDetalle?.foto,
            valoracion: productoDetalle?.valoracion || null,
            precio: precioZonaProducto?.precio || null,
            descuento: precioZonaProducto?.descuento || 0,
            estilo: estiloModificado
          };

          // Añadir el porcentaje de descuento solo si existe un descuento
          if (porcentajeDescuento !== null) {
            productoEnriquecido.porcentaje_descuento = porcentajeDescuento;
          }

          return productoEnriquecido;
        } catch (error) {
          console.error(`Error al obtener detalles del producto ${productoId}:`, error.message);
          return { id: productoId, error: 'No se pudo obtener información' };
        }
      }));

      // Procesar array de promociones
      const promocionesEnriquecidas = await Promise.all(subcategoria.promociones.map(async (promocionId) => {
        try {
          // Obtener detalles de la promoción y su precio de zona en paralelo
          const [promoResp, precioPromoResp] = await Promise.all([
            axios.get(`${service_producto}/promocion/${promocionId}`),
            axios.get(`${service_zonapromocion}/preciopromodetalle/${zona_trabajo_id}/${promocionId}`)
          ]);

          const promocionDetalle = promoResp.data || null;
          const precioZonaPromocion = precioPromoResp.data || null;

          // Calcular el porcentaje de descuento si hay descuento y precio
          let porcentajeDescuento = null;
          if (precioZonaPromocion?.descuento > 0 && precioZonaPromocion?.precio > 0) {
            porcentajeDescuento = Math.round((precioZonaPromocion.descuento / precioZonaPromocion.precio) * 100);
          }

          // Estructura modificada para el estilo
          const estiloModificado = precioZonaPromocion ? {
            id: precioZonaPromocion.estilo_id,
            colores: [
              { color_fondo: precioZonaPromocion.color_fondo },
              { color_boton: precioZonaPromocion.color_boton },
              { color_letra: precioZonaPromocion.color_letra }
            ]
          } : null;

          // Extraer solo la información necesaria
          const promocionEnriquecida = {
            id: promocionId,
            nombre: promocionDetalle?.nombre || null,
            foto: promocionDetalle?.foto,
            valoracion: promocionDetalle?.valoracion || null,
            precio: precioZonaPromocion?.precio || null,
            descuento: precioZonaPromocion?.descuento || 0,
            estilo: estiloModificado
          };

          // Añadir el porcentaje de descuento solo si existe un descuento
          if (porcentajeDescuento !== null) {
            promocionEnriquecida.porcentaje_descuento = porcentajeDescuento;
          }

          return promocionEnriquecida;
        } catch (error) {
          console.error(`Error al obtener detalles de la promoción ${promocionId}:`, error.message);
          return { id: promocionId, error: 'No se pudo obtener información' };
        }
      }));

      // Devolver la subcategoría con productos y promociones enriquecidos
      return {
        ...subcategoria,
        productos: productosEnriquecidos,
        promociones: promocionesEnriquecidas
      };
    }));

    res.status(200).json(enrichedData);
  } catch (error) {
    console.error('Error en getCategoriaControllerIdGW:', error);
    res.status(500).json({ error: error.message });
  }
};


//CATEGORIA ESPECIFICA PARA NUESTRO ENDPOINT NECESARIO PARA TRAER UNA CATEGORIA EN ESPECIFICO
export const getSubategoriaControllerIdGW = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener las subcategorías relacionadas
    const response = await axios.get(`${service_categoria}/sub_categoria/${id}`);

    if (!response || !response.data) {
      return res.status(400).json({ message: "Invalid get data" });
    }

    const productos = [];
    const promociones = [];

    await Promise.all(response.data.map(async (item) => {
      if (item.producto_id) {
        const [productoResp, precioZonaResp] = await Promise.all([
          axios.get(`${service_producto}/producto/${item.producto_id}`),
          axios.get(`${service_zonaproducto}/precioZonaProducto/${item.producto_id}`)
        ]);

        productos.push({
          ...item,
          producto_detalle: productoResp.data || null,
          precio_zona_producto: precioZonaResp.data || null
        });
      }

      if (item.promocion_id) {
        const [promoResp, precioPromoResp] = await Promise.all([
          axios.get(`${service_producto}/promocion/${item.promocion_id}`),
          axios.get(`${service_zonapromocion}/preciopromo/${item.promocion_id}`)
        ]);

        promociones.push({
          ...item,
          promocion_detalle: promoResp.data || null,
          precio_zona_promocion: precioPromoResp.data || null
        });
      }
    }));

    res.status(200).json({
      subcategoria_id: id,
      productos,
      promociones
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//ENDPOINT NECESARIO PARA TRAER TODA LA INFORMACION DE UN PRODUCTO EN ESPECIFICO
export const getSubCategoriaProductoControllerIdGW = async (req, res) => {
  try {
    const { id, id_prod, id_zona } = req.params;

    // Hacemos todas las peticiones en paralelo
    const [
      subcategoriaResp,
      productoResp,
      precioZonaResp,
      totalValoracionesResp,
      calificacionesResp
    ] = await Promise.all([
      axios.get(`${service_categoria}/sub_categoria_nombre/${id}`),
      axios.get(`${service_producto}/producto/${id_prod}`),
      axios.get(`${service_zonaproducto}/precioZonaProductoDetalle/${id_zona}/${id_prod}`),
      axios.get(`${service_cliente}/calificacion_count_producto/${id_prod}`),
      axios.get(`${service_cliente}/last_valoraciones_cliente_producto/${id_prod}`)
    ]);

    // Validamos que al menos la subcategoría y producto existan
    if (!subcategoriaResp.data || !productoResp.data) {
      return res.status(404).json({ message: "Datos no encontrados" });
    }

    const subcategoria = subcategoriaResp.data[0]; // Solo usamos la primera subcategoría
    const producto = productoResp.data;
    const precioZona = precioZonaResp.data || {};
    const totalValoraciones = totalValoracionesResp.data?.total_valoraciones || 0;
    const calificaciones = calificacionesResp.data || [];

    // Estructuramos la respuesta según el formato requerido
    const respuestaFinal = {
      id: subcategoria.id,
      nombre: subcategoria.nombre,
      producto: {
        id: producto.id,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        foto: producto.foto,
        valoracion: producto.valoracion,
        precio: precioZona.precio || null,
        descuento: precioZona.descuento || null,
        total_calificados: Number(totalValoraciones),
        estilo: {
          id: precioZona.estilo_id || null,
          colores: {
            color_fondo: precioZona.color_fondo || null,
            color_boton: precioZona.color_boton || null,
            color_letra: precioZona.color_letra || null
          },
          calificaciones: calificaciones
        }
      }
    };

    res.status(200).json(respuestaFinal);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//ENDPONT NECESARIO PARA TRAER TODA LA INFORMACION DE UNA PROMOCION EN ESPECIFICO
export const getSubCategoriaPromocionControllerIdGW = async (req, res) => {
  try {
    const { id, id_prom, id_zona } = req.params;

    // Realizamos todas las peticiones necesarias en paralelo
    const [
      subcategoriaResp,
      promocionResp,
      precioZonaResp,
      totalValoracionesResp,
      calificacionesResp
    ] = await Promise.all([
      axios.get(`${service_categoria}/sub_categoria_nombre/${id}`), // Subcategoría por ID
      axios.get(`${service_producto}/promocion/${id_prom}`), // Detalle de la promoción
      axios.get(`${service_zonapromocion}/preciopromodetalle/${id_zona}/${id_prom}`), // Precio por zona
      axios.get(`${service_cliente}/calificacion_promedio_promocion/${id_prom}`), // Total calificaciones
      axios.get(`${service_cliente}/last_valoraciones_cliente_promos/${id_prom}`) // Últimas calificaciones
    ]);

    // Verificamos que existan datos necesarios
    if (!subcategoriaResp.data || !promocionResp.data) {
      return res.status(404).json({ message: "Datos no encontrados" });
    }

    const subcategoria = subcategoriaResp.data[0]; // Usamos la primera subcategoría
    const promocion = promocionResp.data;
    const precioZona = precioZonaResp.data || {};
    const totalValoraciones = totalValoracionesResp.data?.total_valoraciones || 0;
    const calificaciones = calificacionesResp.data || [];

    // Estructura final de la respuesta
    const respuestaFinal = {
      id: subcategoria.id,
      nombre: subcategoria.nombre,
      producto: {
        id: promocion.id,
        nombre: promocion.nombre,
        descripcion: promocion.descripcion,
        foto: promocion.foto,
        valoracion: promocion.valoracion,
        precio: precioZona.precio || null,
        descuento: precioZona.descuento || null,
        total_calificados: Number(totalValoraciones),
        estilo: {
          id: precioZona.estilo_id || null,
          colores: {
            color_fondo: precioZona.color_fondo || null,
            color_boton: precioZona.color_boton || null,
            color_letra: precioZona.color_letra || null
          },
          calificaciones: calificaciones
        }
      }
    };

    res.status(200).json(respuestaFinal);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

