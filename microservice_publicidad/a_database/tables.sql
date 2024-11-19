create table public.banner(
	id serial primary key,
    foto varchar(300),
	fecha_expiracion date,  
	titulo varchar(200),
    descripcion varchar(300)
);