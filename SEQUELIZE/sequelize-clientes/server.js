const express = require("express");
const cors = require("cors");
const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "postgres",
    logging: false
  }
);

const Cliente = sequelize.define(
  "Cliente",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(120),
      allowNull: false,
      unique: true
    }
  },
  {
    tableName: "clientes",
    timestamps: false
  }
);

app.get("/clientes", async (req, res) => {
  try {
    const clientes = await Cliente.findAll({
      order: [["id", "ASC"]]
    });

    res.status(200).json(clientes);
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: "Error al obtener clientes"
    });
  }
});

app.post("/clientes", async (req, res) => {
  try {
    const { nombre, email } = req.body;

    if (!nombre || !email) {
      return res.status(400).json({
        ok: false,
        mensaje: "Nombre y email son obligatorios"
      });
    }

    const creado = await Cliente.create({ nombre, email });

    res.status(201).json({
      ok: true,
      mensaje: "Cliente creado correctamente",
      cliente: creado
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      mensaje: error.message
    });
  }
});

async function iniciarServidor() {
  try {
    await sequelize.authenticate();
    console.log("Conexión a PostgreSQL realizada correctamente.");

    await sequelize.sync();
    console.log("Tabla clientes sincronizada correctamente.");

    app.listen(PORT, () => {
      console.log(`API en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error al iniciar:", error.message);
  }
}

iniciarServidor();