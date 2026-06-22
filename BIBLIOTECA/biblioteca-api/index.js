const express = require("express");
const fs = require("fs/promises");
const path = require("path");

const app = express();
const PORT = 3000;
const DATA_PATH = path.join(__dirname, "catalogo.json");

app.use(express.json());
app.use(express.static("public"));

async function leerCatalogo() {
  try {
    const data = await fs.readFile(DATA_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      await fs.writeFile(DATA_PATH, "[]");
      return [];
    }

    throw error;
  }
}

async function escribirCatalogo(data) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2));
}

function validarLibro(titulo, autor, anio) {
  return titulo && autor && Number.isInteger(anio);
}

app.get("/libros", async (req, res) => {
  try {
    const libros = await leerCatalogo();

    res.status(200).json({
      ok: true,
      data: libros
    });
  } catch {
    res.status(500).json({
      ok: false,
      mensaje: "Error al leer el catálogo"
    });
  }
});

app.post("/libros", async (req, res) => {
  try {
    const { titulo, autor, anio } = req.body;

    if (!validarLibro(titulo, autor, anio)) {
      return res.status(400).json({
        ok: false,
        mensaje: "Datos inválidos. Debe enviar titulo, autor y anio numérico."
      });
    }

    const libros = await leerCatalogo();
    const nuevoId = Math.max(0, ...libros.map(libro => libro.id)) + 1;

    const nuevoLibro = {
      id: nuevoId,
      titulo,
      autor,
      anio
    };

    libros.push(nuevoLibro);
    await escribirCatalogo(libros);

    res.status(201).json({
      ok: true,
      data: nuevoLibro
    });
  } catch {
    res.status(500).json({
      ok: false,
      mensaje: "Error al crear el libro"
    });
  }
});

app.put("/libros/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { titulo, autor, anio } = req.body;

    if (!Number.isInteger(id) || !validarLibro(titulo, autor, anio)) {
      return res.status(400).json({
        ok: false,
        mensaje: "Datos inválidos"
      });
    }

    const libros = await leerCatalogo();
    const index = libros.findIndex(libro => libro.id === id);

    if (index === -1) {
      return res.status(404).json({
        ok: false,
        mensaje: "Libro no encontrado"
      });
    }

    libros[index] = {
      id,
      titulo,
      autor,
      anio
    };

    await escribirCatalogo(libros);

    res.status(200).json({
      ok: true,
      data: libros[index]
    });
  } catch {
    res.status(500).json({
      ok: false,
      mensaje: "Error al actualizar el libro"
    });
  }
});

app.delete("/libros/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({
        ok: false,
        mensaje: "ID inválido"
      });
    }

    const libros = await leerCatalogo();
    const index = libros.findIndex(libro => libro.id === id);

    if (index === -1) {
      return res.status(404).json({
        ok: false,
        mensaje: "Libro no encontrado"
      });
    }

    const eliminado = libros.splice(index, 1)[0];
    await escribirCatalogo(libros);

    res.status(200).json({
      ok: true,
      data: eliminado
    });
  } catch {
    res.status(500).json({
      ok: false,
      mensaje: "Error al eliminar el libro"
    });
  }
});

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    mensaje: "Ruta no encontrada"
  });
});

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});