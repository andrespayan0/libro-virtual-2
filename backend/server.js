const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

// =======================
// CONFIGURACIÓN
// =======================

const AUTHOR = {
  username: "autor",
  password: "confesiones123"
};

let activeToken = null;

// =======================
// MIDDLEWARES
// =======================

app.use(express.json());

// 👉 SERVIR FRONTEND
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

// =======================
// RUTA PRINCIPAL
// =======================

app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// =======================
// LOGIN
// =======================

app.post("/api/login", (req, res) => {
  const { username, password } = req.body;

  if (username === AUTHOR.username && password === AUTHOR.password) {
    activeToken = crypto.randomBytes(24).toString("hex");
    return res.json({ token: activeToken });
  }

  res.status(401).json({ mensaje: "Credenciales incorrectas" });
});

// =======================
// MIDDLEWARE PROTEGIDO
// =======================

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || authHeader !== `Bearer ${activeToken}`) {
    return res.status(403).json({ mensaje: "No autorizado" });
  }

  next();
}

// =======================
// CAPÍTULOS
// =======================

const dataPath = path.join(__dirname, "data", "capitulos.json");

app.get("/api/capitulos", (req, res) => {
  const data = fs.readFileSync(dataPath, "utf-8");
  res.json(JSON.parse(data));
});

app.post("/api/capitulos", authMiddleware, (req, res) => {
  const nuevoCapitulo = req.body;

  const data = fs.readFileSync(dataPath, "utf-8");
  const capitulos = JSON.parse(data);

  capitulos.push(nuevoCapitulo);

  fs.writeFileSync(dataPath, JSON.stringify(capitulos, null, 2));

  res.status(201).json({ mensaje: "Capítulo publicado correctamente" });
});

// =======================
// SERVER
// =======================

app.listen(PORT, () => {
  console.log("Servidor corriendo en puerto", PORT);
});
