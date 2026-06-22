const resultado = document.getElementById("resultado");
const mensaje = document.getElementById("mensaje");
const contador = document.getElementById("contador");

function mostrarMensaje(texto, tipo = "ok") {
  mensaje.innerHTML = `<p class="message ${tipo}">${texto}</p>`;
}

function mostrarMascotas(mascotas) {
  resultado.innerHTML = "";

  if (!Array.isArray(mascotas)) {
    mascotas = [mascotas];
  }

  contador.textContent = `${mascotas.length} registro(s)`;

  if (mascotas.length === 0) {
    resultado.innerHTML = `<p class="empty">No se encontraron registros.</p>`;
    return;
  }

  mascotas.forEach(mascota => {
    const card = document.createElement("article");
    card.classList.add("card");

    card.innerHTML = `
      <div class="icon">🐾</div>
      <div>
        <h3>${mascota.nombre}</h3>
        <p><strong>RUT dueño:</strong> ${mascota.rut}</p>
      </div>
    `;

    resultado.appendChild(card);
  });
}

async function listarTodas() {
  try {
    const res = await axios.get("/api/mascotas");
    mostrarMascotas(res.data);
    mostrarMensaje("Listado cargado correctamente.");
  } catch {
    mostrarMensaje("No se pudo cargar el listado.", "error");
  }
}

async function buscarPorNombre() {
  const nombre = document.getElementById("buscarNombre").value;

  if (!nombre) {
    return mostrarMensaje("Ingresa un nombre para buscar.", "error");
  }

  try {
    const res = await axios.get(`/api/mascotas?nombre=${encodeURIComponent(nombre)}`);
    mostrarMascotas(res.data);
    mostrarMensaje("Mascota encontrada.");
  } catch {
    mostrarMascotas([]);
    mostrarMensaje("Mascota no encontrada.", "error");
  }
}

async function buscarPorRut() {
  const rut = document.getElementById("buscarRut").value;

  if (!rut) {
    return mostrarMensaje("Ingresa un RUT para buscar.", "error");
  }

  try {
    const res = await axios.get(`/api/mascotas?rut=${encodeURIComponent(rut)}`);
    mostrarMascotas(res.data);
    mostrarMensaje("Búsqueda por RUT realizada.");
  } catch {
    mostrarMensaje("No se pudo realizar la búsqueda.", "error");
  }
}

document.getElementById("formMascota").addEventListener("submit", async e => {
  e.preventDefault();

  const nuevaMascota = {
    nombre: document.getElementById("nombre").value,
    rut: document.getElementById("rut").value
  };

  try {
    await axios.post("/api/mascotas", nuevaMascota);

    e.target.reset();
    mostrarMensaje("Mascota registrada correctamente.");
    listarTodas();
  } catch {
    mostrarMensaje("No se pudo registrar la mascota.", "error");
  }
});

async function eliminarPorNombre() {
  const nombre = document.getElementById("eliminarNombre").value;

  if (!nombre) {
    return mostrarMensaje("Ingresa un nombre para eliminar.", "error");
  }

  try {
    await axios.delete(`/api/mascotas?nombre=${encodeURIComponent(nombre)}`);
    document.getElementById("eliminarNombre").value = "";
    mostrarMensaje("Mascota eliminada correctamente.");
    listarTodas();
  } catch {
    mostrarMensaje("No se pudo eliminar la mascota.", "error");
  }
}

async function eliminarPorRut() {
  const rut = document.getElementById("eliminarRut").value;

  if (!rut) {
    return mostrarMensaje("Ingresa un RUT para eliminar.", "error");
  }

  try {
    await axios.delete(`/api/mascotas?rut=${encodeURIComponent(rut)}`);
    document.getElementById("eliminarRut").value = "";
    mostrarMensaje("Mascotas asociadas al RUT eliminadas.");
    listarTodas();
  } catch {
    mostrarMensaje("No se pudo eliminar por RUT.", "error");
  }
}

listarTodas();