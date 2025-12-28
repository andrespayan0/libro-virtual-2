const contenedor = document.getElementById("capitulosLista");

const API_BASE = "/api/capitulos2";
const STORAGE_PREF = "parte2";

fetch(API_BASE)
  .then(res => res.json())
  .then(capitulos => {

    capitulos.sort((a, b) => a.id - b.id);
    contenedor.innerHTML = "";

    capitulos.forEach((capitulo, index) => {
      const card = document.createElement("article");
      card.classList.add("capitulo-card");

      const leido = localStorage.getItem(
        `capitulo_leido_${STORAGE_PREF}_${index}`
      ) === "true";

      card.innerHTML = `
        <h3>${capitulo.titulo}</h3>
        <p>${capitulo.descripcion}</p>
      `;

      if (leido) card.classList.add("capitulo-leido");

      card.onclick = () => {
        window.location.href = `capitulo-parte2.html?id=${index}`;
      };

      contenedor.appendChild(card);
    });
  });
