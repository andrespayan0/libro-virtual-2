const params = new URLSearchParams(window.location.search);
const pos = parseInt(params.get("pos"), 10);

const tituloEl = document.getElementById("tituloCapitulo");
const contenidoEl = document.getElementById("contenidoCapitulo");
const btnPrev = document.getElementById("btnAnterior");
const btnNext = document.getElementById("btnSiguiente");

// cargamos el orden guardado
const capitulos = JSON.parse(
  localStorage.getItem("ordenCapitulos") || "[]"
);

if (!capitulos[pos]) {
  contenidoEl.innerHTML = "<p>Capítulo no encontrado.</p>";
} else {
  const capitulo = capitulos[pos];
  tituloEl.textContent = capitulo.titulo;
  renderizarContenido(capitulo.paginas.join("\n\n"));

  // anterior
  if (pos > 0) {
    btnPrev.onclick = () => {
      location.href = `capitulo.html?pos=${pos - 1}`;
    };
  } else {
    btnPrev.style.display = "none";
  }

  // siguiente
  if (pos < capitulos.length - 1) {
    btnNext.onclick = () => {
      location.href = `capitulo.html?pos=${pos + 1}`;
    };
  } else {
    btnNext.style.display = "none";
  }
}

function renderizarContenido(texto) {
  contenidoEl.innerHTML = "";
  texto
    .split(/\n\s*\n/)
    .filter(p => p.trim())
    .forEach(pTxt => {
      const p = document.createElement("p");
      p.innerHTML = pTxt;
      contenidoEl.appendChild(p);
    });
}
