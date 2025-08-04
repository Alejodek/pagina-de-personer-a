document.addEventListener("DOMContentLoaded", async () => {
    const esPersonero = location.pathname.includes("personero.html");
    const cargo = esPersonero ? "Personero" : "Contralor";

    const res = await fetch("http://localhost:3000/candidatos");
    const candidatos = await res.json();

    const container = document.querySelector(".block-level");
    container.innerHTML = "";

    candidatos
        .filter(c => c.cargo === cargo)
        .forEach(c => {
            const card = document.createElement("div");
            card.className = "candidato";
            card.innerHTML = `
                <img src="${c.foto}" alt="Foto de ${c.nombre}" style="max-width: 100px;">
                <h3>${c.nombre}</h3>
                <p>${c.propuestas}</p>
                <p>Votos: ${c.total_votos}</p>
                <button onclick="votar('${c.nombre}')">Votar</button>
            `;
            container.appendChild(card);
        });
});

async function votar(nombre) {
    const confirmacion = confirm(`¿Seguro que deseas votar por ${nombre}?`);
    if (!confirmacion) return;

    const yaVoto = sessionStorage.getItem(`voto-${nombre}`);
    if (yaVoto) {
        alert("Ya has votado por esta persona.");
        return;
    }

    const res = await fetch("http://localhost:3000/votar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidato: nombre })
    });

    const data = await res.json();
    alert(data.mensaje);

    if (res.ok) {
        sessionStorage.setItem(`voto-${nombre}`, "true");
        location.reload(); // para actualizar los votos
    }
}
