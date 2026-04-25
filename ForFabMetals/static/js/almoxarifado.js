// 🔐 SEGURANÇA
if (!localStorage.getItem('usuarioLogado')) { window.location.href = "login.html"; }

document.getElementById('newResp').value = localStorage.getItem('nomeUsuarioLogado') || "Almoxarife";
let dadosPecas = JSON.parse(localStorage.getItem("estoque")) || [];

// 🧠 MÁGICA 1: CARREGA OS PROJETOS DA ENGENHARIA
function carregarProjetosEngenharia() {
    const select = document.getElementById("newPeca");
    const desenhos = JSON.parse(localStorage.getItem("desenhos")) || [];
    
    select.innerHTML = '<option value="">Selecione a Peça da Engenharia...</option>';
    if (desenhos.length === 0) {
        select.innerHTML = '<option value="">Nenhum projeto cadastrado na Engenharia.</option>';
        return;
    }

    desenhos.slice().reverse().forEach((d, idx) => {
        const realIndex = desenhos.length - 1 - idx;
        const opt = document.createElement("option");
        opt.value = realIndex;
        let statusIcon = d.statusAprovacao === 'APROVADO' ? '✅' : (d.statusAprovacao === 'REJEITADO' ? '❌' : '⏳');
        opt.text = `${statusIcon} ${d.peca} (Rev ${d.rev})`;
        select.appendChild(opt);
    });
}

function verificarMaterialEngenharia() {
    const select = document.getElementById("newPeca");
    const matInput = document.getElementById("newMat");
    const idx = select.value;

    if (idx === "") {
        matInput.value = ""; matInput.style.border = "1px solid #ddd";
        return;
    }

    const desenhos = JSON.parse(localStorage.getItem("desenhos")) || [];
    const d = desenhos[idx];

    if (d && d.material && d.material !== "Não informado") {
        matInput.value = d.material;
        matInput.style.border = "2px solid var(--secondary)";
    } else {
        matInput.value = ""; matInput.placeholder = "Digite manualmente...";
        matInput.style.border = "2px solid var(--orange)";
    }
}

// 🧠 MÁGICA 2: MUDA OS CAMPOS DE MEDIDA DEPENDENDO DO PERFIL GEOMÉTRICO
function mudarCamposMedida() {
    const perfil = document.getElementById("perfilMaterial").value;
    const box = document.getElementById("boxMedidas");
    
    let html = `<label>Dimensões de Corte (mm)</label><div class="medidas-grupo">`;
    
    if (perfil === "cilindrico") {
        html += `<input type="number" id="dim1" placeholder="Ø Diâmetro (mm)">
                 <input type="number" id="dim2" placeholder="Comprimento L (mm)">`;
    } else if (perfil === "bloco") {
        html += `<input type="number" id="dim1" placeholder="Larg. W (mm)">
                 <input type="number" id="dim2" placeholder="Alt. H (mm)">
                 <input type="number" id="dim3" placeholder="Comp. L (mm)">`;
    } else if (perfil === "chapa") {
        html += `<input type="number" id="dim1" placeholder="Espess. E (mm)">
                 <input type="number" id="dim2" placeholder="Larg. W (mm)">
                 <input type="number" id="dim3" placeholder="Comp. L (mm)">`;
    } else if (perfil === "tubo") {
        html += `<input type="number" id="dim1" placeholder="Ø Ext (mm)">
                 <input type="number" id="dim2" placeholder="Ø Int (mm)">
                 <input type="number" id="dim3" placeholder="Comp. L (mm)">`;
    } else if (perfil === "livre") {
        html += `<input type="text" id="dimLivre" placeholder="Ex: Sextavado 3/4 x 50mm">`;
    }
    
    html += `</div>`;
    box.innerHTML = html;
}

function formatarMedidas() {
    const perfil = document.getElementById("perfilMaterial").value;
    
    if (perfil === "livre") {
        return document.getElementById("dimLivre").value || "-";
    }

    const d1 = document.getElementById("dim1") ? document.getElementById("dim1").value : "";
    const d2 = document.getElementById("dim2") ? document.getElementById("dim2").value : "";
    const d3 = document.getElementById("dim3") ? document.getElementById("dim3").value : "";

    if (!d1 && !d2) return "-";

    if (perfil === "cilindrico") return `Ø${d1} x ${d2}mm`;
    if (perfil === "bloco") return `${d1} x ${d2} x ${d3}mm`;
    if (perfil === "chapa") return `Esp. ${d1} x ${d2} x ${d3}mm`;
    if (perfil === "tubo") return `Tubo Ø${d1}(ext) / Ø${d2}(int) x ${d3}mm`;
    
    return "-";
}

function salvarDados() { localStorage.setItem("estoque", JSON.stringify(dadosPecas)); }

function renderizarTabela() {
    const tbody = document.getElementById('tabelaAlmox');
    tbody.innerHTML = "";
    const isMobile = window.innerWidth <= 850;

    dadosPecas.slice().reverse().forEach((p, indexOriginal) => {
        const index = dadosPecas.length - 1 - indexOriginal;

        let btnDesenho = p.linkDesenho 
            ? `<a href="${p.linkDesenho}" target="_blank" class="btn-view-eng">🔍 Abrir</a>` 
            : `<span style="font-size:11px; color:#999;">Sem Anexo</span>`;

        let selectStatus = `
            <select class="sel-${p.status}" onchange="mudarStatus(this, ${index})">
                <option value="almoxarifado" ${p.status === 'almoxarifado' ? 'selected' : ''}>Estoque Físico</option>
                <option value="producao" ${p.status === 'producao' ? 'selected' : ''}>Liberado p/ Fábrica</option>
                <option value="finalizado" ${p.status === 'finalizado' ? 'selected' : ''}>Usinado / Baixado</option>
                <option value="descartado" ${p.status === 'descartado' ? 'selected' : ''}>Sucata</option>
            </select>
        `;

        if (isMobile) {
            const card = document.createElement("div");
            card.className = "card-item";
            card.innerHTML = `
                <div class="card-linha"><strong>Peça:</strong> ${p.nome} (Qtd: ${p.qtd})</div>
                <div class="card-linha"><strong>Material:</strong> ${p.mat}</div>
                <div class="card-linha"><strong>Dimensões:</strong> <span class="dimensao-badge">${p.tam}</span></div>
                <div class="card-linha"><strong>Projeto:</strong> ${btnDesenho}</div>
                <div class="card-linha"><strong>Status:</strong> ${selectStatus}</div>
                <div style="text-align:right; margin-top:10px;"><button onclick="deletarLinha(${index})" style="background:none; border:none; color:red; font-size:16px; cursor:pointer;">🗑️ Remover</button></div>
            `;
            tbody.appendChild(card);
        } else {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${p.qtd}</strong></td>
                <td><strong>${p.nome}</strong></td>
                <td>${p.mat}</td>
                <td><span class="dimensao-badge">${p.tam}</span></td>
                <td>${p.data}</td>
                <td><small>${p.resp}</small></td>
                <td style="text-align:center">${btnDesenho}</td>
                <td><input style="width: 100px; padding: 6px; border: 1px solid #ccc; border-radius: 4px;" value="${p.endereco || ""}" placeholder="Ex: Prat. A2" onchange="atualizarEndereco(this.value, ${index})"></td>
                <td>${selectStatus}</td>
                <td style="text-align:center"><button onclick="deletarLinha(${index})" style="background:none; border:none; color:red; font-size:16px; cursor:pointer;">🗑️</button></td>
            `;
            tbody.appendChild(tr);
        }
    });
}

function atualizarEndereco(valor, index) {
    dadosPecas[index].endereco = valor;
    salvarDados();
}

function mudarStatus(el, index) {
    dadosPecas[index].status = el.value;
    el.className = "sel-" + el.value;
    salvarDados();
}

function deletarLinha(index) {
    if(confirm("Deseja remover este item do estoque?")) {
        dadosPecas.splice(index, 1);
        salvarDados();
        renderizarTabela();
    }
}

function adicionarNovaLinha() {
    const select = document.getElementById('newPeca');
    const idx = select.value;
    const mat = document.getElementById('newMat').value;
    const qtd = document.getElementById('newQtd').value;
    const dimensaoFormatada = formatarMedidas();
    
    if (idx === "" || !mat) return alert("Selecione o projeto e preencha o material!");
    if (dimensaoFormatada === "-") return alert("Preencha as dimensões de corte do material bruto!");

    const desenhos = JSON.parse(localStorage.getItem("desenhos")) || [];
    const d = desenhos[idx];
    const nomeCompleto = `${d.peca} (Rev ${d.rev})`;

    dadosPecas.push({
        qtd: qtd,
        nome: nomeCompleto, 
        mat: mat,
        tam: dimensaoFormatada,
        resp: document.getElementById('newResp').value,
        data: new Date().toLocaleDateString('pt-BR'),
        status: "almoxarifado", 
        endereco: "",
        linkDesenho: d.arquivoBase64 || d.link || "" 
    });
    
    salvarDados();
    renderizarTabela();
    
    // Reseta form
    select.value = "";
    document.getElementById('newMat').value = "";
    document.getElementById('newMat').style.border = "1px solid #ddd";
    document.getElementById('newQtd').value = "1";
    document.getElementById('perfilMaterial').value = "cilindrico";
    mudarCamposMedida();
}

function logout() {
    if (confirm("Deseja realmente sair do sistema?")) {
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

// INICIALIZAÇÃO
window.addEventListener("resize", renderizarTabela);
window.addEventListener("load", () => {
    marcarAbaAtiva();
    carregarProjetosEngenharia();
    mudarCamposMedida(); // Inicializa os campos do tarugo cilíndrico
    renderizarTabela();
});