-- Tabla TIPO
CREATE TABLE public.tipo (
    id serial PRIMARY KEY,
    nombre varchar(100) NOT NULL
);

-- Tabla DESCUENTO
CREATE TABLE public.descuento (
    id serial PRIMARY KEY,
    tipo varchar(50),
    valor float
);

-- Tabla CUPON
CREATE TABLE public.cupon (
    id serial PRIMARY KEY,
    codigo varchar(100) NOT NULL,
    tipo_id int,
    cliente_id int, 
    usado boolean DEFAULT false,
    activo boolean DEFAULT true,
    fecha_inicio date,
    fecha_expiracion date,
    descuento_id int,
    descripcion text,
    titulo varchar(200),
    terminos_y_condiciones text
);

-- Tabla CUPON_CLIENTE 
CREATE TABLE public.cupon_cliente (
    id serial PRIMARY KEY,
    cupon_id int NOT NULL,
    cliente_id int NOT NULL 
);

-- CUPON: Referencia a TIPO
ALTER TABLE public.cupon
ADD CONSTRAINT fk_cupon_tipo
FOREIGN KEY (tipo_id) REFERENCES public.tipo(id)
ON DELETE CASCADE ON UPDATE CASCADE;

-- CUPON: Referencia a DESCUENTO
ALTER TABLE public.cupon
ADD CONSTRAINT fk_cupon_descuento
FOREIGN KEY (descuento_id) REFERENCES public.descuento(id)
ON DELETE CASCADE ON UPDATE CASCADE;

-- CUPON_CLIENTE: Referencia a CUPON
ALTER TABLE public.cupon_cliente
ADD CONSTRAINT fk_cupon_cliente_cupon
FOREIGN KEY (cupon_id) REFERENCES public.cupon(id)
ON DELETE CASCADE ON UPDATE CASCADE;
