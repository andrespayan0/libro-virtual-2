const contenedor = document.getElementById("capitulosLista");

fetch("/api/capitulos2")
  .then(res => res.json())
  .then(capitulos => {

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

      const leido = localStorage.getItem(`capitulo2_leido_${index}`) === "true";
      const esNuevo = index === capitulos.length - 1;

      card.innerHTML = `
        <h3>
          ${capitulo.titulo}
          ${esNuevo ? '<span class="badge-nuevo">Nuevo</span>' : ''}
          ${leido ? '<span class="leido">✔ Leído</span>' : ''}
        </h3>
        <p>${capitulo.descripcion || ""}</p>
      `;

      if (leido) card.classList.add("capitulo-leido");

      card.addEventListener("click", () => {
        // 👇 AQUÍ ESTABA EL ERROR
        window.location.href = `capitulo2.html?id=${index}`;
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
