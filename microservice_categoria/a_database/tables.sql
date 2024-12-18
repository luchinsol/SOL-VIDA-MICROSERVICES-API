CREATE TABLE categoria (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255)
);

CREATE TABLE subcategoria (
    id SERIAL PRIMARY KEY,
    categoria_id INT,
    nombre VARCHAR(255),
    fecha_inicio DATE,
    fecha_fin DATE,
    FOREIGN KEY (categoria_id) REFERENCES categoria(id)
);