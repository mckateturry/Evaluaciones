const express = require("express");
const cors = require("cors");
const { Sequelize, DataTypes } = require("sequelize");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3004;

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

const Pelicula = sequelize.define(
  "Pelicula",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    titulo: {
      type: DataTypes.STRING(150),
      allowNull: false
    },
    anio: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    tableName: "peliculas",
    timestamps: false
  }
);

const Actor = sequelize.define(
  "Actor",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(120),
      allowNull: false
    },
    fecha_nacimiento: {
      type: DataTypes.DATEONLY,
      allowNull: false
    }
  },
  {
    tableName: "actores",
    timestamps: false
  }
);

const PeliculasActores = sequelize.define(
  "PeliculasActores",
  {},
  {
    tableName: "peliculas_actores",
    timestamps: false
  }
);

Pelicula.belongsToMany(Actor, {
  through: PeliculasActores,
  foreignKey: "pelicula_id",
  otherKey: "actor_id"
});

Actor.belongsToMany(Pelicula, {
  through: PeliculasActores,
  foreignKey: "actor_id",
  otherKey: "pelicula_id"
});

app.get("/peliculas", async (req, res) => {
  try {
    const peliculas = await Pelicula.findAll({
      include: {
        model: Actor,
        through: { attributes: [] }
      },
      order: [["id", "ASC"]]
    });

    res.status(200).json(peliculas);
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: "Error al listar películas"
    });
  }
});

app.post("/peliculas", async (req, res) => {
  try {
    const { titulo, anio, actores } = req.body;

    if (!titulo || !anio) {
      return res.status(400).json({
        ok: false,
        mensaje: "Título y año son obligatorios"
      });
    }

    const pelicula = await Pelicula.create({ titulo, anio });

    if (actores && actores.length > 0) {
      await pelicula.addActors(actores);
    }

    const peliculaCompleta = await Pelicula.findByPk(pelicula.id, {
      include: {
        model: Actor,
        through: { attributes: [] }
      }
    });

    res.status(201).json({
      ok: true,
      mensaje: "Película creada correctamente",
      pelicula: peliculaCompleta
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      mensaje: error.message
    });
  }
});

app.get("/actores", async (req, res) => {
  try {
    const actores = await Actor.findAll({
      include: {
        model: Pelicula,
        through: { attributes: [] }
      },
      order: [["id", "ASC"]]
    });

    res.status(200).json(actores);
  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: "Error al listar actores"
    });
  }
});

app.post("/actores", async (req, res) => {
  try {
    const { nombre, fecha_nacimiento } = req.body;

    if (!nombre || !fecha_nacimiento) {
      return res.status(400).json({
        ok: false,
        mensaje: "Nombre y fecha de nacimiento son obligatorios"
      });
    }

    const actor = await Actor.create({ nombre, fecha_nacimiento });

    res.status(201).json({
      ok: true,
      mensaje: "Actor creado correctamente",
      actor
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      mensaje: error.message
    });
  }
});

app.post("/asignar-actor", async (req, res) => {
  const { pelicula_id, actor_id } = req.body;

  if (!pelicula_id || !actor_id) {
    return res.status(400).json({
      ok: false,
      mensaje: "Debe enviar pelicula_id y actor_id"
    });
  }

  try {
    const resultado = await sequelize.transaction(async (t) => {
      const pelicula = await Pelicula.findByPk(pelicula_id, {
        transaction: t
      });

      const actor = await Actor.findByPk(actor_id, {
        transaction: t
      });

      if (!pelicula) {
        throw new Error("Película no encontrada");
      }

      if (!actor) {
        throw new Error("Actor no encontrado");
      }

      await PeliculasActores.create(
        {
          pelicula_id,
          actor_id
        },
        {
          transaction: t
        }
      );

      return {
        pelicula,
        actor
      };
    });

    res.status(201).json({
      ok: true,
      mensaje: "Actor asignado correctamente a la película",
      data: resultado
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      mensaje: error.message
    });
  }
});

async function insertarDatosIniciales() {
  const totalPeliculas = await Pelicula.count();
  const totalActores = await Actor.count();

  if (totalPeliculas === 0 && totalActores === 0) {
    const pelicula1 = await Pelicula.create({
      titulo: "Interestelar",
      anio: 2014
    });

    const pelicula2 = await Pelicula.create({
      titulo: "The Matrix",
      anio: 1999
    });

    const actor1 = await Actor.create({
      nombre: "Matthew McConaughey",
      fecha_nacimiento: "1969-11-04"
    });

    const actor2 = await Actor.create({
      nombre: "Keanu Reeves",
      fecha_nacimiento: "1964-09-02"
    });

    await pelicula1.addActor(actor1);
    await pelicula2.addActor(actor2);
  }
}

async function iniciarServidor() {
  try {
    await sequelize.authenticate();
    console.log("Conexión a PostgreSQL realizada correctamente.");

    await sequelize.sync();
    console.log("Tablas sincronizadas correctamente.");

    await insertarDatosIniciales();

    app.listen(PORT, () => {
      console.log(`API funcionando en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error al iniciar:", error.message);
  }
}

iniciarServidor();