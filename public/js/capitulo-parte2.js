/* =========================
   PARÁMETROS Y ELEMENTOS
========================= */
const params = new URLSearchParams(window.location.search);
const index = parseInt(params.get("id"), 10);

const tituloEl = document.getElementById("tituloCapitulo");
const contenidoEl = document.getElementById("contenidoCapitulo");
const btnDark = document.getElementById("toggleDark");

const btnAnterior = document.getElementById("btnAnterior");
const btnSiguiente = document.getElementById("btnSiguiente");
const navCapitulo = document.querySelector(".nav-capitulo");

const btnGuardar = document.getElementById("guardarProgreso");
const pagina = document.querySelector(".pagina-capitulo");

/* controles extra */
const fontMas = document.getElementById("fontMas");
const fontMenos = document.getElementById("fontMenos");
const anchoMas = document.getElementById("anchoMas");
const anchoMenos = document.getElementById("anchoMenos");
const lineMas = document.getElementById("lineMas");
const lineMenos = document.getElementById("lineMenos");

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
fetch("/api/capitulos2")
  .then(res => {
    if (!res.ok) throw new Error("Respuesta no válida");
    return res.json();
  })
  .then(capitulos => {
    capitulos.sort((a, b) => a.id - b.id);

    const capitulo = capitulos[index];
    if (!capitulo) {
      contenidoEl.innerHTML = "<p>Capítulo no encontrado.</p>";
      return;
    }

    tituloEl.textContent = capitulo.titulo;
    renderizarContenido(
      Array.isArray(capitulo.paginas)
        ? capitulo.paginas.join("\n\n")
        : ""
    );

    restaurarProgreso();
    configurarNavegacion(capitulos.length);
  })
  .catch(err => {
    console.error(err);
    contenidoEl.innerHTML = "<p>Error al cargar el capítulo.</p>";
  });

/* =========================
   GUARDAR / RESTAURAR PROGRESO
========================= */
btnGuardar.onclick = () => {
  localStorage.setItem(
    `progreso_capitulo2_${index}`,
    window.scrollY
  );
};

function restaurarProgreso() {
  const progreso = localStorage.getItem(`progreso_capitulo2_${index}`);
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
function configurarNavegacion(total) {
  if (index > 0) {
    btnAnterior.href = `capitulo2.html?id=${index - 1}`;
  } else {
    btnAnterior.style.display = "none";
  }

  if (index < total - 1) {
    btnSiguiente.href = `capitulo2.html?id=${index + 1}`;
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
   MARCAR COMO LEÍDO
========================= */
function marcarComoLeido(id) {
  localStorage.setItem(`capitulo2_leido_${id}`, "true");
}

window.addEventListener("scroll", () => {
  const scrollActual = window.scrollY + window.innerHeight;
  const alturaTotal = document.documentElement.scrollHeight;

  if (scrollActual >= alturaTotal - 10) {
    marcarComoLeido(index);
  }
});

/* =========================
   PREFERENCIAS DE LECTURA
========================= */
let fontSize = parseFloat(localStorage.getItem("fontSize")) || 1.05;
let maxWidth = parseInt(localStorage.getItem("maxWidth")) || 1100;
let lineHeight = parseFloat(localStorage.getItem("lineHeight")) || 2;

function aplicarPreferencias() {
  const esMovil = esMovilOTablet();

  const anchoFinal = esMovil
    ? Math.min(maxWidth, window.innerWidth - 32)
    : maxWidth;

  pagina.style.maxWidth = anchoFinal + "px";

  pagina.querySelectorAll("p").forEach(p => {
    p.style.fontSize = fontSize + "rem";
    p.style.lineHeight = lineHeight;
  });
}

aplicarPreferencias();
window.addEventListener("resize", aplicarPreferencias);

/* =========================
   CONTROLES
========================= */
fontMas.onclick = () => {
  fontSize = Math.min(fontSize + 0.05, 1.6);
  localStorage.setItem("fontSize", fontSize);
  aplicarPreferencias();
};

fontMenos.onclick = () => {
  fontSize = Math.max(fontSize - 0.05, 0.85);
  localStorage.setItem("fontSize", fontSize);
  aplicarPreferencias();
};

anchoMas.onclick = () => {
  maxWidth += 50;
  localStorage.setItem("maxWidth", maxWidth);
  aplicarPreferencias();
};

anchoMenos.onclick = () => {
  maxWidth = Math.max(maxWidth - 50, 320);
  localStorage.setItem("maxWidth", maxWidth);
  aplicarPreferencias();
};

lineMas.onclick = () => {
  lineHeight = Math.min(lineHeight + 0.1, 2.5);
  localStorage.setItem("lineHeight", lineHeight);
  aplicarPreferencias();
};

lineMenos.onclick = () => {
  lineHeight = Math.max(lineHeight - 0.1, 1.2);
  localStorage.setItem("lineHeight", lineHeight);
  aplicarPreferencias();
};

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
