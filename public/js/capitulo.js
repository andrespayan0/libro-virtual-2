const params = new URLSearchParams(window.location.search);
const index = parseInt(params.get("id"), 10);

const tituloEl = document.getElementById("tituloCapitulo");
const contenidoEl = document.getElementById("contenidoCapitulo");
const btnDark = document.getElementById("toggleDark");

const btnAnterior = document.getElementById("btnAnterior");
const btnSiguiente = document.getElementById("btnSiguiente");
const navCapitulo = document.querySelector(".nav-capitulo");

/* =========================
   DARK MODE
========================= */
if (localStorage.getItem("darkMode") === "true") {
  document.body.classList.add("dark");
}

btnDark.onclick = () => {
  document.body.classList.toggle("dark");
  localStorage.setItem(
    "darkMode",
    document.body.classList.contains("dark")
  );
};

/* =========================
   CARGAR CAPÍTULO
========================= */
fetch("/api/capitulos")
  .then(res => res.json())
  .then(capitulos => {

    // 🔹 ORDEN REAL: DEL MÁS VIEJO AL MÁS NUEVO
    capitulos.sort((a, b) => a.id - b.id);

    const capitulo = capitulos[index];

    if (!capitulo) {
      contenidoEl.innerHTML = "<p>Capítulo no encontrado.</p>";
      return;
    }

    tituloEl.textContent = capitulo.titulo;
    renderizarContenido(capitulo.paginas.join("\n\n"));

    restaurarProgreso();

    configurarNavegacion(capitulos.length);
  })
  .catch(err => {
    contenidoEl.innerHTML = "<p>Error al cargar el capítulo.</p>";
    console.error(err);
  });

const btnGuardar = document.getElementById("guardarProgreso");

// Guardar scroll actual
btnGuardar.onclick = () => {
  localStorage.setItem(
    `progreso_capitulo_${index}`,
    window.scrollY
  );
};


function restaurarProgreso() {
  const progreso = localStorage.getItem(`progreso_capitulo_${index}`);
  if (!progreso) return;

  let intentos = 0;
  const maxIntentos = 20;

  const intentarScroll = () => {
    window.scrollTo(0, parseInt(progreso, 10));

    // Si ya llegó o se agotaron intentos, paramos
    if (
      Math.abs(window.scrollY - progreso) < 5 ||
      intentos >= maxIntentos
    ) {
      return;
    }

    intentos++;
    requestAnimationFrame(intentarScroll);
  };

  requestAnimationFrame(intentarScroll);
}




/* =========================
   NAVEGACIÓN
========================= */
function configurarNavegacion(total) {

  if (index > 0) {
    btnAnterior.href = `capitulo.html?id=${index - 1}`;
  } else {
    btnAnterior.style.display = "none";
  }

  if (index < total - 1) {
    btnSiguiente.href = `capitulo.html?id=${index + 1}`;
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

  const parrafos = texto
    .split(/\n\s*\n/)
    .map(p => p.trim())
    .filter(p => p !== "");

  parrafos.forEach(txt => {
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
function marcarComoLeido(capituloId) {
  localStorage.setItem(`capitulo_leido_${capituloId}`, "true");
}

// Detectar cuando llega al final
window.addEventListener("scroll", () => {
  const scrollActual = window.scrollY + window.innerHeight;
  const alturaTotal = document.documentElement.scrollHeight;

  if (scrollActual >= alturaTotal - 10) {
    marcarComoLeido(index);
  }
});

const pagina = document.querySelector(".pagina-capitulo");

let fontSize = parseFloat(localStorage.getItem("fontSize")) || 1.05;
let maxWidth = parseInt(localStorage.getItem("maxWidth")) || 1100;
let lineHeight = parseFloat(localStorage.getItem("lineHeight")) || 2;

function aplicarPreferencias() {
  pagina.style.maxWidth = maxWidth + "px";
  pagina.style.lineHeight = lineHeight;
  pagina.querySelectorAll("p").forEach(p => {
    p.style.fontSize = fontSize + "rem";
  });
}

aplicarPreferencias();

// Tamaño letra
fontMas.onclick = () => {
  fontSize += 0.05;
  localStorage.setItem("fontSize", fontSize);
  aplicarPreferencias();
};

fontMenos.onclick = () => {
  fontSize -= 0.05;
  localStorage.setItem("fontSize", fontSize);
  aplicarPreferencias();
};

// Ancho
anchoMas.onclick = () => {
  maxWidth += 50;
  localStorage.setItem("maxWidth", maxWidth);
  aplicarPreferencias();
};

anchoMenos.onclick = () => {
  maxWidth -= 50;
  localStorage.setItem("maxWidth", maxWidth);
  aplicarPreferencias();
};

// Interlineado
lineMas.onclick = () => {
  lineHeight += 0.1;
  localStorage.setItem("lineHeight", lineHeight);
  aplicarPreferencias();
};

lineMenos.onclick = () => {
  lineHeight -= 0.1;
  localStorage.setItem("lineHeight", lineHeight);
  aplicarPreferencias();
};

let ultimoScroll = 0;

window.addEventListener("scroll", () => {
  const actual = window.scrollY;

  if (actual > ultimoScroll) {
    // bajando
    btnGuardar.classList.add("oculto");
  } else {
    // subiendo
    btnGuardar.classList.remove("oculto");
  }

  ultimoScroll = actual;
});
