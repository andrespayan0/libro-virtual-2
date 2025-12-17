const params = new URLSearchParams(window.location.search);
const index = params.get("id");

const tituloEl = document.getElementById("tituloCapitulo");
const contenidoEl = document.getElementById("contenidoCapitulo");
const toggleDark = document.getElementById("toggleDark");

// ====== DARK MODE ======
const btnDark = document.getElementById("toggleDark");

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


// ====== CARGAR CAPÍTULO ======
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

// ====== RENDER ======
function renderizarContenido(texto) {
  contenidoEl.innerHTML = "";

  // separa por doble salto de línea
  const parrafos = texto
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p !== "");

  parrafos.forEach(pTexto => {
    const p = document.createElement("p");
    p.innerHTML = pTexto; // mantiene negrita, cursiva, etc.

    // fuerza color blanco en dark
    if (document.body.classList.contains("dark")) {
      p.style.color = "#f1f1f1";
    }

    contenidoEl.appendChild(p);
  });
}
