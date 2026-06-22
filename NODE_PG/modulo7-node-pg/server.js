const express = require("express");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static("public"));

// Pool por configuración
const poolConfig = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

// Pool por connection string
const poolString = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function crearTablaFinanzas() {
  await poolConfig.query(`
    CREATE TABLE IF NOT EXISTS finanzas_personales (
      id SERIAL PRIMARY KEY,
      descripcion VARCHAR(100) NOT NULL,
      tipo VARCHAR(20) NOT NULL,
      monto INTEGER NOT NULL,
      fecha DATE NOT NULL
    );
  `);

  const { rows } = await poolConfig.query(
    "SELECT COUNT(*) FROM finanzas_personales"
  );

  if (Number(rows[0].count) === 0) {
    await poolConfig.query(`
      INSERT INTO finanzas_personales (descripcion, tipo, monto, fecha)
      VALUES
      ('Sueldo mensual', 'ingreso', 750000, '2026-06-01'),
      ('Supermercado', 'gasto', 85000, '2026-06-05'),
      ('Internet', 'gasto', 51000, '2026-06-10'),
      ('Venta diseño gráfico', 'ingreso', 120000, '2026-06-15');
    `);
  }
}

async function crearTablaClientes() {
  await poolString.query(`
    CREATE TABLE IF NOT EXISTS clientes (
      id SERIAL PRIMARY KEY,
      nombre VARCHAR(100) NOT NULL,
      rut VARCHAR(20) NOT NULL,
      correo VARCHAR(100),
      telefono VARCHAR(20)
    );
  `);

  const { rows } = await poolString.query("SELECT COUNT(*) FROM clientes");

  if (Number(rows[0].count) === 0) {
    await poolString.query(`
      INSERT INTO clientes (nombre, rut, correo, telefono)
      VALUES
      ('Ana Pérez', '12.345.678-9', 'ana@email.com', '+56911111111'),
      ('Carlos Soto', '18.765.432-1', 'carlos@email.com', '+56922222222'),
      ('María Torres', '15.987.654-3', 'maria@email.com', '+56933333333');
    `);
  }
}

app.get("/finanzas", async (req, res) => {
  try {
    const { rows } = await poolConfig.query(
      "SELECT * FROM finanzas_personales ORDER BY id ASC"
    );

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener finanzas personales"
    });
  }
});

app.get("/clientes", async (req, res) => {
  try {
    const { rows } = await poolString.query(
      "SELECT * FROM clientes ORDER BY id ASC"
    );

    res.status(200).json(rows);
  } catch (error) {
    res.status(500).json({
      error: "Error al obtener clientes"
    });
  }
});

async function iniciarServidor() {
  try {
    await crearTablaFinanzas();
    await crearTablaClientes();

    const servidor = app.listen(PORT, () => {
      console.log(`Servidor funcionando en http://localhost:${PORT}`);
    });

    servidor.on("error", (error) => {
      console.error("Error del servidor:", error.message);
    });

  } catch (error) {
    console.error("Error al iniciar servidor:", error.message);
  }
}

iniciarServidor();