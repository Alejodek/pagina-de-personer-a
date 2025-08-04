// Supongamos que ya tienes estos módulos requeridos
const fs = require('fs');
const express = require('express');
const app = express();
app.use(express.json());

// Ruta POST para registrar un voto
app.post('/votar', (req, res) => {
  const { id_candidato, cargo } = req.body;

  // 1. Registrar el voto en votos.json
  fs.readFile('votos.json', 'utf8', (err, data) => {
    let votos = [];
    if (!err && data) {
      votos = JSON.parse(data);
    }

    const nuevoVoto = {
      id_voto: votos.length + 1,
      id_candidato,
      cargo,
      timestamp: new Date().toISOString()
    };

    votos.push(nuevoVoto);

    fs.writeFile('votos.json', JSON.stringify(votos, null, 2), err => {
      if (err) return res.status(500).json({ mensaje: 'Error al guardar el voto' });

      // 2. Actualizar el campo total_votos en postulaciones.json (tu "base de datos" de candidatos)
      fs.readFile('postulaciones.json', 'utf8', (err, data) => {
        if (err) return res.status(500).json({ mensaje: 'Error al leer candidatos' });

        let candidatos = JSON.parse(data);
        const index = candidatos.findIndex(c => c.id == id_candidato);
        if (index !== -1) {
          candidatos[index].total_votos = (candidatos[index].total_votos || 0) + 1;

          fs.writeFile('postulaciones.json', JSON.stringify(candidatos, null, 2), err => {
            if (err) return res.status(500).json({ mensaje: 'Error al actualizar votos del candidato' });
            return res.status(200).json({ mensaje: 'Voto registrado y total de votos actualizado' });
          });
        } else {
          return res.status(404).json({ mensaje: 'Candidato no encontrado' });
        }
      });
    });
  });
});
