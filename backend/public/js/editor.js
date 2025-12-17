// ===============================
// 🔐 PROTECCIÓN DEL EDITOR
// ===============================
const token = localStorage.getItem("token");

if (!token) {
  window.location.href = "/login.html";
}

// ===============================
// 📌 ELEMENTOS
// ===============================
const tituloInput = document.getElementById("titulo");
const descripcionInput = document.getElementById("descripcion");
const contenidoInput = document.getElementById("contenido");
const preview = document.getElementById("preview");
const mensaje = document.getElementById("mensaje");
const publicarBtn = document.getElementById("publicarBtn");
const logoutBtn = document.getElementById("logoutBtn");

// ===============================
// 🔓 LOGOUT
// ===============================
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "/";
});

// ===============================
// 👁️ VISTA PREVIA
// ===============================
contenidoInput.addEventListener("input", () => {
  preview.textContent = contenidoInput.value;
});

// ===============================
// ✍️ PUBLICAR CAPÍTULO
// ===============================
publicarBtn.addEventListener("click", async () => {
  const titulo = tituloInput.value.trim();
  const descripcion = descripcionInput.value.trim();
  const contenido = contenidoInput.value.trim();

  if (!titulo || !contenido) {
    mensaje.textContent = "El título y el contenido son obligatorios";
    mensaje.style.color = "red";
    return;
  }

  const nuevoCapitulo = {
    titulo,
    descripcion,
    paginas: [contenido]
  };

  try {
    const response = await fetch("/api/capitulos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(nuevoCapitulo)
    });

    if (!response.ok) {
      throw new Error("Error al publicar");
    }

    mensaje.textContent = "Capítulo publicado correctamente";
    mensaje.style.color = "green";

    tituloInput.value = "";
    descripcionInput.value = "";
    contenidoInput.value = "";
    preview.textContent = "";

  } catch (error) {
    mensaje.textContent = "Error al publicar el capítulo";
    mensaje.style.color = "red";
    console.error(error);
  }
});
