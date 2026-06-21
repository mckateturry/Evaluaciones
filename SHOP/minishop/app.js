const express = require("express");
const { engine } = require("express-handlebars");

const app = express();
const PORT = 3000;

app.engine(
  "handlebars",
  engine({
    defaultLayout: "main",
    helpers: {
      mayusculas: (texto) => texto.toUpperCase()
    }
  })
);

app.set("view engine", "handlebars");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const tienda = "MiniShop";
const mensaje = "Bienvenidos a nuestra tienda online";

const productos = [
  { nombre: "Camiseta Básica", precio: 15, disponible: true, imagen: "https://images.unsplash.com/photo-1523381294911-8d3cead13475?w=600" },
  { nombre: "Pantalón Jeans", precio: 30, disponible: false, imagen: "https://images.unsplash.com/photo-1583005008627-cf9c4e1a9d6d?w=600" },
  { nombre: "Zapatos Deportivos", precio: 50, disponible: true, imagen: "https://images.unsplash.com/photo-1528701800489-20be8c01c1a3?w=600" },
  { nombre: "Chaqueta de Cuero", precio: 80, disponible: true, imagen: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600" },
  { nombre: "Gorra Clásica", precio: 12, disponible: true, imagen: "https://images.unsplash.com/photo-1526170375885-bf2f5f0f3e3a?w=600" }
];

app.get("/", (req, res) => {
  res.render("home", {
    tienda,
    mensaje,
    productos
  });
});

app.get("/about", (req, res) => {
  res.render("about", { tienda });
});

app.get("/contact", (req, res) => {
  res.render("contact");
});

app.post("/contact", (req, res) => {
  const { nombre, email, mensaje } = req.body;

  res.render("success", {
    nombre,
    email,
    mensaje
  });
});

// Métodos no permitidos
app.all("/", (req, res) => {
  res.status(405).send("Método no permitido");
});

app.all("/about", (req, res) => {
  res.status(405).send("Método no permitido");
});

app.all("/contact", (req, res) => {
  res.status(405).send("Método no permitido");
});

app.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});