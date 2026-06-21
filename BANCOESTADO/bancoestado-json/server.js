const http = require("http");
const fs = require("fs/promises");
const path = require("path");

const PORT = 3000;
const clientesPath = path.join(__dirname, "data", "clientes.json");
const publicPath = path.join(__dirname, "public");

function enviarJSON(res, status, data) {
  res.writeHead(status, { "Content-Type": "application/json" });
  res.end(JSON.stringify(data));
}

async function leerClientes() {
  const data = await fs.readFile(clientesPath, "utf-8");
  return JSON.parse(data);
}

async function guardarClientes(clientes) {
  await fs.writeFile(clientesPath, JSON.stringify(clientes, null, 2));
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

  if (url.pathname === "/api/clientes" && req.method === "GET") {
    const clientes = await leerClientes();
    return enviarJSON(res, 200, clientes);
  }

  if (url.pathname === "/api/clientes/cuenta-rut" && req.method === "GET") {
    const clientes = await leerClientes();
    const filtrados = clientes.filter(cliente => cliente.cuentaRut !== null);
    return enviarJSON(res, 200, filtrados);
  }

  if (url.pathname === "/api/clientes" && req.method === "POST") {
    let body = "";

    req.on("data", chunk => body += chunk);

    req.on("end", async () => {
      const data = JSON.parse(body);
      const clientes = await leerClientes();

      const nuevoCliente = {
        id: Date.now(),
        nombre: data.nombre,
        rut: data.rut,
        cuentaRut: data.tipoCuenta === "rut"
          ? { numero: data.numeroCuenta, saldo: Number(data.saldo) }
          : null,
        cuentasAhorro: data.tipoCuenta === "ahorro"
          ? [{ numero: data.numeroCuenta, saldo: Number(data.saldo) }]
          : []
      };

      clientes.push(nuevoCliente);
      await guardarClientes(clientes);

      enviarJSON(res, 201, {
        mensaje: "Cliente agregado correctamente",
        cliente: nuevoCliente
      });
    });

    return;
  }

  if (url.pathname === "/api/clientes/cuenta-rut" && req.method === "POST") {
    let body = "";

    req.on("data", chunk => body += chunk);

    req.on("end", async () => {
      const data = JSON.parse(body);
      const clientes = await leerClientes();

      const cliente = clientes.find(c => c.rut === data.rut);

      if (!cliente) {
        return enviarJSON(res, 404, { error: "Cliente no encontrado" });
      }

      if (cliente.cuentaRut) {
        return enviarJSON(res, 400, { error: "El cliente ya tiene cuenta RUT" });
      }

      cliente.cuentaRut = {
        numero: data.numeroCuenta,
        saldo: Number(data.saldo)
      };

      await guardarClientes(clientes);

      enviarJSON(res, 200, {
        mensaje: "Cuenta RUT agregada correctamente",
        cliente
      });
    });

    return;
  }

  if (url.pathname === "/api/clientes/cuenta-ahorro" && req.method === "POST") {
    let body = "";

    req.on("data", chunk => body += chunk);

    req.on("end", async () => {
      const data = JSON.parse(body);
      const clientes = await leerClientes();

      const cliente = clientes.find(c => c.rut === data.rut);

      if (!cliente) {
        return enviarJSON(res, 404, { error: "Cliente no encontrado" });
      }

      cliente.cuentasAhorro.push({
        numero: data.numeroCuenta,
        saldo: Number(data.saldo)
      });

      await guardarClientes(clientes);

      enviarJSON(res, 200, {
        mensaje: "Cuenta de ahorro agregada correctamente",
        cliente
      });
    });

    return;
  }

  if (url.pathname === "/api/clientes" && req.method === "DELETE") {
    const rut = url.searchParams.get("rut");
    const clientes = await leerClientes();

    const nuevosClientes = clientes.filter(cliente => cliente.rut !== rut);

    await guardarClientes(nuevosClientes);

    return enviarJSON(res, 200, {
      mensaje: "Cliente eliminado correctamente"
    });
  }

  if (url.pathname === "/api/clientes/cuenta-rut" && req.method === "DELETE") {
    const rut = url.searchParams.get("rut");
    const clientes = await leerClientes();

    const cliente = clientes.find(c => c.rut === rut);

    if (!cliente) {
      return enviarJSON(res, 404, { error: "Cliente no encontrado" });
    }

    cliente.cuentaRut = null;

    await guardarClientes(clientes);

    return enviarJSON(res, 200, {
      mensaje: "Cuenta RUT eliminada correctamente"
    });
  }

  if (url.pathname === "/api/clientes/cuenta-ahorro" && req.method === "DELETE") {
    const rut = url.searchParams.get("rut");
    const numero = url.searchParams.get("numero");

    const clientes = await leerClientes();
    const cliente = clientes.find(c => c.rut === rut);

    if (!cliente) {
      return enviarJSON(res, 404, { error: "Cliente no encontrado" });
    }

    cliente.cuentasAhorro = cliente.cuentasAhorro.filter(
      cuenta => cuenta.numero !== numero
    );

    await guardarClientes(clientes);

    return enviarJSON(res, 200, {
      mensaje: "Cuenta de ahorro eliminada correctamente"
    });
  }

  enviarJSON(res, 404, { error: "Ruta no encontrada" });
});

server.listen(PORT, () => {
  console.log(`Servidor funcionando en http://localhost:${PORT}`);
});