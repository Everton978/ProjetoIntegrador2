const ra = localStorage.getItem('usuarioLogado');
const nome = localStorage.getItem('nomeUsuarioLogado');

if (!ra) {
    window.location.href = "login.html";
}

document.getElementById('raUsuario').innerText = nome ? `${nome} (RA: ${ra})` : `RA ${ra}`;
document.getElementById('dataAtividade').valueAsDate = new Date();

function verificarDesvio() {
    const container = document.getElementById('containerProblema');
    const desvio = document.getElementById('desvio');
    container.style.display = (desvio.value === 'sim') ? 'block' : 'none';
}

function enviarApontamento() {
    const dataAtiv = document.getElementById('dataAtividade').value;
    const descAtiv = document.getElementById('descricaoAtividade').value.trim();
    const tempo = document.getElementById('tempoGasto').value;
    const status = document.getElementById('statusAtividade').value;
    const desvioVal = document.getElementById('desvio').value;
    const justificativa = document.getElementById('detalheProblema').value.trim();

    if (!descAtiv || !tempo || tempo <= 0) {
        mostrarMensagem("⚠️ Preencha a descrição e o tempo corretamente.", "var(--danger)");
        return;
    }

    if (desvioVal === 'sim' && !justificativa) {
        mostrarMensagem("⚠️ Por favor, descreva o motivo do desvio.", "var(--danger)");
        return;
    }

    const novoApontamento = {
        ra,
        nome,
        data: dataAtiv,
        descricao: descAtiv,
        tempo: tempo,
        status: status,
        desvio: desvioVal,
        justificativa: justificativa,
        timestamp: new Date().getTime()
    };

    let lista = JSON.parse(localStorage.getItem('apontamentos')) || [];
    lista.push(novoApontamento);
    localStorage.setItem('apontamentos', JSON.stringify(lista));

    mostrarMensagem("✅ Apontamento registrado com sucesso!", "var(--secondary)");

    setTimeout(() => {
        window.location.href = "home.html";
    }, 1500);
}

function mostrarMensagem(texto, cor) {
    const msg = document.getElementById('msgRetorno');
    msg.style.color = cor;
    msg.innerText = texto;
}

function logout() {
    if (confirm("Deseja realmente sair? Seus apontamentos serão preservados.")) {
        localStorage.removeItem("usuarioLogado");
        localStorage.removeItem("nomeUsuarioLogado");
        window.location.href = "login.html";
    }
}

function marcarAbaAtiva() {
    const paginaAtual = window.location.pathname.split("/").pop() || "home.html";
    document.querySelectorAll(".nav-links a").forEach(link => {
        if (link.getAttribute("href") === paginaAtual) {
            link.classList.add("ativo");
        }
    });
}

window.addEventListener("load", marcarAbaAtiva);