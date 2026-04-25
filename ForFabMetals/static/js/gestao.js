if (!localStorage.getItem('usuarioLogado')) { window.location.href = "login.html"; }

function carregarTudo() {
    const desenhos = JSON.parse(localStorage.getItem('desenhos')) || [];
    const ordens = JSON.parse(localStorage.getItem('ordensProducao')) || [];
    const estoque = JSON.parse(localStorage.getItem('estoque')) || [];
    const apontamentos = JSON.parse(localStorage.getItem('apontamentos')) || [];

    // CARREGA KPIs
    document.getElementById('kpi-ordens').innerText = ordens.filter(o => o.status !== 'cancelado').length;
    document.getElementById('kpi-estoque').innerText = estoque.length;
    document.getElementById('kpi-erros').innerText = apontamentos.filter(a => a.desvio === 'sim').length;

    let htmlPendentes = "";
    let htmlAprovados = "";

    // 1. Puxa os Desenhos da Engenharia
    desenhos.forEach((d, idx) => {
        let linkParaAbrir = d.arquivoBase64 ? d.arquivoBase64 : d.link;
        let textoBotao = d.arquivoBase64 ? "📎 Abrir Anexo" : "🔗 Abrir Link";
        let btnVisualizar = linkParaAbrir ? `<a href="${linkParaAbrir}" target="_blank" class="btn btn-view">${textoBotao}</a>` : `<span style="font-size:11px; color:#7f8c8d;">Sem anexo</span>`;

        if (d.statusAprovacao === 'PENDENTE') {
            htmlPendentes += `<tr>
                <td><strong>ENGENHARIA</strong></td>
                <td>${d.peca}</td>
                <td>Rev: ${d.rev}</td>
                <td>${btnVisualizar}</td>
                <td><span class="status-badge">AGUARDANDO</span></td>
                <td>
                    <button class="btn btn-aprovar" onclick="decidirEng(${idx}, 'APROVADO')">✔️</button>
                    <button class="btn btn-rejeitar" onclick="decidirEng(${idx}, 'REJEITADO')">❌</button>
                </td>
            </tr>`;
        } else if (d.statusAprovacao === 'APROVADO') {
            htmlAprovados += `<tr>
                <td><strong>ENGENHARIA</strong></td>
                <td>${d.peca}</td>
                <td>Rev: ${d.rev}</td>
                <td>${btnVisualizar}</td>
                <td>
                    <button class="btn btn-rejeitar" onclick="revogarAprovacaoEng(${idx})">⚠️ Revogar</button>
                </td>
            </tr>`;
        }
    });

    // 2. Puxa as Ordens de Produção do PCP
    ordens.forEach((o, idx) => {
        if (o.statusGestor === 'PENDENTE') {
            htmlPendentes += `<tr>
                <td><strong style="color: var(--blue);">PCP</strong></td>
                <td>OS: ${o.id}</td>
                <td>${o.nome}</td>
                <td><span style="font-size:11px; color:#7f8c8d;">Cronograma</span></td>
                <td><span class="status-badge">AGUARDANDO</span></td>
                <td>
                    <button class="btn btn-aprovar" onclick="aprovarOS(${idx})">✔️</button>
                    <button class="btn btn-rejeitar" onclick="rejeitarOS(${idx})">❌</button>
                </td>
            </tr>`;
        } else if (o.statusGestor === 'APROVADO' && o.status !== 'cancelado') {
            // Se já foi aprovada e não está cancelada, mostra no histórico
            let statusBadgeFabrica = `<span style="font-size:11px; font-weight:bold; color:var(--primary)">Fábrica: ${o.status.toUpperCase()}</span>`;
            htmlAprovados += `<tr>
                <td><strong style="color: var(--blue);">PCP</strong></td>
                <td>OS: ${o.id}</td>
                <td>${o.nome}<br>${statusBadgeFabrica}</td>
                <td><span style="font-size:11px; color:#7f8c8d;">Cronograma</span></td>
                <td>
                    <button class="btn btn-rejeitar" onclick="revogarAprovacaoOS(${idx})">⚠️ Revogar OS</button>
                </td>
            </tr>`;
        }
    });

    document.getElementById('listaAprovacoes').innerHTML = htmlPendentes || "<tr><td colspan='6' style='text-align:center; padding: 20px;'>Nenhuma aprovação pendente. Tudo limpo! 🎉</td></tr>";
    document.getElementById('listaAprovados').innerHTML = htmlAprovados || "<tr><td colspan='5' style='text-align:center; padding: 20px;'>Nenhuma liberação registrada.</td></tr>";

    // CARREGA HISTÓRICOS E ERROS DA PRODUÇÃO
    document.getElementById('resultadoBusca').innerHTML = apontamentos.slice().reverse().map(a => `<div style="border-left:4px solid #3498db; padding:10px; margin-bottom:5px; background:#f9f9f9; font-size:13px;"><strong>${a.nome}</strong>: ${a.descricao} <br><small style="color:#7f8c8d;">Status: ${a.status} | Tempo: ${a.tempo}h</small></div>`).join('');
    
    const erros = apontamentos.filter(a => a.desvio === 'sim');
    document.getElementById('listaErros').innerHTML = erros.length > 0 ? erros.slice().reverse().map(e => `<div class="log-erro"><strong>${e.nome}</strong> (${e.data}):<br> ${e.justificativa}</div>`).join('') : "<p style='color:green; text-align:center;'>Nenhum desvio registrado.</p>";
}

// FUNÇÕES DA ENGENHARIA
function decidirEng(idx, acao) {
    let desenhos = JSON.parse(localStorage.getItem('desenhos'));
    desenhos[idx].statusAprovacao = acao;
    if(acao === 'REJEITADO') {
        let motivo = prompt("Motivo da recusa para a Engenharia corrigir:");
        if(!motivo) return; 
        desenhos[idx].obsGestor = motivo;
    } else {
        desenhos[idx].obsGestor = "Aprovado para Produção/PCP.";
    }
    localStorage.setItem('desenhos', JSON.stringify(desenhos));
    carregarTudo();
}

function revogarAprovacaoEng(idx) {
    let motivo = prompt("Atenção: Revogar vai tirar o projeto do PCP. Motivo da revogação:");
    if (motivo) {
        let desenhos = JSON.parse(localStorage.getItem('desenhos'));
        desenhos[idx].statusAprovacao = 'REJEITADO';
        desenhos[idx].obsGestor = "[REVOGADO DA FÁBRICA]: " + motivo;
        localStorage.setItem('desenhos', JSON.stringify(desenhos));
        carregarTudo();
        alert("Projeto revogado com sucesso. Ele voltou para a Engenharia!");
    }
}

// FUNÇÕES DO PCP
function aprovarOS(idx) {
    let o = JSON.parse(localStorage.getItem('ordensProducao'));
    o[idx].statusGestor = 'APROVADO';
    localStorage.setItem('ordensProducao', JSON.stringify(o));
    carregarTudo();
    alert("Ordem de Produção Aprovada! Liberada para o chão de fábrica.");
}

function rejeitarOS(idx) {
    let o = JSON.parse(localStorage.getItem('ordensProducao'));
    let motivo = prompt("Motivo da recusa do planejamento (A OS será cancelada):");
    if(motivo){ 
        o[idx].status = 'cancelado'; 
        o[idx].statusGestor = 'REJEITADO'; 
        localStorage.setItem('ordensProducao', JSON.stringify(o)); 
        carregarTudo(); 
    }
}

function revogarAprovacaoOS(idx) {
    let motivo = prompt("Atenção: Revogar cancelará a OS imediatamente e a retirará da Produção. Motivo:");
    if (motivo) {
        let o = JSON.parse(localStorage.getItem('ordensProducao'));
        o[idx].status = 'cancelado'; // Cancela para sumir da tela do operador
        o[idx].statusGestor = 'REJEITADO';
        localStorage.setItem('ordensProducao', JSON.stringify(o));
        carregarTudo();
        alert("Ordem revogada e recolhida da fábrica com sucesso!");
    }
}

// FUNÇÕES DA AUDITORIA
function buscarApontamentos() {
    const termo = document.getElementById('buscaRA').value.toLowerCase();
    const dados = JSON.parse(localStorage.getItem('apontamentos')) || [];
    const container = document.getElementById('resultadoBusca');
    const filtrados = dados.filter(item => item.ra.toLowerCase().includes(termo) || item.nome.toLowerCase().includes(termo));

    container.innerHTML = filtrados.length > 0 
        ? filtrados.slice().reverse().map(a => `<div style="border-left:4px solid #3498db; padding:10px; margin-bottom:5px; background:#f9f9f9; font-size:13px;"><strong>${a.data} - ${a.nome}</strong><br>${a.descricao}</div>`).join('') 
        : "<p style='text-align:center'>Nenhum registro encontrado.</p>";
}

function logout() { localStorage.removeItem("usuarioLogado"); window.location.href = "login.html"; }

function marcarAbaAtiva() {
    const paginaAtual = window.location.pathname.split("/").pop() || "home.html";
    document.querySelectorAll(".nav-links a").forEach(link => {
        if (link.getAttribute("href") === paginaAtual) { link.classList.add("ativo"); }
    });
}

window.addEventListener("load", () => {
    marcarAbaAtiva();
    carregarTudo();
});