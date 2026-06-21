const resultado = document.getElementById("resultado");

async function listarClientes() {
  const res = await fetch("/api/clientes");
  const clientes = await res.json();
  mostrarClientes(clientes);
}

async function listarClientesCuentaRut() {
  const res = await fetch("/api/clientes/cuenta-rut");
  const clientes = await res.json();
  mostrarClientes(clientes);
}

function mostrarClientes(clientes) {
  resultado.innerHTML = "";

  clientes.forEach(cliente => {
    const card = document.createElement("article");
    card.classList.add("card");

    const cuentaRut = cliente.cuentaRut
      ? `<p><strong>Cuenta RUT:</strong> ${cliente.cuentaRut.numero} | Saldo: $${cliente.cuentaRut.saldo}</p>
         <button onclick="eliminarCuentaRut('${cliente.rut}')">Eliminar Cuenta RUT</button>`
      : `<p><strong>Cuenta RUT:</strong> No tiene</p>`;

    const cuentasAhorro = cliente.cuentasAhorro.length > 0
      ? cliente.cuentasAhorro.map(cuenta => `
          <li>
            ${cuenta.numero} | Saldo: $${cuenta.saldo}
            <button onclick="eliminarCuentaAhorro('${cliente.rut}', '${cuenta.numero}')">Eliminar</button>
          </li>
        `).join("")
      : "<li>No tiene cuentas de ahorro</li>";

    card.innerHTML = `
      <h3>${cliente.nombre}</h3>
      <p><strong>RUT:</strong> ${cliente.rut}</p>

      ${cuentaRut}

      <p><strong>Cuentas de AHORRO:</strong></p>
      <ul>${cuentasAhorro}</ul>

      <button class="danger" onclick="eliminarCliente('${cliente.rut}')">
        Eliminar cliente
      </button>
    `;

    resultado.appendChild(card);
  });
}

document.getElementById("formNuevoCliente").addEventListener("submit", async e => {
  e.preventDefault();

  const nuevoCliente = {
    nombre: document.getElementById("nombre").value,
    rut: document.getElementById("rut").value,
    tipoCuenta: document.getElementById("tipoCuenta").value,
    numeroCuenta: document.getElementById("numeroCuenta").value,
    saldo: Number(document.getElementById("saldo").value)
  };

  await fetch("/api/clientes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(nuevoCliente)
  });

  e.target.reset();
  listarClientes();
});

document.getElementById("formCuentaRut").addEventListener("submit", async e => {
  e.preventDefault();

  const cuentaRut = {
    rut: document.getElementById("rutCuentaRut").value,
    numeroCuenta: document.getElementById("numeroCuentaRut").value,
    saldo: Number(document.getElementById("saldoCuentaRut").value)
  };

  await fetch("/api/clientes/cuenta-rut", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuentaRut)
  });

  e.target.reset();
  listarClientes();
});

document.getElementById("formCuentaAhorro").addEventListener("submit", async e => {
  e.preventDefault();

  const cuentaAhorro = {
    rut: document.getElementById("rutCuentaAhorro").value,
    numeroCuenta: document.getElementById("numeroCuentaAhorro").value,
    saldo: Number(document.getElementById("saldoCuentaAhorro").value)
  };

  await fetch("/api/clientes/cuenta-ahorro", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cuentaAhorro)
  });

  e.target.reset();
  listarClientes();
});

async function eliminarCliente(rut) {
  await fetch(`/api/clientes?rut=${encodeURIComponent(rut)}`, {
    method: "DELETE"
  });

  listarClientes();
}

async function eliminarCuentaRut(rut) {
  await fetch(`/api/clientes/cuenta-rut?rut=${encodeURIComponent(rut)}`, {
    method: "DELETE"
  });

  listarClientes();
}

async function eliminarCuentaAhorro(rut, numero) {
  await fetch(`/api/clientes/cuenta-ahorro?rut=${encodeURIComponent(rut)}&numero=${encodeURIComponent(numero)}`, {
    method: "DELETE"
  });

  listarClientes();
}

listarClientes();