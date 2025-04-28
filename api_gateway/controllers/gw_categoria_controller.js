import axios from 'axios';
import dotenv from 'dotenv'

dotenv.config()

const service_categoria = process.env.MICRO_CATEGORIA
const service_producto = process.env.MICRO_PRODUCTO;
const service_zonaproducto = process.env.MICRO_ZONAPRODUCTO;
const service_zonapromocion = process.env.MICRO_ZONAPROMOCION;

//ENDPOINT QUE TRAE TODAS LAS UBICACIONES REGISTRADAS POR EL CLIENTE EN SU APP
export const getCategoriasControllerGW = async (req,res) => {
    //TRAER LA ULTIMA UBICACION DEL CLIENTE 
    try {
        const response = await axios.get(`${service_categoria}/categoria`)
        if (response){
            res.status(200).json(response.data);
        } else{
            res.status(400).json({ message: "Invalid get data"});
        }

    } catch (error) {
        res.status(500).json({error:error.message})
    }

}

//CATEGORIA ESPECIFICA PARA NUESTRO ENDPOINT NECESARIO PARA TRAER UNA CATEGORIA EN ESPECIFICO
export const getCategoriaControllerIdGW = async (req, res) => {
    try {
      const { id } = req.params;
  
      // Obtener la categoría y subcategorías relacionadas
      const response = await axios.get(`${service_categoria}/categoria/${id}`);
  
      if (!response || !response.data) {
        return res.status(400).json({ message: "Invalid get data" });
      }
  
      const enrichedData = await Promise.all(response.data.map(async (item) => {
        let producto_detalle = null;
        let promocion_detalle = null;
        let precio_zona_producto = null;
        let precio_zona_promocion = null;
  
        if (item.producto_id) {
          const [productoResp, precioZonaResp] = await Promise.all([
            axios.get(`${service_producto}/producto/${item.producto_id}`),
            axios.get(`${service_zonaproducto}/precioZonaProducto/${item.producto_id}`)
          ]);
  
          producto_detalle = productoResp.data || null;
          precio_zona_producto = precioZonaResp.data || null;
        }
  
        if (item.promocion_id) {
          const [promoResp, precioPromoResp] = await Promise.all([
            axios.get(`${service_producto}/promocion/${item.promocion_id}`),
            axios.get(`${service_zonapromocion}/preciopromo/${item.promocion_id}`)
          ]);
  
          promocion_detalle = promoResp.data || null;
          precio_zona_promocion = precioPromoResp.data || null;
        }
  
        return {
          ...item,
          producto_detalle,
          precio_zona_producto,
          promocion_detalle,
          precio_zona_promocion
        };
      }));
  
      res.status(200).json(enrichedData);
  
    } catch (error) {
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
export const getSubategoriaProductoControllerIdGW = async (req, res) => {
  try {
    const { id, id_prod } = req.params;

    const [subcategoriaResp, productoResp, precioZonaResp] = await Promise.all([
      axios.get(`${service_categoria}/sub_categoria_nombre/${id}`), // Subcategorías por ID
      axios.get(`${service_producto}/producto/${id_prod}`),  // Detalle del producto
      axios.get(`${service_zonapromocion}/precioZonaProducto/${id_prod}`) // Precio por zona del producto
    ]);

    if (!subcategoriaResp.data || !productoResp.data) {
      return res.status(404).json({ message: "Datos no encontrados" });
    }

    res.status(200).json({
      subcategorias: subcategoriaResp.data,
      producto_id: id_prod,
      producto_detalle: productoResp.data,
      precio_zona_producto: precioZonaResp.data || null
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//ENDPONT NECESARIO PARA TRAER TODA LA INFORMACION DE UNA PROMOCION EN ESPECIFICO
export const getSubategoriaPromocionControllerIdGW  = async (req, res) => {
  try {
    const { id, id_prom } = req.params;

    const [subcategoriaResp, promoResp, precioZonaResp] = await Promise.all([
      axios.get(`${service_categoria}/sub_categoria_nombre/${id}`), // Subcategorías por ID
      axios.get(`${service_producto}/promocion/${id_prom}`),   // Detalle del producto
      axios.get(`${service_zonapromocion}/preciopromo/${id_prom}`) // Precio por zona del producto
    ]);

    if (!subcategoriaResp.data || !promoResp.data) {
      return res.status(404).json({ message: "Datos no encontrados" });
    }

     res.status(200).json({
      subcategorias: subcategoriaResp.data,
      promocion_id: id_prom,
      promocion_detalle: promoResp.data,
      precio_zona_promocion: precioZonaResp.data || null
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
