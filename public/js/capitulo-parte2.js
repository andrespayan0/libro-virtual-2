/* =========================
   PARÁMETROS Y ELEMENTOS
========================= */
const params = new URLSearchParams(window.location.search);
const id = parseInt(params.get("id"), 10);

const tituloEl = document.getElementById("tituloCapitulo");
const contenidoEl = document.getElementById("contenidoCapitulo");
const btnDark = document.getElementById("toggleDark");

const btnAnterior = document.getElementById("btnAnterior");
const btnSiguiente = document.getElementById("btnSiguiente");
const navCapitulo = document.querySelector(".nav-capitulo");

const btnGuardar = document.getElementById("guardarProgreso");
const pagina = document.querySelector(".pagina-capitulo");

/* =========================
   UTILIDADES
========================= */
function esMovilOTablet() {
  return window.innerWidth <= 1024;
}

/* =========================
   DARK MODE
========================= */
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

btnDark.onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem("darkMode", document.body.classList.contains("dark"));
};

/* =========================
   CARGAR CAPÍTULO (PARTE 2)
========================= */
fetch("/api/capitulos_parte2")
  .then(res => res.json())
  .then(capitulos => {

    capitulos.sort((a, b) => a.id - b.id);

    const capitulo = capitulos.find(c => c.id === id);
    const posicion = capitulos.findIndex(c => c.id === id);

    if (!capitulo) {
      contenidoEl.innerHTML = "<p>Capítulo no encontrado.</p>";
      return;
    }

    tituloEl.textContent = capitulo.titulo;
    renderizarContenido(capitulo.contenido);

    restaurarProgreso();
    configurarNavegacion(capitulos, posicion);
  })
  .catch(err => {
    contenidoEl.innerHTML = "<p>Error al cargar el capítulo.</p>";
    console.error(err);
  });

/* =========================
   GUARDAR / RESTAURAR PROGRESO
========================= */
btnGuardar.onclick = () => {
  localStorage.setItem(
    `progreso_capitulo_parte2_${id}`,
    window.scrollY
  );
};

function restaurarProgreso() {
  const progreso = localStorage.getItem(
    `progreso_capitulo_parte2_${id}`
  );
  if (!progreso) return;

  let intentos = 0;
  const maxIntentos = 20;

  const intentar = () => {
    window.scrollTo(0, parseInt(progreso, 10));

    if (
      Math.abs(window.scrollY - progreso) < 5 ||
      intentos >= maxIntentos
    ) return;

    intentos++;
    requestAnimationFrame(intentar);
  };

  requestAnimationFrame(intentar);
}

/* =========================
   NAVEGACIÓN
========================= */
function configurarNavegacion(capitulos, posicion) {

  if (posicion > 0) {
    btnAnterior.href = `capitulo2.html?id=${capitulos[posicion - 1].id}`;
  } else {
    btnAnterior.style.display = "none";
  }

  if (posicion < capitulos.length - 1) {
    btnSiguiente.href = `capitulo2.html?id=${capitulos[posicion + 1].id}`;
  } else {
    btnSiguiente.style.display = "none";
  }

  if (
    btnAnterior.style.display === "none" ||
    btnSiguiente.style.display === "none"
  ) {
    navCapitulo.classList.add("solo-anterior");
  }
}

/* =========================
   RENDER TEXTO
========================= */
function renderizarContenido(texto) {
  contenidoEl.innerHTML = "";

  texto
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(Boolean)
    .forEach(txt => {
      const p = document.createElement("p");
      p.innerHTML = txt;
      contenidoEl.appendChild(p);
    });
}

/* =========================
   BLOQUEO DE COPIADO
========================= */
document.addEventListener("contextmenu", e => e.preventDefault());
["copy", "cut", "paste"].forEach(e =>
  document.addEventListener(e, ev => ev.preventDefault())
);
document.addEventListener("keydown", e => {
  if (e.ctrlKey && ["c", "a", "s", "u", "x"].includes(e.key.toLowerCase())) {
    e.preventDefault();
  }
});
document.addEventListener("selectstart", e => e.preventDefault());

/* =========================
   MARCAR COMO LEÍDO
========================= */
function marcarComoLeido(id) {
  localStorage.setItem(`capitulo2_leido_${id}`, "true");
}

window.addEventListener("scroll", () => {
  const scrollActual = window.scrollY + window.innerHeight;
  const alturaTotal = document.documentElement.scrollHeight;

  if (scrollActual >= alturaTotal - 10) {
    marcarComoLeido(id);
  }
});

/* =========================
   PREFERENCIAS DE LECTURA
========================= */
const esMovil = esMovilOTablet();

let fontSize = parseFloat(localStorage.getItem("fontSize"))
  || (esMovil ? 1.1 : 1.05);

let maxWidth = parseInt(localStorage.getItem("maxWidth"))
  || (esMovil ? window.innerWidth - 32 : 1100);

let lineHeight = parseFloat(localStorage.getItem("lineHeight"))
  || (esMovil ? 1.8 : 2);

function aplicarPreferencias() {
  const esMovil = esMovilOTablet();

  const anchoFinal = esMovil
    ? Math.min(maxWidth, window.innerWidth - 32)
    : maxWidth;

  pagina.style.maxWidth = anchoFinal + "px";

  pagina.querySelectorAll("p").forEach(el => {
    el.style.fontSize = fontSize + "rem";
    el.style.lineHeight = lineHeight;
  });
}

aplicarPreferencias();
window.addEventListener("resize", aplicarPreferencias);

/* =========================
   BOTÓN GUARDAR FLOTANTE
========================= */
let ultimoScroll = 0;

window.addEventListener("scroll", () => {
  const actual = window.scrollY;

  if (actual > ultimoScroll) {
    btnGuardar.classList.add("oculto");
  } else {
    btnGuardar.classList.remove("oculto");
  }

  ultimoScroll = actual;
});
