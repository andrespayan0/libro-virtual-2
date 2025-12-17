const express = require("express");
const crypto = require("crypto");
const path = require("path");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

// =======================
// CONFIG
// =======================
const AUTHOR = {
  username: "autor",
  password: "confesiones123"
};

let activeToken = null;

// =======================
// POSTGRES
// =======================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false
});

// Crear tabla si no existe
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS capitulos (
        id SERIAL PRIMARY KEY,
        titulo TEXT NOT NULL,
        descripcion TEXT,
        paginas TEXT[],
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("Tabla capitulos lista");
  } catch (err) {
    console.error("Error iniciando DB:", err);
  }
}

initDB();

// =======================
// MIDDLEWARES
// =======================
app.use(express.json());

// =======================
// FRONTEND (PUBLIC)
// =======================
const publicPath = path.join(__dirname, "..", "public");

app.use(express.static(publicPath));

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
// AUTH
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
app.get("/api/capitulos", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM capitulos ORDER BY fecha DESC"
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error obteniendo capítulos" });
  }
});

app.post("/api/capitulos", authMiddleware, async (req, res) => {
  const { titulo, descripcion, paginas } = req.body;

  if (!titulo || !paginas) {
    return res.status(400).json({ mensaje: "Datos incompletos" });
  }

  try {
    await pool.query(
      "INSERT INTO capitulos (titulo, descripcion, paginas) VALUES ($1, $2, $3)",
      [titulo, descripcion, paginas]
    );

    res.status(201).json({ mensaje: "Capítulo publicado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al publicar" });
  }
});

// =======================
// SERVER
// =======================
app.listen(PORT, () => {
  console.log(`Servidor corriendo en Render en puerto ${PORT}`);
});
