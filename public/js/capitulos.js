const contenedor = document.getElementById("capitulosLista");

fetch("/api/capitulos")
  .then(res => res.json())
  .then(capitulos => {
    contenedor.innerHTML = "";

    if (!Array.isArray(capitulos) || capitulos.length === 0) {
      contenedor.innerHTML =
        `<p class="sin-capitulos">Aún no hay capítulos publicados.</p>`;
      return;
    }

    // Guardamos el índice REAL
    const ordenados = capitulos
      .map((cap, index) => ({ ...cap, realIndex: index }))
      .sort((a, b) => a.fecha - b.fecha); // viejos primero

    ordenados.forEach(capitulo => {
      const card = document.createElement("article");
      card.className = "capitulo-card";

      card.innerHTML = `
        <h3>${capitulo.titulo}</h3>
        <p>${capitulo.descripcion}</p>
      `;

      card.onclick = () => {
        window.location.href =
          `capitulo.html?id=${capitulo.realIndex}`;
      };

      contenedor.appendChild(card);
    });
  })
  .catch(err => {
    console.error(err);
    contenedor.innerHTML =
      `<p class="sin-capitulos">Error al cargar capítulos.</p>`;
  });
