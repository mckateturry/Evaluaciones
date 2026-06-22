const mensaje = document.getElementById("mensaje");
const listaPeliculas = document.getElementById("listaPeliculas");
const listaActores = document.getElementById("listaActores");
const peliculaSelect = document.getElementById("peliculaSelect");
const actorSelect = document.getElementById("actorSelect");

function mostrarMensaje(texto, tipo = "ok") {
  mensaje.innerHTML = `<p class="mensaje ${tipo}">${texto}</p>`;
}

async function listarPeliculas() {
  try {
    const res = await fetch("/peliculas");
    const peliculas = await res.json();

    listaPeliculas.innerHTML = "";
    peliculaSelect.innerHTML = `<option value="">Seleccione película</option>`;

    peliculas.forEach(pelicula => {
      const card = document.createElement("article");
      card.classList.add("card");

      const actores = pelicula.Actors && pelicula.Actors.length > 0
        ? pelicula.Actors.map(actor => actor.nombre).join(", ")
        : "Sin actores asignados";

      card.innerHTML = `
        <h3>${pelicula.titulo}</h3>
        <p><strong>Año:</strong> ${pelicula.anio}</p>
        <p><strong>Actores:</strong> ${actores}</p>
      `;

      listaPeliculas.appendChild(card);

      const option = document.createElement("option");
      option.value = pelicula.id;
      option.textContent = pelicula.titulo;
      peliculaSelect.appendChild(option);
    });

    mostrarMensaje("Películas cargadas correctamente.");
  } catch {
    mostrarMensaje("Error al cargar películas.", "error");
  }
}

async function listarActores() {
  try {
    const res = await fetch("/actores");
    const actores = await res.json();

    listaActores.innerHTML = "";
    actorSelect.innerHTML = `<option value="">Seleccione actor</option>`;

    actores.forEach(actor => {
      const card = document.createElement("article");
      card.classList.add("card");

      const peliculas = actor.Peliculas && actor.Peliculas.length > 0
        ? actor.Peliculas.map(pelicula => pelicula.titulo).join(", ")
        : "Sin películas asignadas";

      card.innerHTML = `
        <h3>${actor.nombre}</h3>
        <p><strong>Fecha nacimiento:</strong> ${actor.fecha_nacimiento}</p>
        <p><strong>Películas:</strong> ${peliculas}</p>
      `;

      listaActores.appendChild(card);

      const option = document.createElement("option");
      option.value = actor.id;
      option.textContent = actor.nombre;
      actorSelect.appendChild(option);
    });

    mostrarMensaje("Actores cargados correctamente.");
  } catch {
    mostrarMensaje("Error al cargar actores.", "error");
  }
}

document.getElementById("formPelicula").addEventListener("submit", async e => {
  e.preventDefault();

  const nuevaPelicula = {
    titulo: document.getElementById("titulo").value,
    anio: Number(document.getElementById("anio").value)
  };

  try {
    const res = await fetch("/peliculas", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(nuevaPelicula)
    });

    const data = await res.json();

    if (!res.ok) {
      return mostrarMensaje(data.mensaje, "error");
    }

    e.target.reset();
    mostrarMensaje("Película creada correctamente.");
    listarPeliculas();
  } catch {
    mostrarMensaje("Error al crear película.", "error");
  }
});

document.getElementById("formActor").addEventListener("submit", async e => {
  e.preventDefault();

  const nuevoActor = {
    nombre: document.getElementById("nombreActor").value,
    fecha_nacimiento: document.getElementById("fechaNacimiento").value
  };

  try {
    const res = await fetch("/actores", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(nuevoActor)
    });

    const data = await res.json();

    if (!res.ok) {
      return mostrarMensaje(data.mensaje, "error");
    }

    e.target.reset();
    mostrarMensaje("Actor creado correctamente.");
    listarActores();
  } catch {
    mostrarMensaje("Error al crear actor.", "error");
  }
});

async function asignarActor() {
  const pelicula_id = peliculaSelect.value;
  const actor_id = actorSelect.value;

  if (!pelicula_id || !actor_id) {
    return mostrarMensaje("Debe seleccionar una película y un actor.", "error");
  }

  try {
    const res = await fetch("/asignar-actor", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        pelicula_id: Number(pelicula_id),
        actor_id: Number(actor_id)
      })
    });

    const data = await res.json();

    if (!res.ok) {
      return mostrarMensaje(data.mensaje, "error");
    }

    mostrarMensaje("Actor asignado correctamente.");
    listarPeliculas();
    listarActores();
  } catch {
    mostrarMensaje("Error al asignar actor.", "error");
  }
}

listarPeliculas();
listarActores();