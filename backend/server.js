const express = require("express");
const crypto = require("crypto");
const path = require("path");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

// =======================
// 🔐 AUTOR (ENV)
// =======================
const AUTHOR_USER = process.env.AUTHOR_USER;
const AUTHOR_PASSWORD_HASH = process.env.AUTHOR_PASSWORD_HASH;

let activeToken = null;

// =======================
// 🐘 POSTGRES
// =======================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Crear tabla si no existe
(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS capitulos (
      id SERIAL PRIMARY KEY,
      titulo TEXT NOT NULL,
      descripcion TEXT,
      paginas TEXT[],
      fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
})();

// =======================
// ⚙️ MIDDLEWARES
// =======================
app.use(express.json());

// =======================
// 🎨 FRONTEND
// =======================
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// =======================
// 🔑 LOGIN
// =======================
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  if (username !== AUTHOR_USER) {
    return res.status(401).json({ mensaje: "Credenciales incorrectas" });
  }

  const ok = await bcrypt.compare(password, AUTHOR_PASSWORD_HASH);
  if (!ok) {
    return res.status(401).json({ mensaje: "Credenciales incorrectas" });
  }

  activeToken = crypto.randomBytes(24).toString("hex");
  res.json({ token: activeToken });
});

// =======================
// 🔒 AUTH
// =======================
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${activeToken}`) {
    return res.status(403).json({ mensaje: "No autorizado" });
  }
  next();
}

// =======================
// 📚 CAPÍTULOS (PÚBLICO)
// =======================
app.get("/api/capitulos", async (req, res) => {
  const result = await pool.query(`
    SELECT * FROM capitulos
    WHERE fecha <= NOW()
    ORDER BY fecha DESC
  `);
  res.json(result.rows);
});

// =======================
// 📚 CAPÍTULOS (EDITOR)
// =======================
app.get("/api/editor/capitulos", authMiddleware, async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM capitulos ORDER BY fecha DESC"
  );
  res.json(result.rows);
});

app.post("/api/capitulos", authMiddleware, async (req, res) => {
  const { titulo, descripcion, paginas, fecha } = req.body;

  await pool.query(
    `INSERT INTO capitulos (titulo, descripcion, paginas, fecha)
     VALUES ($1,$2,$3,$4)`,
    [titulo, descripcion, paginas, fecha || new Date()]
  );

  res.status(201).json({ mensaje: "Capítulo publicado" });
});

app.put("/api/capitulos/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, paginas, fecha } = req.body;

  await pool.query(
    `UPDATE capitulos
     SET titulo=$1, descripcion=$2, paginas=$3, fecha=$4
     WHERE id=$5`,
    [titulo, descripcion, paginas, fecha, id]
  );

  res.json({ mensaje: "Capítulo actualizado" });
});

app.delete("/api/capitulos/:id", authMiddleware, async (req, res) => {
  await pool.query("DELETE FROM capitulos WHERE id=$1", [req.params.id]);
  res.json({ mensaje: "Capítulo eliminado" });
});

// =======================
// 🚀 SERVER
// =======================
app.listen(PORT, () => {
  console.log("Servidor listo");
});
