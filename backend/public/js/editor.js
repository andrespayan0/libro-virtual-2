// ================= SEGURIDAD =================
let token = localStorage.getItem('token');
if(!token) location.href='login.html';
let headers={ 'Content-Type':'application/json','Authorization':`Bearer ${token}` };

// ================= ELEMENTOS =================
const titulo=document.getElementById('titulo');
const descripcion=document.getElementById('descripcion');
const editor=document.getElementById('editor');
const preview=document.getElementById('preview');
const contador=document.getElementById('contador');
const capitulosSelect=document.getElementById('capitulosSelect');
let capituloId=null;

// ================= TOOLBAR =================
document.querySelectorAll('.toolbar button').forEach(b=>b.onclick=()=>document.execCommand(b.dataset.cmd,false,null));
document.getElementById('fontSize').onchange=e=>document.execCommand('fontSize',false,e.target.value);

// ================= CONTADOR =================
descripcion.oninput=()=>contador.textContent=`${descripcion.value.length} / 200`;

// ================= SANITIZE =================
const sanitize=s=>s.replace(/[<>]/g,'');

// ================= FETCH SEGURO =================
async function fetchSeguro(url,opt={}){
  let r=await fetch(url,{...opt,headers});
  if(r.status===401){
    const rf=await fetch('/api/auth/refresh',{credentials:'include'});
    if(!rf.ok){localStorage.clear();location.href='login.html';return;}
    const d=await rf.json();
    token=d.token;localStorage.setItem('token',token);
    headers.Authorization=`Bearer ${token}`;
    r=await fetch(url,{...opt,headers});
  }
  return r;
}

// ================= CARGAR CAPÍTULOS =================
async function cargarCapitulos(){
  const r=await fetchSeguro('/api/capitulos');
  const d=await r.json();
  capitulosSelect.innerHTML='<option value="">Nuevo capítulo</option>';
  d.forEach(c=>{const o=document.createElement('option');o.value=c.id;o.textContent=c.titulo;capitulosSelect.appendChild(o);});
}

capitulosSelect.onchange=async()=>{
  if(!capitulosSelect.value){limpiar();return;}
  const r=await fetchSeguro(`/api/capitulos/${capitulosSelect.value}`);
  const c=await r.json();
  capituloId=c.id;titulo.value=c.titulo;descripcion.value=c.descripcion;editor.innerHTML=c.contenido;
};

// ================= AUTOSAVE + DRAFT =================
let t=null;
editor.oninput=()=>{clearTimeout(t);t=setTimeout(()=>{
  localStorage.setItem('draft',JSON.stringify({titulo:titulo.value,descripcion:descripcion.value,contenido:editor.innerHTML}));
},1000)};

const d=localStorage.getItem('draft');
if(d){const j=JSON.parse(d);titulo.value=j.titulo;descripcion.value=j.descripcion;editor.innerHTML=j.contenido;}

// ================= PAGINACIÓN =================
function paginar(html){
  const p=[],tmp=document.createElement('div');tmp.innerHTML=html;let pg='';
  tmp.childNodes.forEach(n=>{pg+=n.outerHTML||n.textContent;if(pg.length>1200){p.push(pg);pg='';}});
  if(pg)p.push(pg);return p;
}

document.getElementById('previewBtn').onclick=()=>{
  preview.innerHTML=`<h2>${sanitize(titulo.value)}</h2>`;
  paginar(editor.innerHTML).forEach(p=>preview.innerHTML+=`<div class='pagina'>${p}</div>`);
  preview.classList.remove('hidden');
};

// ================= GUARDAR =================
document.getElementById('guardarBtn').onclick=async()=>{
  const body=JSON.stringify({titulo:sanitize(titulo.value),descripcion:sanitize(descripcion.value),contenido:editor.innerHTML});
  const url=capituloId?`/api/capitulos/${capituloId}`:'/api/capitulos';
  const method=capituloId?'PUT':'POST';
  await fetchSeguro(url,{method,body});
  localStorage.removeItem('draft');
  limpiar();cargarCapitulos();alert('Guardado');
};

// ================= ELIMINAR =================
document.getElementById('eliminarBtn').onclick=async()=>{
  if(!capituloId||!confirm('¿Eliminar?'))return;
  await fetchSeguro(`/api/capitulos/${capituloId}`,{method:'DELETE'});
  limpiar();cargarCapitulos();
};

function limpiar(){capituloId=null;titulo.value='';descripcion.value='';editor.innerHTML='';}

// ================= LOGOUT =================
document.getElementById('logoutBtn').onclick=()=>{localStorage.clear();location.href='index.html'};

cargarCapitulos();