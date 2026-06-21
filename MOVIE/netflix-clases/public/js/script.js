let listaActual = [];
let tipoActual = "";

async function listarPeliculas() {
  tipoActual = "peliculas";

  const respuesta = await fetch("/api/catalogo?tipo=peliculas");
  listaActual = await respuesta.json();

  mostrarLista();
}

async function listarSeries() {
  tipoActual = "series";

  const respuesta = await fetch("/api/catalogo?tipo=series");
  listaActual = await respuesta.json();

  mostrarLista();
}

function mostrarLista() {
  const resultado = document.getElementById("resultado");
  resultado.innerHTML = "";

  listaActual.forEach(item => {
    const card = document.createElement("article");
    card.classList.add("card");

    if (tipoActual === "peliculas") {
      card.innerHTML = `
        <h3>${item.nombre}</h3>
        <p><strong>Director:</strong> ${item.director}</p>
        <p><strong>Año:</strong> ${item.anio}</p>
        <button onclick="eliminarItem('${item.nombre}')">Eliminar</button>
      `;
    } else {
      card.innerHTML = `
        <h3>${item.nombre}</h3>
        <p><strong>Año:</strong> ${item.anio}</p>
        <p><strong>Temporadas:</strong> ${item.temporadas}</p>
        <button onclick="eliminarItem('${item.nombre}')">Eliminar</button>
      `;
    }

    resultado.appendChild(card);
  });
}

function ordenarLista() {
  const criterio = document.getElementById("orden").value;

  listaActual.sort((a, b) => {
    if (a[criterio] === undefined || b[criterio] === undefined) {
      return 0;
    }

    if (typeof a[criterio] === "string") {
      return a[criterio].localeCompare(b[criterio]);
    }

    return a[criterio] - b[criterio];
  });

  mostrarLista();
}

document.getElementById("formPelicula").addEventListener("submit", async e => {
  e.preventDefault();

  const nuevaPelicula = {
    nombre: document.getElementById("peliculaNombre").value,
    director: document.getElementById("peliculaDirector").value,
    anio: Number(document.getElementById("peliculaAnio").value)
  };

  await fetch("/api/catalogo?tipo=peliculas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(nuevaPelicula)
  });

  e.target.reset();
  listarPeliculas();
});

document.getElementById("formSerie").addEventListener("submit", async e => {
  e.preventDefault();

  const nuevaSerie = {
    nombre: document.getElementById("serieNombre").value,
    anio: Number(document.getElementById("serieAnio").value),
    temporadas: Number(document.getElementById("serieTemporadas").value)
  };

  await fetch("/api/catalogo?tipo=series", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(nuevaSerie)
  });

  e.target.reset();
  listarSeries();
});

async function eliminarItem(nombre) {
  await fetch(`/api/catalogo?tipo=${tipoActual}&nombre=${encodeURIComponent(nombre)}`, {
    method: "DELETE"
  });

  if (tipoActual === "peliculas") {
    listarPeliculas();
  } else {
    listarSeries();
  }
}