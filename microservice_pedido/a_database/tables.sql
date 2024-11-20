-- TABLA

CREATE TABLE public.pedido(
	id serial primary key,
	cliente_id int,
	subtotal float not null,
	descuento  float,
	total float not null,
	fecha timestamp not null,
	tipo varchar(20),
	foto varchar(200),
	estado varchar(50), -- pendiente, en proceso, entregado
	observacion varchar(1000),
	tipo_pago varchar(500),
	beneficiado_id int,
    almacen_id int,
	ubicacion_id int
);

CREATE TABLE public.detalle_pedido(
	id serial primary key,
	pedido_id int,
	producto_id int not null,
	cantidad int not null,
	promocion_id int
);

-- RELACIONES

ALTER TABLE public.detalle_pedido ADD CONSTRAINT fk_detalle_pedido FOREIGN KEY(pedido_id) REFERENCES public.pedido(id) ON DELETE CASCADE ON UPDATE CASCADE;