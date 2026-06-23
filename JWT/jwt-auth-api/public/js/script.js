const loginForm =
document.getElementById("loginForm");

if (loginForm) {

  loginForm.addEventListener(
    "submit",
    async e => {

      e.preventDefault();

      const email =
      document.getElementById("email").value;

      const password =
      document.getElementById("password").value;

      const respuesta =
      await fetch("/auth/login", {

        method: "POST",

        headers: {
          "Content-Type":
          "application/json"
        },

        body: JSON.stringify({
          email,
          password
        })

      });

      const data =
      await respuesta.json();

      const mensaje =
      document.getElementById("mensaje");

      if (data.ok) {

        localStorage.setItem(
          "token",
          data.token
        );

        mensaje.innerHTML =
        "✅ Login correcto";

      } else {

        mensaje.innerHTML =
        "❌ " + data.mensaje;

      }

    }
  );

}

const perfil =
document.getElementById("perfil");

if (perfil) {

  const token =
  localStorage.getItem("token");

  fetch("/api/perfil", {

    headers: {
      Authorization:
      `Bearer ${token}`
    }

  })

  .then(r => r.json())

  .then(data => {

    if (!data.ok) {

      perfil.innerHTML = `
      <div class="error">
      401 - Token inválido o expirado
      </div>
      `;

      return;
    }

    perfil.innerHTML = `
      <p><strong>Email:</strong>
      ${data.data.email}</p>

      <p><strong>Rol:</strong>
      ${data.data.role}</p>
    `;

  });

}

const logout =
document.getElementById("logout");

if (logout) {

  logout.addEventListener(
    "click",
    () => {

      localStorage.removeItem(
        "token"
      );

      window.location =
      "/";

    }
  );

}