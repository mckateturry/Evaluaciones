CREATE TABLE IF NOT EXISTS finanzas_personales (
  id SERIAL PRIMARY KEY,
  descripcion VARCHAR(100) NOT NULL,
  tipo VARCHAR(20) NOT NULL,
  monto INTEGER NOT NULL,
  fecha DATE NOT NULL
);

INSERT INTO finanzas_personales (descripcion, tipo, monto, fecha)
VALUES
('Sueldo mensual', 'ingreso', 750000, '2026-06-01'),
('Supermercado', 'gasto', 85000, '2026-06-05'),
('Internet', 'gasto', 51000, '2026-06-10'),
('Venta diseño gráfico', 'ingreso', 120000, '2026-06-15');