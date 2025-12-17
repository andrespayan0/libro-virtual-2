const params = new URLSearchParams(window.location.search);
const index = params.get("id");

const tituloEl = document.getElementById("tituloCapitulo");
const contenidoEl = document.getElementById("contenidoCapitulo");

fetch("/api/capitulos")
  .then(res => res.json())
  .then(capitulos => {
    const capitulo = capitulos[index];

    if (!capitulo || !capitulo.paginas || capitulo.paginas.length === 0) {
      contenidoEl.innerHTML = "<p>Este capítulo aún no tiene contenido.</p>";
      return;
    }

    tituloEl.textContent = capitulo.titulo;

    const textoCompleto = capitulo.paginas.join("\n\n---\n\n");

    renderizarContenido(textoCompleto);
  })
  .catch(err => {
    contenidoEl.innerHTML = "<p>Error al cargar el capítulo.</p>";
    console.error(err);
  });

function renderizarContenido(texto) {
  contenidoEl.innerHTML = "";

  const bloques = texto.split(/\n*---+\n*/);

  bloques.forEach((bloque, i) => {
    const parrafos = bloque
      .split(/\n+/)
      .map(p => p.trim())
      .filter(p => p !== "");

    parrafos.forEach(parrafo => {
      const p = document.createElement("p");
      p.textContent = parrafo;
      contenidoEl.appendChild(p);
    });

    if (i < bloques.length - 1) {
      const separador = document.createElement("div");
      separador.className = "separador";
      separador.textContent = "✦ ✦ ✦";
      contenidoEl.appendChild(separador);
    }
  });
}

/* ==================================================
   CÓDIGO AGREGADO – EDITOR ENRIQUECIDO
================================================== */

const editorVisual = document.getElementById("editorVisual");
const textareaContenido = document.getElementById("contenido");

document.querySelectorAll(".editor-toolbar button").forEach(btn => {
  btn.addEventListener("click", () => {
    document.execCommand(btn.dataset.cmd);
    sincronizar();
  });
});

document.getElementById("fontColor").addEventListener("input", e => {
  document.execCommand("foreColor", false, e.target.value);
  sincronizar();
});

document.getElementById("fontFamily").addEventListener("change", e => {
  document.execCommand("fontName", false, e.target.value);
  sincronizar();
});

document.getElementById("fontSize").addEventListener("change", e => {
  document.execCommand("fontSize", false, e.target.value);
  sincronizar();
});

function sincronizar() {
  const textoPlano = editorVisual.innerHTML
    .replace(/<div>/gi, "\n")
    .replace(/<\/div>/gi, "")
    .replace(/<br>/gi, "\n")
    .replace(/<[^>]*>/g, "");

  textareaContenido.value = textoPlano;
}

editorVisual.addEventListener("input", sincronizar);
