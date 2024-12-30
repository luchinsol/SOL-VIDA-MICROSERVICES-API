create table public.ubicacion(
	id serial primary key,
	departamento varchar(200),
    provincia varchar(200),
    distrito varchar(200),
    direccion varchar(300),
    latitud float,
	longitud float,
	cliente_id int,
	zona_trabajo_id int    
);

CREATE TABLE public.zona_trabajo (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(500),
    poligono_coordenadas NUMERIC[][] 
);


ALTER TABLE public.ubicacion ADD CONSTRAINT fk_ubicacion_zona FOREIGN KEY (zona_trabajo_id) REFERENCES public.zona_trabajo(id) ON DELETE CASCADE ON UPDATE CASCADE;
