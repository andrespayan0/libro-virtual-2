const params = new URLSearchParams(window.location.search);
const index = parseInt(params.get("id"), 10);

const tituloEl = document.getElementById("tituloCapitulo");
const contenidoEl = document.getElementById("contenidoCapitulo");
const btnDark = document.getElementById("toggleDark");
const btnPrev = document.getElementById("btnAnterior");
const btnNext = document.getElementById("btnSiguiente");

/* ===== DARK MODE ===== */
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

btnDark.onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode",
    document.body.classList.contains("dark"));
};

/* ===== CARGAR CAPÍTULO ===== */
fetch("/api/capitulos")
  .then(res => res.json())
  .then(capitulos => {
    if (isNaN(index) || !capitulos[index]) {
      contenidoEl.innerHTML = "<p>Capítulo no encontrado.</p>";
      return;
    }

    const capitulo = capitulos[index];

    tituloEl.textContent = capitulo.titulo;
    renderizarContenido(capitulo.paginas.join("\n\n"));

    // BOTÓN ANTERIOR
    if (index > 0) {
      btnPrev.onclick = () => {
        window.location.href = `capitulo.html?id=${index - 1}`;
      };
    } else {
      btnPrev.style.display = "none";
    }

    // BOTÓN SIGUIENTE
    if (index < capitulos.length - 1) {
      btnNext.onclick = () => {
        window.location.href = `capitulo.html?id=${index + 1}`;
      };
    } else {
      btnNext.style.display = "none";
    }
  })
  .catch(err => {
    console.error(err);
    contenidoEl.innerHTML =
      "<p>Error al cargar el capítulo.</p>";
  });

/* ===== RENDER TEXTO ===== */
function renderizarContenido(texto) {
  contenidoEl.innerHTML = "";

  texto
    .split(/\n\s*\n/)
    .filter(p => p.trim() !== "")
    .forEach(parrafo => {
      const p = document.createElement("p");
      p.innerHTML = parrafo;
      contenidoEl.appendChild(p);
    });
}
