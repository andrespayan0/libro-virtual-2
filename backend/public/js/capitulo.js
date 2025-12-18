const params = new URLSearchParams(window.location.search);
const index = params.get("id");

const tituloEl = document.getElementById("tituloCapitulo");
const contenidoEl = document.getElementById("contenidoCapitulo");
const btnDark = document.getElementById("toggleDark");
const btnVolver = document.querySelector(".btn-volver");

/* =========================
   DARK MODE
========================= */
function aplicarModo() {
  const dark = document.body.classList.contains("dark");

  // botón modo noche
  btnDark.style.backgroundColor = dark
    ? "rgba(255,255,255,0.08)"
    : "rgba(47,111,78,0.08)";
  btnDark.style.color = dark ? "#eaeaea" : "#2f6f4e";

  // botón volver
  btnVolver.style.backgroundColor = dark
    ? "rgba(255,255,255,0.08)"
    : "rgba(47,111,78,0.08)";
  btnVolver.style.color = dark ? "#eaeaea" : "#2f6f4e";

  // texto capítulo
  document.querySelectorAll(".pagina-capitulo p").forEach(p => {
    p.style.color = dark ? "#f1f1f1" : "";
  });
}

// estado inicial
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}
aplicarModo();

btnDark.onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "darkMode",
    document.body.classList.contains("dark")
  );
  aplicarModo();
};

/* =========================
   CARGAR CAPÍTULO
========================= */
fetch("/api/capitulos")
  .then(res => res.json())
  .then(capitulos => {
    const capitulo = capitulos[index];

    if (!capitulo || !capitulo.paginas || capitulo.paginas.length === 0) {
      contenidoEl.innerHTML = "<p>Este capítulo aún no tiene contenido.</p>";
      aplicarModo();
      return;
    }

    tituloEl.textContent = capitulo.titulo;
    renderizarContenido(capitulo.paginas.join("\n\n"));
    aplicarModo();
  })
  .catch(err => {
    contenidoEl.innerHTML = "<p>Error al cargar el capítulo.</p>";
    console.error(err);
  });

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
    p.innerHTML = txt; // respeta negrita, cursiva, etc.
    contenidoEl.appendChild(p);
  });
}
