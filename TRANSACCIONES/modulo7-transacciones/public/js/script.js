const mensaje = document.getElementById("mensaje");

function mostrarMensaje(texto, tipo = "ok") {
  if (mensaje) {
    mensaje.innerHTML = `<p class="mensaje ${tipo}">${texto}</p>`;
  }
}

async function cargarProductos() {
  try {
    const res = await fetch("/api?filtro=productos");
    const productos = await res.json();

    const tabla = document.getElementById("tablaProductos");
    if (!tabla) return;

    tabla.innerHTML = "";

    productos.forEach(producto => {
      const fila = document.createElement("tr");

      fila.innerHTML = `
        <td>${producto.id_producto}</td>
        <td>${producto.nombre}</td>
        <td>$${producto.precio}</td>
        <td>${producto.existencias}</td>
      `;

      tabla.appendChild(fila);
    });

    mostrarMensaje("Productos cargados correctamente.");
  } catch {
    mostrarMensaje("Error al cargar productos.", "error");
  }
}

async function buscarOrdenes() {
  const rut = document.getElementById("rutOrdenes").value;
  const lista = document.getElementById("listaOrdenes");

  if (!rut) {
    return mostrarMensaje("Debe ingresar un RUT.", "error");
  }

  try {
    const res = await fetch(`/api?filtro=ordenes&rut=${encodeURIComponent(rut)}`);
    const ordenes = await res.json();

    lista.innerHTML = "";

    if (ordenes.length === 0) {
      return mostrarMensaje("No hay órdenes para este cliente.", "error");
    }

    ordenes.forEach(orden => {
      const card = document.createElement("article");
      card.classList.add("card");

      card.innerHTML = `
        <h3>Orden #${orden.id_orden}</h3>
        <p><strong>RUT:</strong> ${orden.rut}</p>
        <p><strong>Total:</strong> $${orden.precio_total}</p>
      `;

      lista.appendChild(card);
    });

    mostrarMensaje("Órdenes encontradas.");
  } catch {
    mostrarMensaje("Error al buscar órdenes.", "error");
  }
}

async function cargarProductosParaOrden() {
  const contenedor = document.getElementById("productosOrden");
  if (!contenedor) return;

  const res = await fetch("/api?filtro=productos");
  const productos = await res.json();

  contenedor.innerHTML = "";

  productos.forEach(producto => {
    const div = document.createElement("div");
    div.classList.add("producto-item");

    div.innerHTML = `
      <div>
        <strong>${producto.nombre}</strong>
        <small>Precio: $${producto.precio} · Stock: ${producto.existencias}</small>
      </div>

      <input 
        type="number" 
        min="0" 
        value="0" 
        data-id="${producto.id_producto}"
      >
    `;

    contenedor.appendChild(div);
  });
}

async function cargarDirecciones() {
  const rut = document.getElementById("rutOrden").value;
  const select = document.getElementById("direccionSelect");

  if (!rut) {
    return mostrarMensaje("Debe ingresar el RUT del cliente.", "error");
  }

  try {
    const res = await fetch(`/api?filtro=direcciones&rut=${encodeURIComponent(rut)}`);
    const direcciones = await res.json();

    select.innerHTML = `<option value="">Seleccione dirección</option>`;

    direcciones.forEach(direccion => {
      const option = document.createElement("option");
      option.value = direccion.id_direccion;
      option.textContent = direccion.direccion;
      select.appendChild(option);
    });

    mostrarMensaje("Direcciones cargadas correctamente.");
  } catch {
    mostrarMensaje("Error al cargar direcciones.", "error");
  }
}

async function crearOrden() {
  const rut = document.getElementById("rutOrden").value;
  const idDireccion = document.getElementById("direccionSelect").value;
  const inputs = document.querySelectorAll("#productosOrden input");

  const productos = [];

  inputs.forEach(input => {
    const cantidad = Number(input.value);

    if (cantidad > 0) {
      productos.push({
        id_producto: Number(input.dataset.id),
        cantidad_producto: cantidad
      });
    }
  });

  if (!rut || !idDireccion || productos.length === 0) {
    return mostrarMensaje("Debe completar RUT, dirección y productos.", "error");
  }

  try {
    const res = await fetch("/orden", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        rut,
        id_direccion: Number(idDireccion),
        productos
      })
    });

    const data = await res.json();

    if (!res.ok) {
      return mostrarMensaje(data.mensaje, "error");
    }

    mostrarMensaje(`Orden #${data.orden.id_orden} creada correctamente. Total: $${data.orden.precio_total}`);
    cargarProductosParaOrden();

  } catch {
    mostrarMensaje("Error al crear la orden.", "error");
  }
}

if (window.location.pathname.includes("productos.html")) {
  cargarProductos();
}

if (window.location.pathname.includes("nueva-orden.html")) {
  cargarProductosParaOrden();
}