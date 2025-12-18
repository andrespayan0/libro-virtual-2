const contenedor = document.getElementById("capitulosLista");

fetch("/api/capitulos")
  .then(res => res.json())
  .then(capitulos => {

    // 🔹 MISMO ORDEN QUE EN capitulo.js
    capitulos.sort((a, b) => a.id - b.id);

    contenedor.innerHTML = "";

    if (capitulos.length === 0) {
      contenedor.innerHTML = `
        <p class="sin-capitulos">
          Aún no hay capítulos publicados.
        </p>
      `;
      return;
    }

    capitulos.forEach((capitulo, index) => {
      const card = document.createElement("article");
      card.classList.add("capitulo-card");

      card.innerHTML = `
        <h3>${capitulo.titulo}</h3>
        <p>${capitulo.descripcion}</p>
      `;

      card.addEventListener("click", () => {
        window.location.href = `capitulo.html?id=${index}`;
      });

      contenedor.appendChild(card);
    });
  })
  .catch(error => {
    console.error("Error cargando capítulos:", error);
    contenedor.innerHTML = `
      <p class="sin-capitulos">Error al cargar los capítulos.</p>
    `;
  });
