const API = "http://localhost:3000";

async function pedirDatos(url) {
  const respuesta = await fetch(url);
  const datos = await respuesta.json();
  mostrarDatos(datos);
}

function mostrarDatos(datos) {
  const resultado = document.getElementById("resultado");
  resultado.innerHTML = "";

  if (!Array.isArray(datos)) {
    datos = [datos];
  }

  datos.forEach(item => {
    let div = document.createElement("div");
    div.className = "card";

    for (let clave in item) {
      div.innerHTML += `<p><strong>${clave}:</strong> ${item[clave]}</p>`;
    }

    resultado.appendChild(div);
  });
}

function verConductores() {
  pedirDatos(`${API}/conductores`);
}

function verAutomoviles() {
  pedirDatos(`${API}/automoviles`);
}

function verConductoresSinAuto() {
  let edad = prompt("Ingrese edad:");
  pedirDatos(`${API}/conductoressinauto?edad=${edad}`);
}

function verSolitos() {
  pedirDatos(`${API}/solitos`);
}

function buscarPorPatente() {
  let patente = prompt("Ingrese patente:");
  pedirDatos(`${API}/auto?patente=${patente}`);
}

function buscarPorInicio() {
  let letra = prompt("Ingrese letra inicial:");
  pedirDatos(`${API}/auto?iniciopatente=${letra}`);
}