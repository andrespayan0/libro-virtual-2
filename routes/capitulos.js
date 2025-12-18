const express = require("express");
const fs = require("fs");
const router = express.Router();

const filePath = "./data/capitulos.json";

/* leer capítulos */
router.get("/", (req, res) => {
  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const publicados = data.filter(c => c.estado === "publicado");
  res.json(publicados);
});

/* crear capítulo */
router.post("/", (req, res) => {
  const { titulo, descripcion, contenido, fechaPublicacion } = req.body;

  const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

  const nuevoCapitulo = {
    id: Date.now(),
    titulo,
    descripcion,
    contenido,
    fechaPublicacion,
    estado: "publicado"
  };

  data.push(nuevoCapitulo);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

  res.status(201).json(nuevoCapitulo);
});

module.exports = router;
