const params = new URLSearchParams(window.location.search);
const index = parseInt(params.get("id"), 10);

const tituloEl = document.getElementById("tituloCapitulo");
const contenidoEl = document.getElementById("contenidoCapitulo");

const API_BASE = "/api/capitulos2";
const STORAGE_PREF = "parte2";

fetch(API_BASE)
  .then(res => res.json())
  .then(capitulos => {

    capitulos.sort((a, b) => a.id - b.id);
    const capitulo = capitulos[index];

    if (!capitulo) {
      contenidoEl.innerHTML = "<p>Capítulo no encontrado.</p>";
      return;
    }

    tituloEl.textContent = capitulo.titulo;
    renderizarContenido(capitulo.paginas.join("\n\n"));
    restaurarProgreso();
    configurarNavegacion(capitulos.length);
  });

function renderizarContenido(texto) {
  contenidoEl.innerHTML = "";
  texto
    .split(/\n\s*\n/)
    .filter(Boolean)
    .forEach(t => {
      const p = document.createElement("p");
      p.innerHTML = t;
      contenidoEl.appendChild(p);
    });
}

function restaurarProgreso() {
  const progreso = localStorage.getItem(`progreso_${STORAGE_PREF}_${index}`);
  if (progreso) window.scrollTo(0, progreso);
}

window.addEventListener("scroll", () => {
  localStorage.setItem(
    `progreso_${STORAGE_PREF}_${index}`,
    window.scrollY
  );
});
