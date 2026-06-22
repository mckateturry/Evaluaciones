const http = require("http");
const fs = require("fs/promises");
const path = require("path");

const PORT = 3000;
const publicPath = path.join(__dirname, "public");

let cartones = [];
let serieActual = 1;

function generarNumeros() {
  const numeros = [];

  while (numeros.length < 15) {
    const numero = Math.floor(Math.random() * 30) + 1;

    if (!numeros.includes(numero)) {
      numeros.push(numero);
    }
  }

  return numeros.sort((a, b) => a - b);
}

function crearCarton() {
  const carton = {
    serie: serieActual,
    numeros: generarNumeros()
  };

  cartones.push(carton);
  serieActual++;

  return carton;
}

function crearCartonesIniciales() {
  for (let i = 0; i < 5; i++) {
    crearCarton();
  }
}

function enviarJSON(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

async function servirArchivo(req, res) {
  const filePath = req.url === "/"
    ? path.join(publicPath, "index.html")
    : path.join(publicPath, req.url);

  try {
    const contenido = await fs.readFile(filePath);

    let contentType = "text/html";

    if (filePath.endsWith(".css")) {
      contentType = "text/css";
    }

    if (filePath.endsWith(".js")) {
      contentType = "application/javascript";
    }

    res.writeHead(200, { "Content-Type": contentType });
    res.end(contenido);
  } catch {
    res.writeHead(404);
    res.end("Archivo no encontrado");
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method !== "GET" && req.method !== "POST") {
    return enviarJSON(res, 405, {
      error: "Método no permitido"
    });
  }

  if (req.method === "GET" && !url.pathname.startsWith("/api")) {
    return servirArchivo(req, res);
  }

  if (url.pathname === "/api/cartones" && req.method === "GET") {
    return enviarJSON(res, 200, cartones);
  }

  if (url.pathname === "/api/cartones" && req.method === "POST") {
    const nuevoCarton = crearCarton();

    return enviarJSON(res, 201, {
      mensaje: "Cartón creado correctamente",
      carton: nuevoCarton
    });
  }

  enviarJSON(res, 404, {
    error: "Ruta no encontrada"
  });
});

crearCartonesIniciales();

server.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});