DROP TABLE IF EXISTS lista_productos;
DROP TABLE IF EXISTS despachos;
DROP TABLE IF EXISTS ordenes;
DROP TABLE IF EXISTS direcciones;
DROP TABLE IF EXISTS clientes;
DROP TABLE IF EXISTS productos;

CREATE TABLE productos (
  id_producto SERIAL PRIMARY KEY,
  nombre VARCHAR(200) NOT NULL,
  precio INTEGER NOT NULL,
  existencias INTEGER NOT NULL
);

CREATE TABLE clientes (
  rut VARCHAR(10) PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL
);

CREATE TABLE direcciones (
  id_direccion SERIAL PRIMARY KEY,
  rut VARCHAR(10) REFERENCES clientes(rut),
  direccion VARCHAR(200) NOT NULL
);

CREATE TABLE ordenes (
  id_orden SERIAL PRIMARY KEY,
  rut VARCHAR(10) REFERENCES clientes(rut),
  precio_total INTEGER NOT NULL
);

CREATE TABLE despachos (
  id_despacho SERIAL PRIMARY KEY,
  id_orden INTEGER REFERENCES ordenes(id_orden),
  id_direccion INTEGER REFERENCES direcciones(id_direccion)
);

CREATE TABLE lista_productos (
  id_lista SERIAL PRIMARY KEY,
  id_orden INTEGER REFERENCES ordenes(id_orden),
  id_producto INTEGER REFERENCES productos(id_producto),
  cantidad_producto INTEGER NOT NULL
);

INSERT INTO productos (nombre, precio, existencias) VALUES
('Notebook Lenovo', 650000, 8),
('Mouse inalámbrico', 12000, 20),
('Teclado mecánico', 45000, 10),
('Monitor 24 pulgadas', 120000, 5),
('Audífonos Bluetooth', 35000, 15);

INSERT INTO clientes (rut, nombre) VALUES
('11111111-1', 'Ana Pérez'),
('22222222-2', 'Carlos Soto');

INSERT INTO direcciones (rut, direccion) VALUES
('11111111-1', 'Av. Siempre Viva 123'),
('11111111-1', 'Los Aromos 456'),
('22222222-2', 'Calle Sur 789');