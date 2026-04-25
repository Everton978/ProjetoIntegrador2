document.addEventListener("DOMContentLoaded", init);

function init() {
    const usuario = localStorage.getItem("usuarioLogado");
    const nome = localStorage.getItem("nomeUsuarioLogado");

    if (!usuario) { window.location.href = "login.html"; return; }
    document.getElementById("msgBoasVindas").innerHTML = `Olá, <strong>${nome}</strong>. Visão geral da planta atualizada.`;

    carregarDashboardReal();
}

function carregarDashboardReal() {
    const desenhos = JSON.parse(localStorage.getItem('desenhos')) || [];
    const ordens = JSON.parse(localStorage.getItem('ordensProducao')) || [];
    const laudos = JSON.parse(localStorage.getItem('laudosQualidade')) || [];

    const totalEng = desenhos.length;
    const totalPCP = ordens.filter(o => o.status !== 'cancelado').length;
    const totalProd = ordens.filter(o => o.status === 'em_andamento').length;
    const totalQuali = laudos.filter(l => l.resultado === 'APROVADO').length;

    document.getElementById("kpi-eng").innerText = totalEng;
    document.getElementById("kpi-pcp").innerText = totalPCP;
    document.getElementById("kpi-prod").innerText = totalProd;
    document.getElementById("kpi-quali").innerText = totalQuali;

    let conjuntos = {};
    
    desenhos.forEach(d => {
        let nomeConjunto = (d.conjunto && d.conjunto.trim() !== "") ? d.conjunto.toUpperCase() : "PEÇAS AVULSAS";
        if (!conjuntos[nomeConjunto]) conjuntos[nomeConjunto] = { total: 0, concluidas: 0 };
        conjuntos[nomeConjunto].total += 1;
    });

    laudos.forEach(l => {
        if (l.resultado === 'APROVADO') {
            let desenhoOrig = desenhos.find(des => l.peca.includes(des.peca));
            let nomeConjunto = desenhoOrig && desenhoOrig.conjunto ? desenhoOrig.conjunto.toUpperCase() : "PEÇAS AVULSAS";
            if (conjuntos[nomeConjunto]) conjuntos[nomeConjunto].concluidas += 1;
        }
    });

    const divConjuntos = document.getElementById("listaConjuntos");
    divConjuntos.innerHTML = "";

    const chaves = Object.keys(conjuntos);
    if (chaves.length === 0) {
        divConjuntos.innerHTML = "<p style='color:#999; text-align:center;'>Nenhum projeto cadastrado na Engenharia.</p>";
    } else {
        chaves.forEach(nome => {
            const conj = conjuntos[nome];
            const porc = conj.total > 0 ? Math.round((conj.concluidas / conj.total) * 100) : 0;
            let color = porc === 100 ? "var(--secondary)" : "var(--blue)";

            divConjuntos.innerHTML += `
                <div class="projeto-item">
                    <div class="projeto-header">
                        <span>Conjunto: ${nome}</span>
                        <span style="color: ${color}">${porc}%</span>
                    </div>
                    <div class="projeto-stats">Componentes: ${conj.total} | Aprovados CQ: ${conj.concluidas}</div>
                    <div class="progress-bg">
                        <div class="progress-fill" style="width: ${porc}%; background: ${color}"></div>
                    </div>
                </div>
            `;
        });
    }

    const feed = document.getElementById("feedEventos");
    feed.innerHTML = "";

    if (ordens.length === 0) {
        feed.innerHTML = "<li>Sem ordens de produção emitidas pelo PCP.</li>";
    } else {
        ordens.slice(-8).reverse().forEach(o => {
            let corBorda = "var(--blue)";
            let textoStatus = "Ordem Criada / Em Trâmite";
            
            if (o.status === 'em_andamento') { corBorda = "var(--accent)"; textoStatus = "Usinagem em Progresso"; }
            if (o.status === 'concluido') { corBorda = "var(--secondary)"; textoStatus = "Aguardando Inspeção Final"; }
            if (o.status === 'cancelado') { corBorda = "var(--danger)"; textoStatus = "OS Interrompida ou Retrabalho"; }
            if (o.laudoEmitido && o.status === 'concluido') { corBorda = "var(--secondary)"; textoStatus = "Concluída e Aprovada (CQ)"; }

            feed.innerHTML += `
                <li style="border-left-color: ${corBorda}">
                    <strong>${o.id}</strong>: ${o.nome}
                    <small style="color: ${corBorda}">${textoStatus}</small>
                </li>
            `;
        });
    }
}

function logout() {
    if (confirm("Deseja realmente sair do sistema?")) {
        localStorage.clear();
        window.location.href = "login.html";
    }
}