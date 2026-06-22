const http = require("http");
const fs = require("fs/promises");
const path = require("path");

const PORT = 3000;
const mascotasPath = path.join(__dirname, "data", "mascotas.json");
const publicPath = path.join(__dirname, "public");

function enviarJSON(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

async function leerMascotas() {
  const data = await fs.readFile(mascotasPath, "utf-8");
  return JSON.parse(data);
}

async function guardarMascotas(mascotas) {
  await fs.writeFile(mascotasPath, JSON.stringify(mascotas, null, 2));
}

async function servirArchivo(req, res) {
  const filePath = req.url === "/"
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

  if (!["GET", "POST", "DELETE"].includes(req.method)) {
    return enviarJSON(res, 405, { error: "Método no permitido" });
  }

  if (req.method === "GET" && !url.pathname.startsWith("/api")) {
    return servirArchivo(req, res);
  }

  if (url.pathname === "/api/mascotas" && req.method === "GET") {
    const mascotas = await leerMascotas();
    const nombre = url.searchParams.get("nombre");
    const rut = url.searchParams.get("rut");

    if (nombre) {
      const mascota = mascotas.find(
        m => m.nombre.toLowerCase() === nombre.toLowerCase()
      );

      if (!mascota) {
        return enviarJSON(res, 404, { error: "Mascota no encontrada" });
      }

      return enviarJSON(res, 200, mascota);
    }

    if (rut) {
      const mascotasRut = mascotas.filter(m => m.rut === rut);
      return enviarJSON(res, 200, mascotasRut);
    }

    return enviarJSON(res, 200, mascotas);
  }

  if (url.pathname === "/api/mascotas" && req.method === "POST") {
    let body = "";

    req.on("data", chunk => body += chunk);

    req.on("end", async () => {
      try {
        const data = JSON.parse(body);

        if (!data.nombre || !data.rut) {
          return enviarJSON(res, 400, {
            error: "Debe ingresar nombre de mascota y RUT del dueño"
          });
        }

        const mascotas = await leerMascotas();

        const nuevaMascota = {
          nombre: data.nombre,
          rut: data.rut
        };

        mascotas.push(nuevaMascota);
        await guardarMascotas(mascotas);

        enviarJSON(res, 201, {
          mensaje: "Mascota registrada correctamente",
          mascota: nuevaMascota
        });
      } catch {
        enviarJSON(res, 400, { error: "JSON inválido" });
      }
    });

    return;
  }

  if (url.pathname === "/api/mascotas" && req.method === "DELETE") {
    const nombre = url.searchParams.get("nombre");
    const rut = url.searchParams.get("rut");

    if (!nombre && !rut) {
      return enviarJSON(res, 400, {
        error: "Debe enviar nombre o rut como parámetro"
      });
    }

    const mascotas = await leerMascotas();

    let nuevasMascotas;

    if (nombre) {
      nuevasMascotas = mascotas.filter(
        m => m.nombre.toLowerCase() !== nombre.toLowerCase()
      );
    }

    if (rut) {
      nuevasMascotas = mascotas.filter(m => m.rut !== rut);
    }

    await guardarMascotas(nuevasMascotas);

    return enviarJSON(res, 200, {
      mensaje: "Eliminación realizada correctamente"
    });
  }

  enviarJSON(res, 404, { error: "Ruta no encontrada" });
});

server.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});