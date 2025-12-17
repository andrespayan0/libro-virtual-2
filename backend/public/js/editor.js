let token = localStorage.getItem("token");
if (!token) location.href = "login.html";

let headers = {
  "Content-Type": "application/json",
  "Authorization": "Bearer " + token
};

const titulo = document.getElementById("titulo");
const descripcion = document.getElementById("descripcion");
const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const contador = document.getElementById("contador");
const capitulosSelect = document.getElementById("capitulosSelect");

let capitulosCache = [];
let capituloActual = null;

const sanitize = s => s ? s.replace(/[<>]/g, "") : "";

async function fetchSeguro(url, options = {}) {
  let r = await fetch(url, { ...options, headers, credentials: "include" });
  if (r.status === 401) {
    const rf = await fetch("/api/auth/refresh", { credentials: "include" });
    if (!rf.ok) {
      localStorage.clear();
      location.href = "login.html";
      return null;
    }
    const d = await rf.json();
    token = d.token;
    localStorage.setItem("token", token);
    headers.Authorization = "Bearer " + token;
    r = await fetch(url, { ...options, headers, credentials: "include" });
  }
  return r;
}

async function cargarCapitulos() {
  const r = await fetchSeguro("/api/capitulos");
  if (!r || !r.ok) return;
  const text = await r.text();
  try {
    capitulosCache = JSON.parse(text);
  } catch {
    capitulosCache = [];
  }
  capitulosSelect.innerHTML = `<option value="">Nuevo capítulo</option>`;
  capitulosCache.forEach((c, i) => {
    const o = document.createElement("option");
    o.value = i;
    o.textContent = c.titulo;
    capitulosSelect.appendChild(o);
  });
}

capitulosSelect.onchange = () => {
  if (capitulosSelect.value === "") {
    limpiar();
    return;
  }
  capituloActual = capitulosCache[capitulosSelect.value];
  titulo.value = capituloActual.titulo || "";
  descripcion.value = capituloActual.descripcion || "";
  editor.innerHTML = capituloActual.contenido || "";
};

document.querySelectorAll(".toolbar button").forEach(b => {
  b.onclick = () => document.execCommand(b.dataset.cmd, false, null);
});
document.getElementById("fontSize").onchange = e =>
  document.execCommand("fontSize", false, e.target.value);

descripcion.oninput = () =>
  contador.textContent = descripcion.value.length + " / 200";

let autosaveTimer;
editor.oninput = () => {
  clearTimeout(autosaveTimer);
  autosaveTimer = setTimeout(() => {
    localStorage.setItem("draft", JSON.stringify({
      titulo: titulo.value,
      descripcion: descripcion.value,
      contenido: editor.innerHTML
    }));
  }, 1000);
};

const draft = localStorage.getItem("draft");
if (draft) {
  const d = JSON.parse(draft);
  titulo.value = d.titulo || "";
  descripcion.value = d.descripcion || "";
  editor.innerHTML = d.contenido || "";
}

function paginar(html) {
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  let pages = [];
  let acc = "";
  tmp.childNodes.forEach(n => {
    acc += n.outerHTML || n.textContent;
    if (acc.length > 1200) {
      pages.push(acc);
      acc = "";
    }
  });
  if (acc) pages.push(acc);
  return pages;
}

document.getElementById("previewBtn").onclick = () => {
  preview.innerHTML = `<h2>${sanitize(titulo.value)}</h2>`;
  paginar(editor.innerHTML).forEach(p => {
    preview.innerHTML += `<div class="pagina">${p}</div>`;
  });
  preview.classList.remove("hidden");
};

document.getElementById("guardarBtn").onclick = async () => {
  const body = JSON.stringify({
    titulo: sanitize(titulo.value),
    descripcion: sanitize(descripcion.value),
    contenido: editor.innerHTML
  });
  await fetchSeguro("/api/capitulos", { method: "POST", body });
  localStorage.removeItem("draft");
  limpiar();
  cargarCapitulos();
};

document.getElementById("eliminarBtn").onclick = async () => {
  if (!capituloActual) return;
  await fetchSeguro("/api/capitulos", {
    method: "DELETE",
    body: JSON.stringify({ id: capituloActual.id })
  });
  limpiar();
  cargarCapitulos();
};

function limpiar() {
  capituloActual = null;
  capitulosSelect.value = "";
  titulo.value = "";
  descripcion.value = "";
  editor.innerHTML = "";
}

document.getElementById("logoutBtn").onclick = () => {
  localStorage.clear();
  location.href = "index.html";
};

cargarCapitulos();
