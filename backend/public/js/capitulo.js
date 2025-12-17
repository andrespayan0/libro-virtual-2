const params = new URLSearchParams(window.location.search);
const index = params.get("id");

const tituloEl = document.getElementById("tituloCapitulo");
const contenidoEl = document.getElementById("contenidoCapitulo");
const btnModo = document.getElementById("modoLectura");

// ====== CARGAR CAPÍTULO ======
fetch("/api/capitulos")
  .then(res => res.json())
  .then(capitulos => {
    const capitulo = capitulos[index];

    if (!capitulo || !capitulo.paginas || capitulo.paginas.length === 0) {
      tituloEl.textContent = "Capítulo";
      contenidoEl.innerHTML = "<p>Este capítulo aún no tiene contenido.</p>";
      return;
    }

    tituloEl.textContent = capitulo.titulo;

    // CLAVE: respetar HTML del editor
    contenidoEl.innerHTML = capitulo.paginas.join("");
  })
  .catch(err => {
    contenidoEl.innerHTML = "<p>Error al cargar el capítulo.</p>";
    console.error(err);
  });

// ====== MODO OSCURO (LECTORES) ======
if (btnModo) {
  if (localStorage.getItem("modoLectura") === "dark") {
    document.body.classList.add("dark");
  }

  btnModo.onclick = () => {
    document.body.classList.toggle("dark");

    localStorage.setItem(
      "modoLectura",
      document.body.classList.contains("dark") ? "dark" : "light"
    );
  };
}
