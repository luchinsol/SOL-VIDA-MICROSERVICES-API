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

create table public.zona_trabajo(
	id serial primary key,
	nombre varchar(500),
    poligono_coordenadas varchar(10000)    
);

ALTER TABLE public.ubicacion ADD CONSTRAINT fk_ubicacion_zona FOREIGN KEY (zona_trabajo_id) REFERENCES public.zona_trabajo(id) ON DELETE CASCADE ON UPDATE CASCADE;
