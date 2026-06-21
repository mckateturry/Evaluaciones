const http = require("http");
const fs = require("fs/promises");
const path = require("path");

const PORT = 3000;

const peliculasPath = path.join(__dirname, "peliculas.txt");
const seriesPath = path.join(__dirname, "series.txt");
const publicPath = path.join(__dirname, "public");

function enviarJSON(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

async function leerCatalogo(tipo) {
  const archivo = tipo === "peliculas" ? peliculasPath : seriesPath;
  const contenido = await fs.readFile(archivo, "utf-8");

  return contenido
    .split("\n")
    .filter(linea => linea.trim() !== "")
    .map(linea => {
      const partes = linea.split(",").map(p => p.trim());

      if (tipo === "peliculas") {
        return {
          nombre: partes[0],
          director: partes[1],
          anio: Number(partes[2])
        };
      }

      return {
        nombre: partes[0],
        anio: Number(partes[1]),
        temporadas: Number(partes[2])
      };
    });
}

async function agregarCatalogo(tipo, data) {
  const archivo = tipo === "peliculas" ? peliculasPath : seriesPath;

  let nuevaLinea = "";

  if (tipo === "peliculas") {
    nuevaLinea = `${data.nombre}, ${data.director}, ${data.anio}\n`;
  } else {
    nuevaLinea = `${data.nombre}, ${data.anio}, ${data.temporadas}\n`;
  }

  await fs.appendFile(archivo, nuevaLinea);
}

async function eliminarCatalogo(tipo, nombre) {
  const archivo = tipo === "peliculas" ? peliculasPath : seriesPath;
  const contenido = await fs.readFile(archivo, "utf-8");

  const lineas = contenido
    .split("\n")
    .filter(linea => linea.trim() !== "");

  const nuevasLineas = lineas.filter(linea => {
    const nombreActual = linea.split(",")[0].trim().toLowerCase();
    return nombreActual !== nombre.toLowerCase();
  });

  await fs.writeFile(archivo, nuevasLineas.join("\n") + "\n");
}

async function servirArchivoEstatico(req, res) {
  let filePath = req.url === "/" 
    ? path.join(publicPath, "index.html")
    : path.join(publicPath, req.url);

  try {
    const contenido = await fs.readFile(filePath);

    let contentType = "text/html";

    if (filePath.endsWith(".css")) contentType = "text/css";
    if (filePath.endsWith(".js")) contentType = "application/javascript";

    res.writeHead(200, { "Content-Type": contentType });
    res.end(contenido);
  } catch {
    res.writeHead(404);
    res.end("Archivo no encontrado");
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method !== "GET" && req.method !== "POST" && req.method !== "DELETE") {
    return enviarJSON(res, 405, { error: "Método no permitido" });
  }

  if (req.method === "GET" && !url.pathname.startsWith("/api")) {
    return servirArchivoEstatico(req, res);
  }

  if (url.pathname === "/api/catalogo" && req.method === "GET") {
    const tipo = url.searchParams.get("tipo");

    if (tipo !== "peliculas" && tipo !== "series") {
      return enviarJSON(res, 400, { error: "Tipo inválido" });
    }

    const catalogo = await leerCatalogo(tipo);
    return enviarJSON(res, 200, catalogo);
  }

  if (url.pathname === "/api/catalogo" && req.method === "POST") {
    const tipo = url.searchParams.get("tipo");

    if (tipo !== "peliculas" && tipo !== "series") {
      return enviarJSON(res, 400, { error: "Tipo inválido" });
    }

    let body = "";

    req.on("data", chunk => {
      body += chunk;
    });

    req.on("end", async () => {
      const data = JSON.parse(body);

      await agregarCatalogo(tipo, data);

      enviarJSON(res, 201, {
        mensaje: "Elemento agregado correctamente",
        data
      });
    });

    return;
  }

  if (url.pathname === "/api/catalogo" && req.method === "DELETE") {
    const tipo = url.searchParams.get("tipo");
    const nombre = url.searchParams.get("nombre");

    if ((tipo !== "peliculas" && tipo !== "series") || !nombre) {
      return enviarJSON(res, 400, { error: "Datos inválidos" });
    }

    await eliminarCatalogo(tipo, nombre);

    return enviarJSON(res, 200, {
      mensaje: "Elemento eliminado correctamente"
    });
  }

  enviarJSON(res, 404, { error: "Ruta no encontrada" });
});

server.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});