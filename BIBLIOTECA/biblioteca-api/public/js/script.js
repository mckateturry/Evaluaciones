const tablaLibros = document.getElementById("tablaLibros");
const mensaje = document.getElementById("mensaje");
const formLibro = document.getElementById("formLibro");

const libroId = document.getElementById("libroId");
const titulo = document.getElementById("titulo");
const autor = document.getElementById("autor");
const anio = document.getElementById("anio");

let librosActuales = [];

function mostrarMensaje(texto, tipo = "ok") {
  mensaje.innerHTML = `<p class="message ${tipo}">${texto}</p>`;
}

function abrirFormulario() {
  formLibro.classList.remove("hidden");
  libroId.value = "";
  titulo.value = "";
  autor.value = "";
  anio.value = "";
  titulo.focus();
}

function cerrarFormulario() {
  formLibro.classList.add("hidden");
  formLibro.reset();
  libroId.value = "";
}

async function listarLibros() {
  try {
    const res = await fetch("/libros");
    const data = await res.json();

    if (!res.ok) {
      return mostrarMensaje(data.mensaje, "error");
    }

    librosActuales = data.data;
    tablaLibros.innerHTML = "";

    data.data.forEach(libro => {
      const fila = document.createElement("tr");

      fila.innerHTML = `
        <td>${libro.id}</td>
        <td>${libro.titulo}</td>
        <td>${libro.autor}</td>
        <td>${libro.anio}</td>
        <td>
          <button class="small" onclick="editarLibro(${libro.id})">Editar</button>
          <button class="small danger" onclick="eliminarLibro(${libro.id})">Eliminar</button>
        </td>
      `;

      tablaLibros.appendChild(fila);
    });

    mostrarMensaje("Catálogo cargado correctamente.");
  } catch {
    mostrarMensaje("No se pudo cargar el catálogo.", "error");
  }
}

function editarLibro(id) {
  const libro = librosActuales.find(item => item.id === id);

  if (!libro) {
    return mostrarMensaje("Libro no encontrado.", "error");
  }

  formLibro.classList.remove("hidden");

  libroId.value = libro.id;
  titulo.value = libro.titulo;
  autor.value = libro.autor;
  anio.value = libro.anio;
}

formLibro.addEventListener("submit", async e => {
  e.preventDefault();

  const libro = {
    titulo: titulo.value,
    autor: autor.value,
    anio: Number(anio.value)
  };

  const id = libroId.value;

  const url = id ? `/libros/${id}` : "/libros";
  const method = id ? "PUT" : "POST";

  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(libro)
    });

    const data = await res.json();

    if (!res.ok) {
      return mostrarMensaje(data.mensaje, "error");
    }

    mostrarMensaje(id ? "Libro actualizado correctamente." : "Libro creado correctamente.");
    cerrarFormulario();
    listarLibros();
  } catch {
    mostrarMensaje("No se pudo guardar el libro.", "error");
  }
});

async function eliminarLibro(id) {
  try {
    const res = await fetch(`/libros/${id}`, {
      method: "DELETE"
    });

    const data = await res.json();

    if (!res.ok) {
      return mostrarMensaje(data.mensaje, "error");
    }

    mostrarMensaje("Libro eliminado correctamente.");
    listarLibros();
  } catch {
    mostrarMensaje("No se pudo eliminar el libro.", "error");
  }
}

listarLibros();