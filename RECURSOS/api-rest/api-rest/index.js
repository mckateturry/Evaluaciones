const express = require("express");
const usuarios = require("./usuarios.json");
const productos = require("./productos.json");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("public"));

// USUARIOS

app.get("/api/v1/usuarios", (req, res) => {
  res.status(200).json({
    ok: true,
    data: usuarios
  });
});

app.get("/api/v1/usuarios/:id", (req, res) => {
  const id = Number(req.params.id);
  const usuario = usuarios.find(u => u.id === id);

  if (!usuario) {
    return res.status(404).json({
      ok: false,
      mensaje: "Usuario no encontrado"
    });
  }

  res.status(200).json({
    ok: true,
    data: usuario
  });
});

// PRODUCTOS

app.get("/api/v1/productos", (req, res) => {
  res.status(200).json({
    ok: true,
    data: productos
  });
});

app.get("/api/v1/productos/:id", (req, res) => {
  const id = Number(req.params.id);
  const producto = productos.find(p => p.id === id);

  if (!producto) {
    return res.status(404).json({
      ok: false,
      mensaje: "Producto no encontrado"
    });
  }

  res.status(200).json({
    ok: true,
    data: producto
  });
});

// RUTA NO ENCONTRADA

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    mensaje: "Ruta no encontrada"
  });
});

app.listen(PORT, () => {
  console.log(`API escuchando en http://localhost:${PORT}`);
});