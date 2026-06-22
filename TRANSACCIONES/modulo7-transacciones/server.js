const express = require("express");
const { Pool } = require("pg");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3002;

app.use(express.json());
app.use(express.static("public"));

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

app.get("/api", async (req, res) => {
  const { filtro, id, orden, rut } = req.query;

  try {
    if (filtro === "productos" && id) {
      const { rows } = await pool.query(
        "SELECT * FROM productos WHERE id_producto = $1",
        [id]
      );
      return res.status(200).json(rows[0] || {});
    }

    if (filtro === "productos" && orden) {
      const { rows } = await pool.query(
        `SELECT p.nombre, p.precio, lp.cantidad_producto
         FROM lista_productos lp
         JOIN productos p ON lp.id_producto = p.id_producto
         WHERE lp.id_orden = $1`,
        [orden]
      );
      return res.status(200).json(rows);
    }

    if (filtro === "productos") {
      const { rows } = await pool.query(
        "SELECT * FROM productos ORDER BY id_producto ASC"
      );
      return res.status(200).json(rows);
    }

    if (filtro === "ordenes" && rut) {
      const { rows } = await pool.query(
        "SELECT * FROM ordenes WHERE rut = $1 ORDER BY id_orden ASC",
        [rut]
      );
      return res.status(200).json(rows);
    }

    if (filtro === "clientes" && rut) {
      const { rows } = await pool.query(
        "SELECT * FROM clientes WHERE rut = $1",
        [rut]
      );
      return res.status(200).json(rows[0] || {});
    }

    if (filtro === "clientes") {
      const { rows } = await pool.query(
        "SELECT * FROM clientes ORDER BY nombre ASC"
      );
      return res.status(200).json(rows);
    }

    if (filtro === "direcciones" && rut) {
      const { rows } = await pool.query(
        "SELECT * FROM direcciones WHERE rut = $1 ORDER BY id_direccion ASC",
        [rut]
      );
      return res.status(200).json(rows);
    }

    if (filtro === "despachos" && orden) {
      const { rows } = await pool.query(
        `SELECT d.id_despacho, d.id_orden, di.direccion
         FROM despachos d
         JOIN direcciones di ON d.id_direccion = di.id_direccion
         WHERE d.id_orden = $1`,
        [orden]
      );
      return res.status(200).json(rows[0] || {});
    }

    res.status(400).json({
      ok: false,
      mensaje: "Filtro inválido"
    });

  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: "Error en la consulta",
      detalle: error.message
    });
  }
});

app.post("/orden", async (req, res) => {
  const { rut, id_direccion, productos } = req.body;

  if (!rut || !id_direccion || !productos || productos.length === 0) {
    return res.status(400).json({
      ok: false,
      mensaje: "Debe enviar rut, dirección y productos"
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let precioTotal = 0;

    for (const item of productos) {
      const { rows } = await client.query(
        "SELECT * FROM productos WHERE id_producto = $1",
        [item.id_producto]
      );

      if (rows.length === 0) {
        throw new Error(`Producto ${item.id_producto} no existe`);
      }

      const producto = rows[0];
      const nuevoStock = producto.existencias - item.cantidad_producto;

      if (nuevoStock < 0) {
        throw new Error(`Falta de stock para ${producto.nombre}`);
      }

      precioTotal += producto.precio * item.cantidad_producto;
    }

    const ordenResult = await client.query(
      "INSERT INTO ordenes (rut, precio_total) VALUES ($1, $2) RETURNING *",
      [rut, precioTotal]
    );

    const ordenCreada = ordenResult.rows[0];

    await client.query(
      "INSERT INTO despachos (id_orden, id_direccion) VALUES ($1, $2)",
      [ordenCreada.id_orden, id_direccion]
    );

    for (const item of productos) {
      await client.query(
        `INSERT INTO lista_productos 
         (id_orden, id_producto, cantidad_producto)
         VALUES ($1, $2, $3)`,
        [ordenCreada.id_orden, item.id_producto, item.cantidad_producto]
      );

      await client.query(
        `UPDATE productos 
         SET existencias = existencias - $1
         WHERE id_producto = $2`,
        [item.cantidad_producto, item.id_producto]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      ok: true,
      mensaje: "Orden creada correctamente",
      orden: ordenCreada
    });

  } catch (error) {
    await client.query("ROLLBACK");

    res.status(409).json({
      ok: false,
      mensaje: error.message
    });

  } finally {
    client.release();
  }
});

app.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});