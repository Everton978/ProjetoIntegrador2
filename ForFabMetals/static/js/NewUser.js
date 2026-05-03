let bancoDeDados = JSON.parse(localStorage.getItem('dbForFabio')) || {};

function salvarDB() {
    localStorage.setItem('dbForFabio', JSON.stringify(bancoDeDados));
}

async function hashSenha(senha) {
    const encoder = new TextEncoder();
    const data = encoder.encode(senha);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function registrarUsuario() {
    const nome = document.getElementById('cadNome').value.trim();
    const ra = document.getElementById('cadRA').value.trim();
    const turma = document.getElementById('cadTurma').value.trim();
    const senha = document.getElementById('cadSenha').value;

    const msg = document.getElementById('msgCadastro');

    if (!nome || !ra || !turma || !senha) {
        msg.style.color = "#e74c3c";
        msg.innerText = "⚠️ Preencha todos os campos!";
        return;
    }

    if (bancoDeDados[ra]) {
        msg.style.color = "#e74c3c";
        msg.innerText = "❌ RA já cadastrado!";
        return;
    }

    msg.style.color = "#2c3e50";
    msg.innerText = "⏳ Cadastrando...";

    const senhaHash = await hashSenha(senha);

    bancoDeDados[ra] = {
        nome,
        turma,
        senha: senhaHash
    };

    salvarDB();

    msg.style.color = "#27ae60";
    msg.innerText = "✅ Cadastro realizado com sucesso!";

    document.getElementById('cadNome').value = "";
    document.getElementById('cadRA').value = "";
    document.getElementById('cadTurma').value = "";
    document.getElementById('cadSenha').value = "";

    setTimeout(() => {
        window.location.href = "login.html";
    }, 1500);
}

document.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        registrarUsuario();
    }
});