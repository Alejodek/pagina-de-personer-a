const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 3000;

const db = new sqlite3.Database("base_datos.db", (err) => {
if (err) {
    console.error("❌ Error al conectar a la base de datos:", err);
} else {
    console.log("✅ Conectado a SQLite (base_datos.db)");
}
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("proyecto")); // Para servir archivos frontend si los guardas ahí

app.post("/postular", (req, res) => {
    const { nombre, email, foto, cargo, propuestas } = req.body;

  db.get("SELECT * FROM candidatos WHERE email = ? OR nombre = ?", [email, nombre], (err, row) => {
    if (err) return res.status(500).json({ mensaje: "Error en el servidor." });
    if (row) return res.status(400).json({ mensaje: "Ya existe un candidato con ese nombre o correo." });

    const stmt = db.prepare(`INSERT INTO candidatos (nombre, email, foto, cargo, propuestas)VALUES (?, ?, ?, ?, ?)`);
    stmt.run(nombre, email, foto, cargo, propuestas, function (err) {
        if (err) return res.status(500).json({ mensaje: "Error al guardar la postulación." });

        res.json({ mensaje: "✅ Postulación registrada correctamente." });
    });
    stmt.finalize();
});
});

app.post("/votar", (req, res) => {
const { candidato } = req.body;

db.get("SELECT id FROM candidatos WHERE nombre = ?", [candidato], (err, row) => {
    if (err || !row) return res.status(400).json({ mensaje: "Candidato no encontrado." });

    const candidato_id = row.id;

    db.run("INSERT INTO votos (candidato_id) VALUES (?)", [candidato_id], (err) => {
        if (err) return res.status(500).json({ mensaje: "Error al registrar voto." });

        db.run("UPDATE candidatos SET total_votos = total_votos + 1 WHERE id = ?", [candidato_id]);
        res.json({ mensaje: "✅ Voto registrado correctamente." });
    });
});
});

// Ruta para obtener todos los candidatos
app.get("/candidatos", (req, res) => {
  db.all("SELECT * FROM candidatos", [], (err, rows) => {
    if (err) return res.status(500).json({ mensaje: "Error al obtener candidatos." });

    res.json(rows);
});
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor escuchando en http://localhost:${PORT}`);
});
