if (!localStorage.getItem('usuarioLogado')) { window.location.href = "login.html"; }
const inspetorLogado = localStorage.getItem('nomeUsuarioLogado') || "Inspetor CQ";

let indexOSSelecionada = -1;

function carregarTabelas() {
    const ordens = JSON.parse(localStorage.getItem('ordensProducao')) || [];
    const laudos = JSON.parse(localStorage.getItem('laudosQualidade')) || [];
    const tbodyInspecao = document.getElementById('listaInspecao');
    const tbodyHistorico = document.getElementById('historicoLaudos');
    
    tbodyInspecao.innerHTML = "";
    tbodyHistorico.innerHTML = "";

    let temInspecao = false;

    ordens.forEach((os, idx) => {
        if (os.status === 'cancelado' || os.status === 'aguardando' || os.laudoEmitido) return;

        temInspecao = true;
        let btnDesenho = os.link ? `<a href="${os.link}" target="_blank" class="btn-view-eng">📐 Ver Cotas</a>` : "-";
        
        tbodyInspecao.innerHTML += `
            <tr>
                <td><strong>${os.id}</strong></td>
                <td>${os.nome}</td>
                <td>${os.operador || 'N/A'}</td>
                <td><span class="status-badge bg-pend">${os.status.replace("_", " ").toUpperCase()}</span></td>
                <td>${btnDesenho}</td>
                <td><button class="btn-inspecionar" onclick="abrirLaudo(${idx})">Inspecionar</button></td>
            </tr>
        `;
    });

    if (!temInspecao) {
        tbodyInspecao.innerHTML = "<tr><td colspan='6' style='text-align:center;'>Nenhuma peça aguardando inspeção no momento.</td></tr>";
    }

    if (laudos.length === 0) {
        tbodyHistorico.innerHTML = "<tr><td colspan='7' style='text-align:center;'>Nenhum laudo emitido ainda.</td></tr>";
    } else {
        laudos.slice().reverse().forEach(laudo => {
            let badge = laudo.resultado === 'APROVADO' ? '<span class="status-badge bg-ok">APROVADO</span>' : 
                        (laudo.resultado === 'RETRABALHO' ? '<span class="status-badge bg-ret">RETRABALHO</span>' : 
                        '<span class="status-badge bg-nok">SUCATA</span>');
            
            let colorReal = laudo.resultado === 'APROVADO' ? 'var(--secondary)' : 'var(--danger)';

            tbodyHistorico.innerHTML += `
                <tr>
                    <td>${laudo.data}</td>
                    <td><strong>${laudo.osId}</strong></td>
                    <td>${laudo.peca}</td>
                    <td>${laudo.inspetor}</td>
                    <td style="font-family: monospace; font-size:12px;">
                        Esp: ${laudo.medidaDesenho}<br>
                        Real: <strong style="color: ${colorReal}">${laudo.medidaReal}</strong>
                    </td>
                    <td>${badge}</td>
                    <td style="color:#e74c3c; font-size:11px; max-width:150px;">${laudo.obs || '-'}</td>
                </tr>
            `;
        });
    }
}

function abrirLaudo(idx) {
    const ordens = JSON.parse(localStorage.getItem('ordensProducao')) || [];
    const os = ordens[idx];
    
    indexOSSelecionada = idx;
    
    document.getElementById('osAtual').value = os.id;
    document.getElementById('pecaAtual').value = os.nome;
    document.getElementById('medidaDesenho').value = "";
    document.getElementById('medidaReal').value = "";
    document.getElementById('resultadoInspecao').value = "";
    document.getElementById('motivoReprovacao').value = "";
    document.getElementById('boxReprovado').style.display = "none";
    
    const painel = document.getElementById('painelLaudo');
    painel.style.opacity = "1";
    painel.style.pointerEvents = "auto";
    document.getElementById('medidaDesenho').focus();
}

function verificarResultado() {
    const res = document.getElementById('resultadoInspecao').value;
    document.getElementById('boxReprovado').style.display = (res === "REPROVADO" || res === "RETRABALHO") ? "block" : "none";
}

function salvarLaudo() {
    if (indexOSSelecionada === -1) return alert("Selecione uma OS para inspecionar!");
    
    const resultado = document.getElementById('resultadoInspecao').value;
    const motivo = document.getElementById('motivoReprovacao').value;
    const medidaDesenho = document.getElementById('medidaDesenho').value;
    const medidaReal = document.getElementById('medidaReal').value;

    if (!medidaDesenho || !medidaReal) return alert("Preencha a medida especificada do projeto e a medida real encontrada!");
    if (!resultado) return alert("Selecione o resultado da inspeção.");
    if ((resultado === "REPROVADO" || resultado === "RETRABALHO") && !motivo) {
        return alert("É obrigatório informar a justificativa do desvio para retrabalhos ou sucatas.");
    }

    let ordens = JSON.parse(localStorage.getItem('ordensProducao')) || [];
    let laudos = JSON.parse(localStorage.getItem('laudosQualidade')) || [];
    let apontamentos = JSON.parse(localStorage.getItem('apontamentos')) || []; 

    const os = ordens[indexOSSelecionada];

    laudos.push({
        osId: os.id,
        peca: os.nome,
        resultado: resultado,
        medidaDesenho: medidaDesenho,
        medidaReal: medidaReal,
        obs: motivo,
        inspetor: inspetorLogado,
        data: new Date().toLocaleString('pt-BR')
    });

    if (resultado === "APROVADO") {
        ordens[indexOSSelecionada].laudoEmitido = true;
        ordens[indexOSSelecionada].status = "concluido";
        ordens[indexOSSelecionada].alertaCQ = ""; // Limpa qualquer alerta antigo
        alert("Laudo emitido! Peça Aprovada e finalizada.");
    } 
    else if (resultado === "REPROVADO") {
        ordens[indexOSSelecionada].laudoEmitido = true;
        ordens[indexOSSelecionada].status = "cancelado"; 
        
        apontamentos.push({
            data: new Date().toLocaleDateString('pt-BR'),
            ra: "CQ-SISTEMA", nome: "Qualidade - Alerta de Sucata",
            descricao: `Peça reprovada em definitivo na OS ${os.id} (${os.nome}).`,
            tempo: "0", status: "cancelado", desvio: "sim",
            justificativa: `[SUCATA]: Medida Real ${medidaReal} (Projeto: ${medidaDesenho}). Motivo: ${motivo} | Operador: ${os.operador}`
        });
        alert("Laudo de Sucata emitido! A peça foi descartada e o Gestor foi notificado.");
    }
    else if (resultado === "RETRABALHO") {
        // 🔴 MÁGICA AQUI: Salva o alerta dentro da Ordem de Produção!
        ordens[indexOSSelecionada].status = "em_andamento";
        ordens[indexOSSelecionada].laudoEmitido = false; 
        ordens[indexOSSelecionada].progresso = 0;
        ordens[indexOSSelecionada].alertaCQ = `Medida Encontrada: ${medidaReal} (Esperado: ${medidaDesenho}). Correção: ${motivo}`;
        
        if(ordens[indexOSSelecionada].tarefas) {
            ordens[indexOSSelecionada].tarefas.forEach(t => t.concluida = false);
        }

        apontamentos.push({
            data: new Date().toLocaleDateString('pt-BR'),
            ra: "CQ-SISTEMA", nome: "Qualidade - Alerta de Retrabalho",
            descricao: `Retrabalho exigido na OS ${os.id} (${os.nome}).`,
            tempo: "0", status: "em_andamento", desvio: "sim",
            justificativa: `[RETRABALHO NA MÁQUINA]: Medida Real ${medidaReal} (Projeto: ${medidaDesenho}). Correção necessária: ${motivo}`
        });
        alert("Laudo emitido! A peça foi devolvida para a tela da Produção para retrabalho imediato.");
    }

    localStorage.setItem('laudosQualidade', JSON.stringify(laudos));
    localStorage.setItem('ordensProducao', JSON.stringify(ordens));
    localStorage.setItem('apontamentos', JSON.stringify(apontamentos));

    document.getElementById('painelLaudo').style.opacity = "0.5";
    document.getElementById('painelLaudo').style.pointerEvents = "none";
    indexOSSelecionada = -1;
    carregarTabelas();
}

function logout() {
    if (confirm("Deseja sair do sistema?")) {
        localStorage.clear(); window.location.href = "login.html";
    }
}

function marcarAbaAtiva() {
    const path = window.location.pathname.split("/").pop() || "home.html";
    document.querySelectorAll(".nav-links a").forEach(l => {
        if (l.getAttribute("href") === path) l.classList.add("ativo");
    });
}

window.addEventListener("load", () => {
    marcarAbaAtiva();
    carregarTabelas();
});