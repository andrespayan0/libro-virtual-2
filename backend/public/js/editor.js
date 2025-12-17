// ================= SEGURIDAD BÁSICA =================
const token = localStorage.getItem("token");
if (!token) location.href = "login.html";

const headers = {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${token}`
};

// ================= ELEMENTOS =================
const titulo = document.getElementById("titulo");
const descripcion = document.getElementById("descripcion");
const editor = document.getElementById("editor");
const preview = document.getElementById("preview");
const contador = document.getElementById("contador");

// ================= TOOLBAR =================
document.querySelectorAll('.toolbar button').forEach(btn => {
  btn.onclick = () => document.execCommand(btn.dataset.cmd, false, null);
});

document.getElementById('fontSize').onchange = e => {
  document.execCommand('fontSize', false, e.target.value);
};

// ================= CONTADOR =================
descripcion.oninput = () => contador.textContent = `${descripcion.value.length} / 200`;

// ================= VISTA PREVIA =================
document.getElementById('previewBtn').onclick = () => {
  preview.innerHTML = `<h2>${sanitize(titulo.value)}</h2><div>${editor.innerHTML}</div>`;
  preview.classList.toggle('hidden');
};

// ================= GUARDAR =================
document.getElementById('guardarBtn').onclick = async () => {
  const data = {
    titulo: sanitize(titulo.value),
    descripcion: sanitize(descripcion.value),
    contenido: editor.innerHTML
  };

  await fetch('/api/capitulos', { method:'POST', headers, body:JSON.stringify(data) });
  alert('Capítulo guardado');
};

// ================= ELIMINAR =================
document.getElementById('eliminarBtn').onclick = async () => {
  if (!confirm('¿Eliminar capítulo?')) return;
  await fetch('/api/capitulos', { method:'DELETE', headers });
  alert('Capítulo eliminado');
};

// ================= LOGOUT =================
document.getElementById('logoutBtn').onclick = () => {
  localStorage.clear();
  location.href = 'index.html';
};

// ================= SANITIZACIÓN =================
function sanitize(str) {
  return str.replace(/[<>]/g, '');
}