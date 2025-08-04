document.getElementById("formulario").addEventListener("submit", async function(e) {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const email = document.getElementById("email").value.trim();
    const propuestas = document.getElementById("propuestas").value.trim();
    const fotoInput = document.getElementById("foto");
    const fotoArchivo = fotoInput.files[0];

if (!nombre || !email || !propuestas) {
    alert("Por favor, completa todos los campos.");
    return;
}

const emailValido = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
if (!emailValido.test(email)) {
    alert("Correo electrónico no válido.");
    return;
}

const getBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
});

const fotoBase64 = fotoArchivo ? await getBase64(fotoArchivo) : "";

const postulacion = {
    nombre,
    email,
    foto: fotoBase64,
    cargo: "Personero",
    propuestas
};

const res = await fetch("http://localhost:3000/postular", {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(postulacion)
});

const data = await res.json();
alert(data.mensaje);

if (res.ok) {
    window.location.href = "index.html"; 
}
});
