const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const Cursor = require("pg-cursor");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

app.get("/paises", async (req, res) => {
  const cantidad = Number(req.query.cantidad) || 5;
  const client = await pool.connect();

  try {
    const query = `
      SELECT 
        p.nombre,
        p.continente,
        p.poblacion,
        pp.pib_2019,
        pp.pib_2020
      FROM paises p
      INNER JOIN paises_pib pp
      ON p.nombre = pp.nombre
      ORDER BY p.nombre ASC
    `;

    const cursor = client.query(new Cursor(query));

    cursor.read(cantidad, (error, rows) => {
      cursor.close(() => {
        client.release();

        if (error) {
          return res.status(500).json({
            ok: false,
            mensaje: "Error al leer países con cursor"
          });
        }

        res.status(200).json({
          ok: true,
          cantidad: rows.length,
          paises: rows
        });
      });
    });

  } catch (error) {
    client.release();

    res.status(500).json({
      ok: false,
      mensaje: "Error inesperado al obtener países"
    });
  }
});

app.post("/paises", async (req, res) => {
  const {
    nombre,
    continente,
    poblacion,
    pib_2019,
    pib_2020
  } = req.body;

  if (!nombre || !continente || !poblacion || !pib_2019 || !pib_2020) {
    return res.status(400).json({
      ok: false,
      mensaje: "Todos los campos son obligatorios"
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      `INSERT INTO paises (nombre, continente, poblacion)
       VALUES ($1, $2, $3)`,
      [nombre, continente, poblacion]
    );

    await client.query(
      `INSERT INTO paises_pib (nombre, pib_2019, pib_2020)
       VALUES ($1, $2, $3)`,
      [nombre, pib_2019, pib_2020]
    );

    await client.query(
      `INSERT INTO paises_data_web (nombre_pais, accion)
       VALUES ($1, 1)`,
      [nombre]
    );

    await client.query("COMMIT");

    res.status(201).json({
      ok: true,
      mensaje: "País insertado correctamente",
      pais: {
        nombre,
        continente,
        poblacion,
        pib_2019,
        pib_2020
      }
    });

  } catch (error) {
    await client.query("ROLLBACK");

    res.status(400).json({
      ok: false,
      mensaje: "Error al insertar país. Se realizó rollback.",
      detalle: error.message
    });

  } finally {
    client.release();
  }
});

app.delete("/paises", async (req, res) => {
  const { nombre } = req.query;

  if (!nombre) {
    return res.status(400).json({
      ok: false,
      mensaje: "Debe enviar el nombre del país a eliminar"
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      "DELETE FROM paises_pib WHERE nombre = $1",
      [nombre]
    );

    await client.query(
      "DELETE FROM paises WHERE nombre = $1",
      [nombre]
    );

    await client.query(
      `INSERT INTO paises_data_web (nombre_pais, accion)
       VALUES ($1, 0)`,
      [nombre]
    );

    await client.query("COMMIT");

    res.status(200).json({
      ok: true,
      mensaje: "País eliminado correctamente"
    });

  } catch (error) {
    await client.query("ROLLBACK");

    res.status(400).json({
      ok: false,
      mensaje: "Error al eliminar país. Se realizó rollback.",
      detalle: error.message
    });

  } finally {
    client.release();
  }
});

app.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});