const { Pool } = require("pg");

const renderDB = new Pool({
  connectionString: "postgresql://confesiones_db_user:JmMNwFKvWlKW9EhCwjPcGBQuft7pjIAI@dpg-d51dnn6uk2gs73c72vlg-a/confesiones_db",
  ssl: { rejectUnauthorized: false }
});

const railwayDB = new Pool({
  connectionString: "postgresql://postgres:XKFvNUyKxpOmxDWmBUgVCbSWtTFvRaHV@postgres.railway.internal:5432/railway",
  ssl: { rejectUnauthorized: false }
});

async function migrarCapitulos() {
  try {
    // Traer todos los capítulos de Render
    const { rows } = await renderDB.query("SELECT titulo, descripcion, paginas, fecha FROM capitulos");

    console.log(`Se encontraron ${rows.length} capítulos en Render.`);

    // Insertar en Railway
    for (const cap of rows) {
      await railwayDB.query(
        `INSERT INTO capitulos (titulo, descripcion, paginas, fecha) VALUES ($1,$2,$3,$4)`,
        [cap.titulo, cap.descripcion, cap.paginas, cap.fecha]
      );
    }

    console.log("Migración completada.");
  } catch (err) {
    console.error("Error migrando capítulos:", err);
  } finally {
    await renderDB.end();
    await railwayDB.end();
  }
}

migrarCapitulos();
