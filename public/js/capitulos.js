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

      const leido = localStorage.getItem(`capitulo_leido_${index}`) === "true";

      card.innerHTML = `
    <h3>
      ${capitulo.titulo}
      ${leido ? '<span class="leido">✔ Leído</span>' : ''}
    </h3>
    <p>${capitulo.descripcion}</p>
  `;

      if (leido) {
        card.classList.add("capitulo-leido");
      }

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
