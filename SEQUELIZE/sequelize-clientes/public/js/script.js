const API = "/clientes";
const lista = document.getElementById("lista");
const mensaje = document.getElementById("mensaje");

function mostrarMensaje(texto, tipo = "ok") {
  mensaje.innerHTML = `<p class="mensaje ${tipo}">${texto}</p>`;
}

async function listarClientes() {
  try {
    const respuesta = await fetch(API);

    if (!respuesta.ok) {
      throw new Error("Error al obtener clientes");
    }

    const clientes = await respuesta.json();

    lista.innerHTML = "";

    if (clientes.length === 0) {
      lista.innerHTML = `<li class="empty">No hay clientes registrados.</li>`;
      return;
    }

    clientes.forEach(cliente => {
      const li = document.createElement("li");
      li.classList.add("item");

      li.innerHTML = `
        <div>
          <strong>${cliente.nombre}</strong>
          <span>${cliente.email}</span>
        </div>
        <small>ID: ${cliente.id}</small>
      `;

      lista.appendChild(li);
    });

    mostrarMensaje("Clientes cargados correctamente.");
  } catch {
    mostrarMensaje("No se pudo cargar la lista de clientes.", "error");
  }
}

document.getElementById("formCliente").addEventListener("submit", async e => {
  e.preventDefault();

  const nuevoCliente = {
    nombre: document.getElementById("nombre").value,
    email: document.getElementById("email").value
  };

  try {
    const respuesta = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(nuevoCliente)
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      return mostrarMensaje(data.mensaje || "Error al crear cliente.", "error");
    }

    e.target.reset();
    mostrarMensaje("Cliente creado correctamente.");
    listarClientes();
  } catch {
    mostrarMensaje("No se pudo crear el cliente.", "error");
  }
});

listarClientes();