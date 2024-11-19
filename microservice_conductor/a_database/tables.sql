create table public.conductor(
	id serial primary key,
	usuario_id int unique,
	nombres varchar(100) not null,
	apellidos varchar(100) not null,
	dni varchar(100) not null,
	fecha_nacimiento date not null,
    n_licencia varchar (100) not null,
	n_soat varchar (100) not null,
    foto_licencia varchar(300),
    foto_soat  varchar(300),
    foto_otros varchar(300),
    valoración float,
    latitud float,
    longitud float
);	



/*
create table public.usuario(
	id serial primary key,
	rol_id int not null,
	nickname varchar(100) not null,
	password varchar(100) not null,
	email varchar(200),
	telefono varchar(30)
);

ALTER TABLE personal.conductor ADD CONSTRAINT fk_conductor_usuario FOREIGN KEY (usuario_id) REFERENCES personal.usuario(id) ON DELETE CASCADE ON UPDATE CASCADE;
*/