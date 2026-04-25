if (!localStorage.getItem('usuarioLogado')) { window.location.href = "login.html"; }
const raLogado = localStorage.getItem('usuarioLogado') || "OPERADOR-01";

function renderizarProducao() {
    let listaOS = JSON.parse(localStorage.getItem('ordensProducao')) || [];
    const container = document.getElementById('container-cards');
    container.innerHTML = "";

    const termoBusca = document.getElementById('buscaOS').value.toLowerCase();
    const filtroStatus = document.getElementById('filtroStatus').value;

    const osLiberadas = listaOS.filter(os => {
        if (os.status === "cancelado" || os.statusGestor !== "APROVADO") return false;
        const matchBusca = os.nome.toLowerCase().includes(termoBusca) || os.id.toLowerCase().includes(termoBusca);
        const matchStatus = filtroStatus === "todas" || os.status === filtroStatus;
        return matchBusca && matchStatus;
    });

    if (osLiberadas.length === 0) {
        container.innerHTML = `<div class="empty-state"><h3>Nenhuma OS encontrada 🚦</h3><p>Verifique os filtros ou aguarde aprovações.</p></div>`;
        return;
    }

    osLiberadas.slice().reverse().forEach((os) => {
        const idx = listaOS.indexOf(os); 
        const card = document.createElement('div');
        card.className = `card-producao status-${os.status}`;
        const progressoSalvo = os.progresso || 0;

        let imgOuBotao = "";
        if (os.link && os.link.startsWith("data:image")) imgOuBotao = `<img src="${os.link}">`;
        else if (os.link && (os.link.startsWith("http") || os.link.startsWith("data:application/pdf"))) imgOuBotao = `<img src="https://placehold.co/400x200?text=Projeto+Anexado"><a href="${os.link}" target="_blank" class="btn-abrir-anexo">🔍 Abrir Projeto</a>`;
        else imgOuBotao = `<img src="https://placehold.co/400x200?text=Sem+Refer%C3%AAncia">`;

        let htmlChecklist = "";
        let tarefasDaOS = os.tarefas; 
        
        if (!tarefasDaOS || tarefasDaOS.length === 0) {
            tarefasDaOS = [
                { nome: "Setup de Máquina", concluida: os.step1 },
                { nome: "Usinagem da Peça", concluida: os.step2 },
                { nome: "Inspeção / Liberação", concluida: os.step3 }
            ];
        }

        tarefasDaOS.forEach((t, iTask) => {
            htmlChecklist += `
                <div class="step">
                    <input type="checkbox" class="chk-${idx}" data-task-id="${iTask}" onchange="atualizarProgresso(${idx})" ${!os.operador ? 'disabled' : ''} ${t.concluida ? 'checked' : ''}>
                    ${t.nome}
                </div>
            `;
        });

        // 🔴 MÁGICA AQUI: Verifica se a OS tem um alerta de retrabalho do CQ
        let alertaRetrabalho = os.alertaCQ ? `<div class="alerta-retrabalho">⚠️ RETRABALHO DA QUALIDADE:<br>${os.alertaCQ}</div>` : "";

        card.innerHTML = `
            <div class="card-header">
                <div><h3 style="margin:0">${os.nome}</h3><small>OS: ${os.id} | Operador: <strong>${os.operador || 'Disponível'}</strong></small></div>
                <div style="font-size:12px; color:#7f8c8d;">Previsão Fim: ${new Date(os.fim).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})}</div>
            </div>
            <div class="card-body">
                <div class="drawing-zone">${imgOuBotao}</div>
                <div class="info-zone">
                    ${alertaRetrabalho ? `<div class="full-width">${alertaRetrabalho}</div>` : ""}
                    
                    <div>
                        <select id="sel-${idx}" class="status-select" onchange="mudarStatus(${idx})" ${!os.operador ? 'disabled' : ''}>
                            <option value="aguardando" ${os.status === 'aguardando' ? 'selected' : ''}>Aguardando</option>
                            <option value="em_andamento" ${os.status === 'em_andamento' ? 'selected' : ''}>Em Execução</option>
                            <option value="pausado" ${os.status === 'pausado' ? 'selected' : ''}>Pausado</option>
                            <option value="concluido" ${os.status === 'concluido' ? 'selected' : ''}>Finalizado</option>
                        </select>
                        <button class="btn-assumir" onclick="assumir(${idx})" ${os.operador ? 'disabled' : ''}>
                            ${os.operador ? 'Em Operação' : 'Assumir Produção'}
                        </button>
                    </div>
                    <div class="checklist">
                        ${htmlChecklist}
                    </div>
                    <div class="full-width">
                        <div class="progress-bar-bg">
                            <div class="progress-bar-fill" id="fill-${idx}" style="width:${progressoSalvo}%"></div>
                            <div class="progress-text" id="txt-${idx}">${progressoSalvo}% Concluído</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function assumir(idx) {
    let listaOS = JSON.parse(localStorage.getItem('ordensProducao')) || [];
    listaOS[idx].operador = raLogado;
    listaOS[idx].status = "em_andamento"; 
    localStorage.setItem('ordensProducao', JSON.stringify(listaOS));
    renderizarProducao();
}

function mudarStatus(idx) {
    let listaOS = JSON.parse(localStorage.getItem('ordensProducao')) || [];
    const sel = document.getElementById(`sel-${idx}`);
    
    if (sel.value === "concluido") {
        const checks = document.querySelectorAll(`.chk-${idx}`);
        const total = Array.from(checks).every(c => c.checked);
        if (!total) {
            alert("⚠️ Complete todo o Roteiro de Produção antes de finalizar a OS!");
            sel.value = "em_andamento";
            return;
        }
    }
    listaOS[idx].status = sel.value;
    localStorage.setItem('ordensProducao', JSON.stringify(listaOS));
    renderizarProducao();
}

function atualizarProgresso(idx) {
    let listaOS = JSON.parse(localStorage.getItem('ordensProducao')) || [];
    const checks = document.querySelectorAll(`.chk-${idx}`);
    
    let tarefas = listaOS[idx].tarefas || [];
    checks.forEach(chk => {
        let taskIdx = chk.getAttribute('data-task-id');
        if (tarefas[taskIdx]) {
            tarefas[taskIdx].concluida = chk.checked;
        }
    });

    const marcados = Array.from(checks).filter(c => c.checked).length;
    const porc = checks.length > 0 ? Math.round((marcados / checks.length) * 100) : 100;

    listaOS[idx].tarefas = tarefas;
    listaOS[idx].progresso = porc;

    localStorage.setItem('ordensProducao', JSON.stringify(listaOS));
    document.getElementById(`fill-${idx}`).style.width = porc + "%";
    document.getElementById(`txt-${idx}`).innerText = porc + "% Concluído";
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

window.addEventListener("load", () => { marcarAbaAtiva(); renderizarProducao(); });