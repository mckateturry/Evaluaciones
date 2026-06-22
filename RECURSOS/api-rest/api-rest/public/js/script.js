let usuariosOriginales = [];

const mensaje = document.getElementById("mensaje");
const detalle = document.getElementById("detalle");

function mostrarMensaje(texto, tipo = "ok") {
  if (mensaje) {
    mensaje.innerHTML = `<p class="message ${tipo}">${texto}</p>`;
  }
}

function mostrarDetalle(data) {
  if (detalle) {
    detalle.textContent = JSON.stringify(data, null, 2);
  }
}

async function cargarUsuarios() {
  const tabla = document.getElementById("tablaUsuarios");
  if (!tabla) return;

  try {
    const res = await fetch("/api/v1/usuarios");
    const data = await res.json();

    usuariosOriginales = data.data;

    tabla.innerHTML = "";

    data.data.forEach(usuario => {
      const fila = document.createElement("tr");

      fila.innerHTML = `
        <td>${usuario.id}</td>
        <td>${usuario.nombre}</td>
      `;

      tabla.appendChild(fila);
    });

    mostrarMensaje("Usuarios cargados correctamente.");
  } catch {
    mostrarMensaje("Error al cargar usuarios.", "error");
  }
}

function filtrarUsuarios() {
  const texto = document.getElementById("filtroUsuario").value.toLowerCase();
  const tabla = document.getElementById("tablaUsuarios");

  const filtrados = usuariosOriginales.filter(usuario =>
    usuario.nombre.toLowerCase().includes(texto)
  );

  tabla.innerHTML = "";

  filtrados.forEach(usuario => {
    const fila = document.createElement("tr");

    fila.innerHTML = `
      <td>${usuario.id}</td>
      <td>${usuario.nombre}</td>
    `;

    tabla.appendChild(fila);
  });
}

async function detalleUsuario() {
  const id = document.getElementById("usuarioId").value;

  if (!id) {
    return mostrarMensaje("Ingresa un ID de usuario.", "error");
  }

  try {
    const res = await fetch(`/api/v1/usuarios/${id}`);
    const data = await res.json();

    if (!res.ok) {
      mostrarDetalle(data);
      return mostrarMensaje("Usuario no encontrado. Estado 404.", "error");
    }

    mostrarDetalle(data);
    mostrarMensaje("Detalle cargado. Estado 200.");
  } catch {
    mostrarMensaje("Error al buscar usuario.", "error");
  }
}

async function cargarProductos() {
  const tabla = document.getElementById("tablaProductos");
  if (!tabla) return;

  try {
    const res = await fetch("/api/v1/productos");
    const data = await res.json();

    tabla.innerHTML = "";

    data.data.forEach(producto => {
      const fila = document.createElement("tr");

      fila.innerHTML = `
        <td>${producto.id}</td>
        <td>${producto.nombre}</td>
        <td>$${producto.precio.toLocaleString("es-CL")}</td>
      `;

      tabla.appendChild(fila);
    });

    mostrarMensaje("Productos cargados correctamente.");
  } catch {
    mostrarMensaje("Error al cargar productos.", "error");
  }
}

async function detalleProducto() {
  const id = document.getElementById("productoId").value;

  if (!id) {
    return mostrarMensaje("Ingresa un ID de producto.", "error");
  }

  try {
    const res = await fetch(`/api/v1/productos/${id}`);
    const data = await res.json();

    if (!res.ok) {
      mostrarDetalle(data);
      return mostrarMensaje("Producto no encontrado. Estado 404.", "error");
    }

    mostrarDetalle(data);
    mostrarMensaje("Detalle cargado. Estado 200.");
  } catch {
    mostrarMensaje("Error al buscar producto.", "error");
  }
}

cargarUsuarios();
cargarProductos();