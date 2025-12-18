const loginBtn = document.getElementById("loginBtn");
const mensaje = document.getElementById("mensaje");

loginBtn.addEventListener("click", async () => {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    if (!res.ok) {
      throw new Error("Credenciales incorrectas");
    }

    const data = await res.json();
    localStorage.setItem("token", data.token);

    // 👉 RUTA ABSOLUTA
    window.location.href = "/editor.html";

  } catch (err) {
    mensaje.textContent = "Usuario o contraseña incorrectos";
    mensaje.style.color = "red";
  }
});
