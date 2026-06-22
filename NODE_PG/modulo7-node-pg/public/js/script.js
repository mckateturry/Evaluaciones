const tablaFinanzas = document.getElementById("tablaFinanzas");
const listaClientes = document.getElementById("listaClientes");
const mensaje = document.getElementById("mensaje");

function mostrarMensaje(texto, tipo = "ok") {
  mensaje.innerHTML = `<p class="mensaje ${tipo}">${texto}</p>`;
}

async function cargarFinanzas() {
  try {
    const respuesta = await fetch("/finanzas");

    if (!respuesta.ok) {
      throw new Error("Error en la consulta");
    }

    const finanzas = await respuesta.json();

    tablaFinanzas.innerHTML = "";

    finanzas.forEach(item => {
      const fila = document.createElement("tr");

      fila.innerHTML = `
        <td>${item.id}</td>
        <td>${item.descripcion}</td>
        <td>${item.tipo}</td>
        <td>$${item.monto}</td>
        <td>${new Date(item.fecha).toLocaleDateString()}</td>
      `;

      tablaFinanzas.appendChild(fila);
    });

    mostrarMensaje("Finanzas cargadas correctamente.");
  } catch (error) {
    mostrarMensaje("No se pudieron cargar las finanzas.", "error");
  }
}

async function cargarClientes() {
  try {
    const respuesta = await fetch("/clientes");

    if (!respuesta.ok) {
      throw new Error("Error en la consulta");
    }

    const clientes = await respuesta.json();

    listaClientes.innerHTML = "";

    clientes.forEach(cliente => {
      const card = document.createElement("article");
      card.classList.add("card");

      card.innerHTML = `
        <h3>${cliente.nombre}</h3>
        <p><strong>RUT:</strong> ${cliente.rut}</p>
        <p><strong>Correo:</strong> ${cliente.correo}</p>
        <p><strong>Teléfono:</strong> ${cliente.telefono}</p>
      `;

      listaClientes.appendChild(card);
    });

    mostrarMensaje("Clientes cargados correctamente.");
  } catch (error) {
    mostrarMensaje("No se pudieron cargar los clientes.", "error");
  }
}