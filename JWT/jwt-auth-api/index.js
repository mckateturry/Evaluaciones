require("dotenv").config();

const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const fs = require("fs");

const auth = require("./middlewares/auth");

const app = express();

app.use(express.json());

app.use(express.static("public"));

function leerUsuarios() {

  return JSON.parse(
    fs.readFileSync("./usuarios.json")
  );

}

app.post("/auth/login", async (req, res) => {

  const { email, password } = req.body;

  if (!email || !password) {

    return res.status(400).json({
      ok: false,
      mensaje: "Email y contraseña requeridos"
    });

  }

  const usuarios = leerUsuarios();

  const usuario = usuarios.find(
    u => u.email === email
  );

  if (!usuario) {

    return res.status(401).json({
      ok: false,
      mensaje: "Credenciales inválidas"
    });

  }

  const passwordValida =
    await bcrypt.compare(
      password,
      usuario.password
    );

  if (!passwordValida) {

    return res.status(401).json({
      ok: false,
      mensaje: "Credenciales inválidas"
    });

  }

  const token = jwt.sign(
    {
      email: usuario.email,
      role: usuario.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES
    }
  );

  res.status(200).json({
    ok: true,
    token
  });

});

app.get("/api/perfil", auth, (req, res) => {

  res.status(200).json({
    ok: true,
    data: {
      email: req.user.email,
      role: req.user.role
    }
  });

});

app.listen(process.env.PORT, () => {

  console.log(
    `Servidor funcionando en http://localhost:${process.env.PORT}`
  );

});