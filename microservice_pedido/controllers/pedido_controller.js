import modelPedidoDetalle from "../models/pedido_model.js";
//TABLA PEDIDOS
export const getPedidoController = async (req, res) => {
    try {
        const resultado = await modelPedidoDetalle.getPedido()

        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
export const getPedidoControllerId = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = await modelPedidoDetalle.getPedidoId(id)

        if (!resultado) {
            return res.status(404).json({ message: "Data not found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const postPedidoController = async (req, res) => {
    try {
        const resultado = req.body
        const response = await modelPedidoDetalle.postPedido(resultado)
        if (!response) {
            return res.status(400).json({ message: "Invalid input data" });
        }
        res.status(201).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updatePedidoController = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = req.body
        const response = await modelPedidoDetalle.updatePedido(id, resultado)
        if (!response) {
            return res.status(404).json({ message: "Not Found" });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deletePedidoController = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = await modelPedidoDetalle.deletePedido(id)
        if (!resultado) {
            return res.status(404).json({ message: "Not Found" });
        }
        res.status(200).json({ message: "Delete succesfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


//CONTROLLERS TABLA DETALLES PEDIDOS
export const getDetallePedidos = async (req, res) => {
    try {
        const resultado = await modelPedidoDetalle.getPedidoDetalle()
        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getDetallePedidosId = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await modelPedidoDetalle.getPedidoDetalleId(id);

        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const postDetallePedidos = async (req, res) => {
    try {
        const resultado = req.body;
        const response = await modelPedidoDetalle.postPedidoDetalle(resultado);
        if (!response) {
            return res.status(400).json({ message: "Invalid input data" });
        }
        res.status(201).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const updatePedidoDetallesController = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = req.body
        const response = await modelPedidoDetalle.updatePedidoDetalle(id, resultado)
        if (!response) {
            return res.status(404).json({ message: "Not Found" });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deletePedidoDetalleController = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await modelPedidoDetalle.deletePedidoDetalle(id);
        if (!resultado) {
            return res.status(404).json({ message: "Not Found" });
        }
        res.status(200).json({ message: "Delete succesfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


//CONTROLLER PEDIDOS CON DETALLE PEDIDO
export const getDetallePedidosAll = async (req, res) => {
    try {
        const { id } = req.params;
        const resultado = await modelPedidoDetalle.getDetallePedidoAll(id);

        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

//CONTEO DE PEDIDOS
export const getPedidosConteos = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = await modelPedidoDetalle.getPedidosCount(id)

        if (!resultado) {
            return res.status(404).json({ message: "Data not found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


//ULTIMO PEDIDO REALIZADO POR EL CONDUCTOR
export const getPedidosConductorInfos = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = await modelPedidoDetalle.getPedidosConductorInfo(id)

        if (!resultado) {
            return res.status(404).json({ message: "Data not found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getPedidosSinConductores = async (req, res) => {
    try {
        const resultado = await modelPedidoDetalle.getPedidosSinConductor()

        if (!resultado) {
            return res.status(404).json({ message: "Data not Found" });
        }
        res.status(200).json(resultado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const updatePedidoAlmacenController = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = req.body
        const response = await modelPedidoDetalle.updatePedidoAlmacen(id, resultado)
        if (!response) {
            return res.status(404).json({ message: "Not Found" });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


export const updatePedidoPrecios = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = req.body
        const response = await modelPedidoDetalle.updatePedidoPrecio(id, resultado)
        if (!response) {
            return res.status(404).json({ message: "Not Found" });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updatePedidoConductores = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = req.body
        const response = await modelPedidoDetalle.updatePedidoConductor(id, resultado)
        if (!response) {
            return res.status(404).json({ message: "Not Found" });
        }
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
/*
export const getPedidosAlmacen = async (req, res) => {
    try {
        const { id } = req.params
        const resultado = await modelPedidoDetalle.getPedidos(ALMACEN)

        if (resultado) {
            res.status(200).json(resultado)
        }
        else {
            res.status(404).json({ message: 'Not Found' })
        }
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
}*/

