const formUpload = document.getElementById("formUpload");
const inputFoto = document.getElementById("inputFoto");
const feedback = document.getElementById("feedback");
const previewImg = document.getElementById("previewImg");
const previewText = document.getElementById("previewText");
const galeria = document.getElementById("galeria");

function mostrarMensaje(texto, tipo = "ok") {
  if (!feedback) return;

  feedback.textContent = texto;
  feedback.className = `message ${tipo}`;
}

function formatearTamano(bytes) {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

if (inputFoto) {
  inputFoto.addEventListener("change", () => {
    const archivo = inputFoto.files[0];

    if (!archivo) return;

    const url = URL.createObjectURL(archivo);

    previewImg.src = url;
    previewImg.style.display = "block";
    previewText.style.display = "none";
  });
}

if (formUpload) {
  formUpload.addEventListener("submit", async e => {
    e.preventDefault();

    const data = new FormData(formUpload);

    try {
      const res = await fetch("/upload", {
        method: "POST",
        body: data
      });

      const json = await res.json();

      if (!res.ok) {
        return mostrarMensaje(json.mensaje || "Error al subir imagen", "error");
      }

      mostrarMensaje(`✓ Imagen subida: ${json.archivo}`, "ok");
      formUpload.reset();

      setTimeout(() => {
        window.location.href = "/galeria.html";
      }, 900);

    } catch {
      mostrarMensaje("Error de red al subir la imagen.", "error");
    }
  });
}

async function cargarGaleria() {
  if (!galeria) return;

  try {
    const res = await fetch("/galeria");
    const json = await res.json();

    if (!res.ok) {
      return mostrarMensaje(json.mensaje || "Error al cargar galería", "error");
    }

    galeria.innerHTML = "";

    if (json.data.length === 0) {
      galeria.innerHTML = `<p>No hay imágenes subidas todavía.</p>`;
      return;
    }

    json.data.forEach(img => {
      const card = document.createElement("article");
      card.classList.add("image-card");

      card.innerHTML = `
        <img src="${img.ruta}" alt="${img.nombre}">
        <h3>${img.nombre}</h3>
        <p>${formatearTamano(img.size)}</p>
      `;

      galeria.appendChild(card);
    });

  } catch {
    mostrarMensaje("No se pudo cargar la galería.", "error");
  }
}

cargarGaleria();