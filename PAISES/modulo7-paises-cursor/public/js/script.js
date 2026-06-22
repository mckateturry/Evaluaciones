const tablaPaises = document.getElementById("tablaPaises");
const mensaje = document.getElementById("mensaje");

function mostrarMensaje(texto, tipo = "ok") {
  mensaje.innerHTML = `<p class="mensaje ${tipo}">${texto}</p>`;
}

async function listarPaises() {
  const cantidad = document.getElementById("cantidad").value;

  try {
    const res = await fetch(`/paises?cantidad=${cantidad}`);
    const data = await res.json();

    if (!res.ok) {
      return mostrarMensaje(data.mensaje, "error");
    }

    tablaPaises.innerHTML = "";

    data.paises.forEach(pais => {
      const fila = document.createElement("tr");

      fila.innerHTML = `
        <td>${pais.nombre}</td>
        <td>${pais.continente}</td>
        <td>${pais.poblacion}</td>
        <td>${pais.pib_2019}</td>
        <td>${pais.pib_2020}</td>
      `;

      tablaPaises.appendChild(fila);
    });

    mostrarMensaje(`Se cargaron ${data.cantidad} país(es).`);
  } catch {
    mostrarMensaje("No se pudo cargar la lista de países.", "error");
  }
}

document.getElementById("formAgregar").addEventListener("submit", async e => {
  e.preventDefault();

  const nuevoPais = {
    nombre: document.getElementById("nombre").value,
    continente: document.getElementById("continente").value,
    poblacion: Number(document.getElementById("poblacion").value),
    pib_2019: Number(document.getElementById("pib2019").value),
    pib_2020: Number(document.getElementById("pib2020").value)
  };

  try {
    const res = await fetch("/paises", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(nuevoPais)
    });

    const data = await res.json();

    if (!res.ok) {
      return mostrarMensaje(data.detalle || data.mensaje, "error");
    }

    e.target.reset();
    mostrarMensaje("País agregado correctamente.");
    listarPaises();

  } catch {
    mostrarMensaje("Error al agregar país.", "error");
  }
});

document.getElementById("formEliminar").addEventListener("submit", async e => {
  e.preventDefault();

  const nombre = document.getElementById("nombreEliminar").value;

  try {
    const res = await fetch(`/paises?nombre=${encodeURIComponent(nombre)}`, {
      method: "DELETE"
    });

    const data = await res.json();

    if (!res.ok) {
      return mostrarMensaje(data.detalle || data.mensaje, "error");
    }

    e.target.reset();
    mostrarMensaje("País eliminado correctamente.");
    listarPaises();

  } catch {
    mostrarMensaje("Error al eliminar país.", "error");
  }
});

listarPaises();