const token = localStorage.getItem("token");
if (!token) location.href = "/login.html";

const titulo = document.getElementById("titulo");
const descripcion = document.getElementById("descripcion");
const contenido = document.getElementById("contenido");
const fecha = document.getElementById("fecha");
const mensaje = document.getElementById("mensaje");
const lista = document.getElementById("listaCapitulos");
const publicarBtn = document.getElementById("publicarBtn");
const logoutBtn = document.getElementById("logoutBtn");

let editId = null;

logoutBtn.onclick = () => {
  localStorage.removeItem("token");
  location.href = "/";
};

async function cargarCapitulos() {
  const res = await fetch("/api/editor/capitulos", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const capitulos = await res.json();

  lista.innerHTML = "";

  capitulos.forEach(c => {
    const div = document.createElement("div");
    div.className = "capitulo-item";
    div.innerHTML = `
      <h3>${c.titulo}</h3>
      <div class="capitulo-acciones">
        <button class="btn-editar">Editar</button>
        <button class="btn-borrar">Borrar</button>
      </div>
    `;

    div.querySelector(".btn-editar").onclick = () => editar(c);
    div.querySelector(".btn-borrar").onclick = () => borrar(c.id);

    lista.appendChild(div);
  });
}

function editar(c) {
  editId = c.id;
  titulo.value = c.titulo;
  descripcion.value = c.descripcion || "";
  contenido.value = c.paginas.join("\n\n");
  fecha.value = c.fecha ? c.fecha.slice(0, 16) : "";
}

async function borrar(id) {
  if (!confirm("¿Eliminar capítulo?")) return;

  await fetch(`/api/capitulos/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` }
  });

  cargarCapitulos();
}

publicarBtn.onclick = async () => {
  const data = {
    titulo: titulo.value,
    descripcion: descripcion.value,
    paginas: [contenido.innerHTML],
    fecha: fecha.value
  };

  const url = editId ? `/api/capitulos/${editId}` : "/api/capitulos";
  const method = editId ? "PUT" : "POST";

  await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  mensaje.textContent = "Guardado correctamente";
  editId = null;
  titulo.value = descripcion.value = contenido.value = fecha.value = "";
  cargarCapitulos();
};

document.querySelectorAll(".toolbar button").forEach(btn => {
  btn.onclick = () => {
    document.execCommand(btn.dataset.cmd, false, null);
  };
});

document.getElementById("fontSize").onchange = e => {
  document.execCommand("fontSize", false, e.target.value);
};


document.querySelectorAll(".toolbar button[data-cmd]").forEach(btn => {
  btn.onclick = () => {
    document.execCommand(btn.dataset.cmd, false, null);
    contenido.focus();
  };
});

fontSize.onchange = e => {
  document.execCommand("fontSize", false, e.target.value);
  contenido.focus();
};

document.getElementById("blockquote").onclick = () => {
  document.execCommand("formatBlock", false, "blockquote");
  contenido.focus();
};

document.getElementById("hr").onclick = () => {
  document.execCommand("insertHorizontalRule");
  contenido.focus();
};

cargarCapitulos();
