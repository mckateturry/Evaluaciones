CREATE TABLE IF NOT EXISTS clientes (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  rut VARCHAR(20) NOT NULL,
  correo VARCHAR(100),
  telefono VARCHAR(20)
);

INSERT INTO clientes (nombre, rut, correo, telefono)
VALUES
('Ana Pérez', '12.345.678-9', 'ana@email.com', '+56911111111'),
('Carlos Soto', '18.765.432-1', 'carlos@email.com', '+56922222222'),
('María Torres', '15.987.654-3', 'maria@email.com', '+56933333333');