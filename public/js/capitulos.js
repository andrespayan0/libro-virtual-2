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

    // 🔹 ordenamos del más viejo al más nuevo
    const ordenados = [...capitulos].sort(
      (a, b) => a.fecha - b.fecha
    );

    ordenados.forEach((capitulo, indexOrdenado) => {
      const card = document.createElement("article");
      card.className = "capitulo-card";

      card.innerHTML = `
        <h3>${capitulo.titulo}</h3>
        <p>${capitulo.descripcion}</p>
      `;

      // 🔑 usamos el índice DEL ARRAY ORDENADO
      card.onclick = () => {
        window.location.href =
          `capitulo.html?pos=${indexOrdenado}`;
      };

      contenedor.appendChild(card);
    });

    // guardamos el orden en localStorage
    localStorage.setItem(
      "ordenCapitulos",
      JSON.stringify(ordenados)
    );
  })
  .catch(err => {
    console.error(err);
    contenedor.innerHTML =
      `<p class="sin-capitulos">Error al cargar capítulos.</p>`;
  });
