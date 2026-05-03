let bancoDeDados = JSON.parse(localStorage.getItem('dbForFabio')) || {};

function salvarDB() {
    localStorage.setItem('dbForFabio', JSON.stringify(bancoDeDados));
}

/* =========================
   ⚡ LOGIN RÁPIDO PARA TESTES
   Substitua o nome/RA conforme necessário
========================= */
function loginRapido() {
    const RA_TESTE = "dev01";
    const NOME_TESTE = "Tester Dev";

    // Cria o usuário de teste no banco se ainda não existir
    if (!bancoDeDados[RA_TESTE]) {
        bancoDeDados[RA_TESTE] = { nome: NOME_TESTE, turma: "DEV", senha: "bypass-dev" };
        salvarDB();
    }

    localStorage.setItem('usuarioLogado', RA_TESTE);
    localStorage.setItem('nomeUsuarioLogado', NOME_TESTE);

    const msg = document.getElementById('msgLogin');
    msg.style.color = "#27ae60";
    msg.innerText = "✅ Acesso Dev concedido! Entrando...";

    setTimeout(() => { window.location.href = "home.html"; }, 600);
}

/* ========================= */

async function hashSenha(senha) {
    const encoder = new TextEncoder();
    const data = encoder.encode(senha);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function alternarTela(tela) {
    document.getElementById('msgLogin').innerText = "";
    document.getElementById('msgCadastro').innerText = "";
    if (tela === 'cadastro') {
        document.getElementById('formLogin').style.display = 'none';
        document.getElementById('formCadastro').style.display = 'block';
    } else {
        document.getElementById('formCadastro').style.display = 'none';
        document.getElementById('formLogin').style.display = 'block';
    }
}

async function registrarUsuario() {
    const nome = document.getElementById('cadNome').value.trim();
    const ra = document.getElementById('cadRA').value.trim();
    const turma = document.getElementById('cadTurma').value.trim();
    const senha = document.getElementById('cadSenha').value;
    const msg = document.getElementById('msgCadastro');

    if (!nome || !ra || !turma || !senha) {
        msg.style.color = "#e74c3c"; msg.innerText = "⚠️ Preencha todos os campos!"; return;
    }
    if (bancoDeDados[ra]) {
        msg.style.color = "#e74c3c"; msg.innerText = "❌ RA já cadastrado!"; return;
    }

    msg.style.color = "#2c3e50"; msg.innerText = "⏳ Cadastrando...";
    const senhaHash = await hashSenha(senha);
    bancoDeDados[ra] = { nome, turma, senha: senhaHash };
    salvarDB();

    msg.style.color = "#27ae60"; msg.innerText = "✅ Cadastro realizado com sucesso!";
    ["cadNome","cadRA","cadTurma","cadSenha"].forEach(id => document.getElementById(id).value = "");
    setTimeout(() => alternarTela('login'), 1500);
}

async function tentarLogin() {
    const ra = document.getElementById('raLogin').value.trim();
    const senha = document.getElementById('senhaLogin').value;
    const msg = document.getElementById('msgLogin');

    if (!ra || !senha) {
        msg.style.color = "#e74c3c"; msg.innerText = "⚠️ Preencha todos os campos!"; return;
    }

    msg.style.color = "#2c3e50"; msg.innerText = "⏳ Verificando credenciais...";
    const senhaHash = await hashSenha(senha);

    if (!bancoDeDados[ra] || bancoDeDados[ra].senha !== senhaHash) {
        msg.style.color = "#e74c3c"; msg.innerText = "❌ Usuário ou senha incorretos!"; return;
    }

    localStorage.setItem('usuarioLogado', ra);
    localStorage.setItem('nomeUsuarioLogado', bancoDeDados[ra].nome);
    msg.style.color = "#27ae60"; msg.innerText = "✅ Acesso concedido! Entrando...";
    setTimeout(() => { window.location.href = "home.html"; }, 800);
}

function loginRapido() {
    fetch('/login-teste/') // Rota que vamos criar no Django
        .then(response => {
            if (response.ok) {
                window.location.href = '/dashboard/'; // Mude para a sua página inicial
            } else {
                alert("Erro ao entrar como tester. Verifique se o usuário 'tester' existe.");
            }
        });
}

document.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        if (document.getElementById('formLogin').style.display !== "none") tentarLogin();
        else registrarUsuario();
    }
});