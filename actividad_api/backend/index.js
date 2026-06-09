const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT
});

// GET /conductores
app.get("/conductores", async (req, res) => {
  const resultado = await pool.query(
    "SELECT * FROM conductores"
  );

  res.json(resultado.rows);
});

// GET /automoviles
app.get("/automoviles", async (req, res) => {
  const resultado = await pool.query(
    "SELECT * FROM automoviles"
  );

  res.json(resultado.rows);
});

// GET /conductoressinauto?edad=40
app.get("/conductoressinauto", async (req, res) => {
  const edad = req.query.edad;

  const resultado = await pool.query(
    `SELECT c.*
     FROM conductores c
     LEFT JOIN automoviles a
     ON c.nombre = a.nombre_conductor
     WHERE a.nombre_conductor IS NULL
     AND c.edad < $1`,
    [edad]
  );

  res.json(resultado.rows);
});

// GET /solitos
app.get("/solitos", async (req, res) => {
  const resultado = await pool.query(
    `SELECT c.nombre,
            c.edad,
            NULL AS marca,
            NULL AS patente,
            'conductor sin auto' AS tipo
     FROM conductores c
     LEFT JOIN automoviles a
     ON c.nombre = a.nombre_conductor
     WHERE a.nombre_conductor IS NULL

     UNION

     SELECT NULL,
            NULL,
            a.marca,
            a.patente,
            'auto sin conductor'
     FROM automoviles a
     LEFT JOIN conductores c
     ON a.nombre_conductor = c.nombre
     WHERE c.nombre IS NULL`
  );

  res.json(resultado.rows);
});

// GET /auto?patente=HXJH55
// GET /auto?iniciopatente=H

app.get("/auto", async (req, res) => {

  const patente = req.query.patente;
  const inicio = req.query.iniciopatente;

  if (patente) {

    const resultado = await pool.query(
      `SELECT a.*, c.edad
       FROM automoviles a
       LEFT JOIN conductores c
       ON a.nombre_conductor = c.nombre
       WHERE a.patente = $1`,
      [patente]
    );

    if (resultado.rows.length === 0) {
      return res.status(404).json({
        mensaje: "Automóvil no encontrado"
      });
    }

    return res.json(resultado.rows[0]);
  }

  if (inicio) {

    const resultado = await pool.query(
      `SELECT a.*, c.edad
       FROM automoviles a
       LEFT JOIN conductores c
       ON a.nombre_conductor = c.nombre
       WHERE a.patente ILIKE $1`,
      [inicio + "%"]
    );

    return res.json(resultado.rows);
  }

  res.status(400).json({
    mensaje: "Debe indicar patente o iniciopatente"
  });

});

app.listen(process.env.PORT, () => {
  console.log(
    `Servidor funcionando en puerto ${process.env.PORT}`
  );
});