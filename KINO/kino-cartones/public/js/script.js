const resultado = document.getElementById("resultado");

async function listarCartones() {
  const res = await fetch("/api/cartones");
  const cartones = await res.json();

  mostrarCartones(cartones);
}

async function crearNuevoCarton() {
  const res = await fetch("/api/cartones", {
    method: "POST"
  });

  const data = await res.json();

  mostrarCartones([data.carton]);
}

function mostrarCartones(cartones) {
  resultado.innerHTML = "";

  cartones.forEach(carton => {
    const article = document.createElement("article");
    article.classList.add("carton");

    const numerosHTML = carton.numeros
      .map(numero => `<span>${numero}</span>`)
      .join("");

    article.innerHTML = `
      <h2>Número de serie: ${carton.serie}</h2>
      <div class="numeros">
        ${numerosHTML}
      </div>
    `;

    resultado.appendChild(article);
  });
}

if (window.location.pathname.includes("listado.html")) {
  listarCartones();
}