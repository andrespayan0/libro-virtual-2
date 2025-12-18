const params = new URLSearchParams(window.location.search);
const index = params.get("id");

const tituloEl = document.getElementById("tituloCapitulo");
const contenidoEl = document.getElementById("contenidoCapitulo");
const btnDark = document.getElementById("toggleDark");

/* =========================
   DARK MODE (SOLO CLASE)
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
    const capitulo = capitulos[index];

    if (!capitulo || !capitulo.paginas || capitulo.paginas.length === 0) {
      contenidoEl.innerHTML = "<p>Este capítulo aún no tiene contenido.</p>";
      return;
    }

    tituloEl.textContent = capitulo.titulo;
    renderizarContenido(capitulo.paginas.join("\n\n"));
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
    p.innerHTML = txt; // respeta formato del editor
    contenidoEl.appendChild(p);
  });
}
