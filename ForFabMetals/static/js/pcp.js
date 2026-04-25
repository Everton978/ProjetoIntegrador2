if (!localStorage.getItem('usuarioLogado')) { window.location.href = "login.html"; }

const elements = {
    nome: () => document.getElementById("nomePeca"),
    link: () => document.getElementById("linkDesenho"),
    inicio: () => document.getElementById("inicioPeca"),
    fim: () => document.getElementById("fimPeca"),
    tabela: () => document.getElementById("tabelaPCP")
};

let listaOS = JSON.parse(localStorage.getItem('ordensProducao')) || [];
let tempoCalculadoMinutos = 0;
let indexEdicaoOS = -1;

// ROTEIRO PADRÃO
let tarefasRoteiro = ["Setup de Máquina", "Usinagem da Peça", "Inspeção / Liberação"];

document.addEventListener("DOMContentLoaded", () => {
    carregarProjetosEngenharia();
    atualizarStatusAutomatico();
    renderizarTabela();
    renderizarRoteiro();
    marcarAbaAtiva();
});

// FUNÇÕES DO ROTEIRO DINÂMICO
function renderizarRoteiro() {
    const ul = document.getElementById("listaRoteiro");
    ul.innerHTML = "";
    if(tarefasRoteiro.length === 0) {
        ul.innerHTML = "<li style='color:#7f8c8d; justify-content:center;'>Nenhuma etapa definida. Adicione tarefas acima.</li>";
    } else {
        tarefasRoteiro.forEach((tarefa, idx) => {
            ul.innerHTML += `<li><span>${idx + 1}. ${tarefa}</span> <button onclick="removerTarefaRoteiro(${idx})">❌</button></li>`;
        });
    }
}

function adicionarTarefaRoteiro() {
    const input = document.getElementById("novaTarefa");
    const valor = input.value.trim();
    if(valor) {
        tarefasRoteiro.push(valor);
        input.value = "";
        renderizarRoteiro();
    }
}

function removerTarefaRoteiro(idx) {
    tarefasRoteiro.splice(idx, 1);
    renderizarRoteiro();
}


function carregarProjetosEngenharia() {
    const select = document.getElementById("nomePeca");
    const desenhos = JSON.parse(localStorage.getItem("desenhos")) || [];
    select.innerHTML = '<option value="">Selecione um projeto da Engenharia...</option>';
    if (desenhos.length === 0) { select.innerHTML = '<option value="">Nenhum projeto cadastrado.</option>'; return; }
    desenhos.slice().reverse().forEach((d, idx) => {
        const realIndex = desenhos.length - 1 - idx;
        const opt = document.createElement("option");
        opt.value = realIndex;
        let statusIcon = d.statusAprovacao === 'APROVADO' ? '✅' : (d.statusAprovacao === 'REJEITADO' ? '❌' : '⏳');
        opt.text = `${statusIcon} ${d.peca} (Rev ${d.rev}) - Status: ${d.statusAprovacao}`;
        select.appendChild(opt);
    });
}

function selecionarDesenho() {
    const idx = elements.nome().value;
    if (idx === "") { elements.link().value = ""; validarLink(); return; }
    const desenhos = JSON.parse(localStorage.getItem("desenhos")) || [];
    elements.link().value = desenhos[idx].arquivoBase64 || desenhos[idx].link || "Anexo Indisponível";
    validarLink();
}

function atualizarStatusAutomatico() {
    const agora = new Date();
    listaOS.forEach(os => {
        if (os.status === "cancelado" || os.statusGestor !== 'APROVADO') return;
        const inicio = new Date(os.inicio); const fim = new Date(os.fim);
        if (agora < inicio) os.status = "aguardando";
        else if (agora >= inicio && agora <= fim) os.status = "em_andamento";
        else if (agora > fim) os.status = "concluido";
    });
    localStorage.setItem('ordensProducao', JSON.stringify(listaOS));
}

function calcularPrioridade(fim, status, criticidade) {
    if (status === "cancelado" || status === "concluido") return "baixa";
    const diffHoras = (new Date(fim) - new Date()) / (1000 * 60 * 60);
    const crit = parseInt(criticidade) || 1;
    if (crit === 3 || diffHoras <= 2) return "alta";
    if (crit === 2 || diffHoras <= 8) return "media";
    return "baixa";
}

function renderizarTabela() {
    const tbody = elements.tabela(); tbody.innerHTML = "";
    const isMobile = window.innerWidth <= 850;
    listaOS.forEach((os, i) => {
        const prioridade = calcularPrioridade(os.fim, os.status, os.criticidade);
        const iniF = new Date(os.inicio).toLocaleString('pt-BR', {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'});
        const fimF = new Date(os.fim).toLocaleString('pt-BR', {day:'2-digit', month:'2-digit', hour:'2-digit', minute:'2-digit'});
        const badgeGestor = os.statusGestor === 'APROVADO' ? '<span class="badge" style="background:#27ae60;color:white">APROVADO</span>' : (os.statusGestor === 'REJEITADO' ? '<span class="badge" style="background:#e74c3c;color:white">REJEITADO</span>' : '<span class="badge" style="background:#f1c40f;color:#2c3e50">PENDENTE</span>');
        const btnEditar = os.status !== "cancelado" ? `<button class="btn-icon" onclick="prepararEdicaoOS(${i})" title="Editar OS">✏️</button>` : "";

        if (isMobile) {
            const card = document.createElement("div"); card.className = `card-os ${os.status === "cancelado" ? "cancelado" : ""}`;
            card.innerHTML = `<div class="card-topo"><strong>${os.id}</strong><span class="badge status-${os.status}">${os.status.replace("_", " ")}</span></div><div class="card-linha"><strong>Peça:</strong> ${os.nome}</div><div class="card-linha"><strong>Gestor:</strong> ${badgeGestor}</div><div class="card-linha"><strong>Fim:</strong> ${fimF}</div><div class="card-linha"><strong>Prioridade:</strong> <span class="badge prioridade-${prioridade}">${prioridade}</span></div><div class="card-acoes">${btnEditar} <button class="btn-icon" onclick="cancelarOS(${i})">🚫</button></div>`;
            tbody.appendChild(card);
        } else {
            const linha = tbody.insertRow(); if (os.status === "cancelado") linha.classList.add("linha-cancelada");
            linha.innerHTML = `<td><strong>${os.id}</strong></td><td>${os.nome}</td><td>${iniF}</td><td>${fimF}</td><td>${badgeGestor}</td><td><span class="badge status-${os.status}">${os.status.replace("_", " ")}</span></td><td><span class="badge prioridade-${prioridade}">${prioridade}</span></td><td>${btnEditar} <button class="btn-icon" onclick="cancelarOS(${i})" title="Cancelar OS">🚫</button></td>`;
        }
    });
}

function adicionarOS() {
    const idx = elements.nome().value;
    const inicio = elements.inicio().value;
    const fim = elements.fim().value;
    const criticidade = document.getElementById("criticidade").value;
    const link = elements.link().value;
    
    if (idx === "" && indexEdicaoOS === -1) return alert("Selecione um projeto da Engenharia!");
    if (!inicio || !fim) return alert("Preencha todos os campos do cronograma!");
    if (tarefasRoteiro.length === 0) return alert("Adicione pelo menos uma tarefa no Roteiro de Produção!");

    // Converte a lista de strings em um array de objetos (tarefa + status de concluída)
    const checklistDinâmico = tarefasRoteiro.map(t => ({ nome: t, concluida: false }));

    if (indexEdicaoOS >= 0) {
        listaOS[indexEdicaoOS].inicio = inicio;
        listaOS[indexEdicaoOS].fim = fim;
        listaOS[indexEdicaoOS].criticidade = criticidade;
        listaOS[indexEdicaoOS].tarefas = checklistDinâmico; // Atualiza o roteiro
        
        if (idx !== "") {
            const desenhos = JSON.parse(localStorage.getItem("desenhos")) || [];
            listaOS[indexEdicaoOS].nome = `${desenhos[idx].peca} (Rev ${desenhos[idx].rev})`;
            listaOS[indexEdicaoOS].link = link;
        }
        listaOS[indexEdicaoOS].statusGestor = "PENDENTE"; 
        alert("OS atualizada e enviada para reavaliação do Gestor!");
    } else {
        const desenhos = JSON.parse(localStorage.getItem("desenhos")) || [];
        const d = desenhos[idx];
        listaOS.push({
            id: "#OS-" + Math.floor(1000 + Math.random() * 8999),
            nome: `${d.peca} (Rev ${d.rev})`, link: link, inicio, fim, criticidade, 
            status: "aguardando", statusGestor: "PENDENTE", operador: null, progresso: 0,
            tarefas: checklistDinâmico // Salva o roteiro dinâmico na OS
        });
        alert("Ordem lançada com sucesso! Enviada para aprovação do Gestor.");
    }

    localStorage.setItem("ordensProducao", JSON.stringify(listaOS));
    atualizarStatusAutomatico(); cancelarEdicao(); renderizarTabela();
}

function prepararEdicaoOS(i) {
    indexEdicaoOS = i; const os = listaOS[i];
    elements.inicio().value = os.inicio; elements.fim().value = os.fim; document.getElementById("criticidade").value = os.criticidade;
    
    // Carrega as tarefas daquela OS para o editor
    if(os.tarefas && os.tarefas.length > 0) {
        tarefasRoteiro = os.tarefas.map(t => t.nome);
    } else {
        tarefasRoteiro = ["Setup de Máquina", "Usinagem da Peça", "Inspeção / Liberação"]; // Fallback
    }
    renderizarRoteiro();

    document.getElementById("btn-lancar-os").innerHTML = "🔄 Salvar Alterações";
    document.getElementById("btn-lancar-os").className = "btn-add bg-warning";
    document.getElementById("btn-cancelar-edicao").style.display = "flex";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelarEdicao() {
    indexEdicaoOS = -1; document.getElementById("nomePeca").value = "";
    ["linkDesenho","inicioPeca","fimPeca"].forEach(id => document.getElementById(id).value = "");
    document.getElementById("criticidade").value = "2"; validarLink();
    tarefasRoteiro = ["Setup de Máquina", "Usinagem da Peça", "Inspeção / Liberação"]; renderizarRoteiro();
    document.getElementById("btn-lancar-os").innerHTML = "🚀 Lançar Ordem";
    document.getElementById("btn-lancar-os").className = "btn-add bg-blue";
    document.getElementById("btn-cancelar-edicao").style.display = "none";
}

function calcularTempo() {
    const tipo = document.querySelector('input[name="tipoMaquina"]:checked').value;
    try {
        if (tipo === "torno") {
            const vc = parseFloat(document.getElementById("vcTorno").value); const d = parseFloat(document.getElementById("dTorno").value); const f = parseFloat(document.getElementById("fTorno").value); const l = parseFloat(document.getElementById("cTorno").value); const p = parseFloat(document.getElementById("passesTorno").value) || 1;
            tempoCalculadoMinutos = (l / (f * ((vc * 1000) / (Math.PI * d)))) * p;
        } else {
            const n = parseFloat(document.getElementById("nFresa").value); const fz = parseFloat(document.getElementById("fzFresa").value); const z = parseFloat(document.getElementById("zFresa").value); const l = parseFloat(document.getElementById("cFresa").value); const p = parseFloat(document.getElementById("passesFresa").value) || 1;
            tempoCalculadoMinutos = (l / (fz * z * n)) * p;
        }
        document.getElementById("resultadoTempo").innerText = tempoCalculadoMinutos.toFixed(2) + " min"; document.getElementById("btnAplicarTempo").style.display = "inline-block";
    } catch (e) { alert("Erro no cálculo!"); }
}

function aplicarTempoNaOS() {
    const inicioStr = elements.inicio().value; if (!inicioStr) return alert("Preencha a data de início primeiro!");
    const inicio = new Date(inicioStr); const fim = new Date(inicio.getTime() + tempoCalculadoMinutos * 60000);
    elements.fim().value = new Date(fim.getTime() - (fim.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
}

function cancelarOS(i) { if (confirm("Cancelar OS?")) { listaOS[i].status = "cancelado"; localStorage.setItem("ordensProducao", JSON.stringify(listaOS)); renderizarTabela(); } }

function validarLink() { const l = elements.link().value; const b = document.getElementById("btnVerDesenho"); if (l && (l.startsWith("http") || l.startsWith("data:"))) { b.style.display = "inline-block"; b.href = l; } else { b.style.display = "none"; } }
function mudarCalculadora() { document.getElementById("calcTorno").style.display = document.querySelector('input[name="tipoMaquina"]:checked').value === "torno" ? "grid" : "none"; document.getElementById("calcFresa").style.display = document.querySelector('input[name="tipoMaquina"]:checked').value === "fresa" ? "grid" : "none"; }
function logout() { if (confirm("Sair?")) { localStorage.clear(); window.location.href = "login.html"; } }
function marcarAbaAtiva() { const path = window.location.pathname.split("/").pop() || "home.html"; document.querySelectorAll(".nav-links a").forEach(l => { if (l.getAttribute("href") === path) l.classList.add("ativo"); }); }
window.addEventListener("resize", renderizarTabela);