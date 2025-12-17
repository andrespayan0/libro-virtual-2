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
