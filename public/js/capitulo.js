const params = new URLSearchParams(window.location.search);
const index = parseInt(params.get("id"), 10);

const tituloEl = document.getElementById("tituloCapitulo");
const contenidoEl = document.getElementById("contenidoCapitulo");
const btnDark = document.getElementById("toggleDark");

const btnAnterior = document.getElementById("btnAnterior");
const btnSiguiente = document.getElementById("btnSiguiente");
const navCapitulo = document.querySelector(".nav-capitulo");

/* =========================
   DARK MODE
========================= */
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

btnDark.onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "darkMode",
    document.body.classList.contains("dark")
  );
};

/* =========================
   CARGAR CAPÍTULO
========================= */
fetch("/api/capitulos")
  .then(res => res.json())
  .then(capitulos => {

    // 🔹 ORDEN REAL: DEL MÁS VIEJO AL MÁS NUEVO
    capitulos.sort((a, b) => a.id - b.id);

    const capitulo = capitulos[index];

    if (!capitulo) {
      contenidoEl.innerHTML = "<p>Capítulo no encontrado.</p>";
      return;
    }

    tituloEl.textContent = capitulo.titulo;
    renderizarContenido(capitulo.paginas.join("\n\n"));

    configurarNavegacion(capitulos.length);
  })
  .catch(err => {
    contenidoEl.innerHTML = "<p>Error al cargar el capítulo.</p>";
    console.error(err);
  });

/* =========================
   NAVEGACIÓN
========================= */
function configurarNavegacion(total) {

  if (index > 0) {
    btnAnterior.href = `capitulo.html?id=${index - 1}`;
  } else {
    btnAnterior.style.display = "none";
  }

  if (index < total - 1) {
    btnSiguiente.href = `capitulo.html?id=${index + 1}`;
  } else {
    btnSiguiente.style.display = "none";
  }

  if (
    btnAnterior.style.display === "none" ||
    btnSiguiente.style.display === "none"
  ) {
    navCapitulo.classList.add("solo-anterior");
  }
}

/* =========================
   RENDER TEXTO
========================= */
function renderizarContenido(texto) {
  contenidoEl.innerHTML = "";

  const parrafos = texto
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p !== "");

  parrafos.forEach(txt => {
    const p = document.createElement("p");
    p.innerHTML = txt;
    contenidoEl.appendChild(p);
  });
}

/* =========================
   BLOQUEO DE COPIADO
========================= */
document.addEventListener("contextmenu", e => e.preventDefault());
["copy", "cut", "paste"].forEach(e =>
  document.addEventListener(e, ev => ev.preventDefault())
);
document.addEventListener("keydown", e => {
  if (e.ctrlKey && ["c", "a", "s", "u", "x"].includes(e.key.toLowerCase())) {
    e.preventDefault();
  }
});
document.addEventListener("selectstart", e => e.preventDefault());
