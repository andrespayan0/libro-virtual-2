const express = require("express");
const crypto = require("crypto");
const path = require("path");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

const AUTHOR_USER = process.env.AUTHOR_USER;
const AUTHOR_PASSWORD_HASH = process.env.AUTHOR_PASSWORD_HASH;

let activeToken = null;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Crear tablas si no existen
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

  await pool.query(`
    CREATE TABLE IF NOT EXISTS capitulos_parte2 (
      id SERIAL PRIMARY KEY,
      titulo TEXT NOT NULL,
      descripcion TEXT,
      paginas TEXT[],
      fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
})();

app.use(express.json());

// Servir frontend
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// LOGIN
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  if (username !== AUTHOR_USER)
    return res.status(401).json({ mensaje: "Credenciales incorrectas" });

  const ok = await bcrypt.compare(password, AUTHOR_PASSWORD_HASH);
  if (!ok)
    return res.status(401).json({ mensaje: "Credenciales incorrectas" });

  activeToken = crypto.randomBytes(24).toString("hex");
  res.json({ token: activeToken });
});

// Middleware de auth
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || auth !== `Bearer ${activeToken}`)
    return res.status(403).json({ mensaje: "No autorizado" });
  next();
}

/* =========================
   PARTE 1
========================= */

// Público
app.get("/api/capitulos", async (req, res) => {
  const result = await pool.query(
    `SELECT * FROM capitulos WHERE fecha <= NOW() ORDER BY fecha DESC`
  );
  res.json(result.rows);
});

// Editor
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

/* =========================
   PARTE 2
========================= */

// Público
app.get("/api/capitulos2", async (req, res) => {
  const result = await pool.query(
    `SELECT * FROM capitulos_parte2 WHERE fecha <= NOW() ORDER BY fecha DESC`
  );
  res.json(result.rows);
});

// Editor
app.get("/api/editor/capitulos2", authMiddleware, async (req, res) => {
  const result = await pool.query(
    "SELECT * FROM capitulos_parte2 ORDER BY fecha DESC"
  );
  res.json(result.rows);
});

app.post("/api/capitulos2", authMiddleware, async (req, res) => {
  const { titulo, descripcion, paginas, fecha } = req.body;
  await pool.query(
    `INSERT INTO capitulos_parte2 (titulo, descripcion, paginas, fecha)
     VALUES ($1,$2,$3,$4)`,
    [titulo, descripcion, paginas, fecha || new Date()]
  );
  res.status(201).json({ mensaje: "Capítulo parte 2 publicado" });
});

app.put("/api/capitulos2/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { titulo, descripcion, paginas, fecha } = req.body;
  await pool.query(
    `UPDATE capitulos_parte2
     SET titulo=$1, descripcion=$2, paginas=$3, fecha=$4
     WHERE id=$5`,
    [titulo, descripcion, paginas, fecha, id]
  );
  res.json({ mensaje: "Capítulo parte 2 actualizado" });
});

app.delete("/api/capitulos2/:id", authMiddleware, async (req, res) => {
  await pool.query(
    "DELETE FROM capitulos_parte2 WHERE id=$1",
    [req.params.id]
  );
  res.json({ mensaje: "Capítulo parte 2 eliminado" });
});

// Servidor
app.listen(PORT, () => console.log("Servidor listo"));
