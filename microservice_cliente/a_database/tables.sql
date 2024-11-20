-- TABLA

CREATE TABLE public.cliente(
    id serial primary key,
    usuario_id int,
    nombres varchar(100),
    apellidos varchar(100),
    dni varchar(20),
    fecha_nacimiento date,
    sexo varchar(20),
    codigo varchar(20),
    saldo_beneficios float,
    suscripcion varchar(50),
    quiere_retirar BOOLEAN,
    medio_retiro varchar(50),
    numero_cuenta varchar(100),
    fecha_creacion date,
    ruc varchar(100),
    calificacion float,
    foto_cliente varchar(1000)
);
