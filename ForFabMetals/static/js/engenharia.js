if (!localStorage.getItem('usuarioLogado')) { window.location.href = "login.html"; }
document.getElementById('autor').value = localStorage.getItem('nomeUsuarioLogado') || "Engenheiro";

let desenhos = JSON.parse(localStorage.getItem("desenhos")) || [];
let indexEdicao = -1;

function processarEnvio() {
    const fileInput = document.getElementById("arquivo");
    const file = fileInput.files.length > 0 ? fileInput.files[0] : null;

    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) { salvar(e.target.result, file.name); };
        reader.readAsDataURL(file);
    } else {
        salvar(null, null);
    }
}

function salvar(arquivoBase64, arquivoNome) {
    const conjunto = document.getElementById("conjunto").value || "Peças Avulsas";
    const peca = document.getElementById("peca").value;
    const rev = document.getElementById("rev").value;
    const tipo = document.getElementById("tipo").value;
    const link = document.getElementById("link").value;
    const material = document.getElementById("material").value;

    if (!peca || !rev) return alert("Preencha Peça e Revisão!");
    if (!arquivoBase64 && !link && indexEdicao === -1) return alert("Envie um arquivo ou cole um link!");

    if (indexEdicao >= 0) {
        desenhos[indexEdicao].conjunto = conjunto;
        desenhos[indexEdicao].rev = rev;
        desenhos[indexEdicao].tipo = tipo;
        desenhos[indexEdicao].material = material || "Não informado";
        if (link) desenhos[indexEdicao].link = link;
        if (arquivoBase64) { desenhos[indexEdicao].arquivoBase64 = arquivoBase64; desenhos[indexEdicao].arquivoNome = arquivoNome; }
        desenhos[indexEdicao].statusAprovacao = "PENDENTE";
        desenhos[indexEdicao].obsGestor = "";
        desenhos[indexEdicao].data = new Date().toLocaleDateString('pt-BR');
        alert("Nova revisão enviada com sucesso!");
    } else {
        desenhos.push({
            id: new Date().getTime(),
            conjunto: conjunto,
            peca, rev, tipo,
            link: link || null,
            arquivoBase64: arquivoBase64,
            arquivoNome: arquivoNome,
            material: material || "Não informado",
            autor: document.getElementById("autor").value,
            statusAprovacao: "PENDENTE",
            obsGestor: "",
            data: new Date().toLocaleDateString('pt-BR')
        });
        alert("Desenho enviado para aprovação!");
    }

    try {
        localStorage.setItem("desenhos", JSON.stringify(desenhos));
        cancelarEdicao();
        render();
    } catch(e) {
        alert("O arquivo é muito grande. Tente um PDF ou imagem menor.");
    }
}

function prepararEdicao(idx) {
    indexEdicao = idx;
    const d = desenhos[idx];
    document.getElementById("conjunto").value = d.conjunto || "";
    document.getElementById("peca").value = d.peca;
    document.getElementById("peca").readOnly = true;
    document.getElementById("rev").value = d.rev;
    document.getElementById("tipo").value = d.tipo;
    document.getElementById("material").value = d.material;
    document.getElementById("link").value = d.link || "";
    document.getElementById("btn-salvar").innerHTML = "🔄 Reenviar Nova Revisão";
    document.getElementById("btn-cancelar").style.display = "block";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function cancelarEdicao() {
    indexEdicao = -1;
    document.getElementById("peca").readOnly = false;
    document.getElementById("btn-salvar").innerHTML = "📤 Enviar para Aprovação do Gestor";
    document.getElementById("btn-cancelar").style.display = "none";
    ["conjunto", "peca", "rev", "link", "material", "arquivo"].forEach(id => document.getElementById(id).value = "");
}

function render() {
    const lista = document.getElementById("lista");
    lista.innerHTML = "";
    const isMobile = window.innerWidth <= 768;

    for (let i = desenhos.length - 1; i >= 0; i--) {
        let d = desenhos[i];
        let classeBadge = d.statusAprovacao === 'APROVADO' ? 'aprovado' : (d.statusAprovacao === 'REJEITADO' ? 'rejeitado' : 'pendente');

        let btnAbrir = d.arquivoBase64
            ? `<a class="btn-link" href="${d.arquivoBase64}" target="_blank">📎 Abrir</a>`
            : (d.link ? `<a class="btn-link" href="${d.link}" target="_blank">🔗 Link</a>` : '-');

        let btnCorrigir = d.statusAprovacao === 'REJEITADO'
            ? `<button class="btn-link" style="background:var(--orange); border:none; cursor:pointer;" onclick="prepararEdicao(${i})">✏️ Corrigir</button>`
            : '';

        let obs = d.obsGestor ? `<div style="color:var(--danger); font-size:10px; margin-top:4px;">${d.obsGestor}</div>` : "";

        if (isMobile) {
            const card = document.createElement("div"); card.className = "card";
            card.innerHTML = `<div class="linha"><strong style="color:var(--orange)">[${d.conjunto || 'Geral'}]</strong> ${d.peca} (Rev ${d.rev})</div>
                <div class="linha">Status: <span class="badge ${classeBadge}">${d.statusAprovacao}</span></div> ${obs}
                <div class="linha">${btnAbrir} ${btnCorrigir}</div>`;
            lista.appendChild(card);
        } else {
            lista.innerHTML += `<tr>
                <td><strong style="color:var(--orange)">${d.conjunto || 'Avulso'}</strong></td>
                <td><strong>${d.peca}</strong> (Rev ${d.rev})</td>
                <td>${d.material}</td>
                <td><span class="badge ${classeBadge}">${d.statusAprovacao}</span> ${obs}</td>
                <td>${btnAbrir} ${btnCorrigir}</td>
            </tr>`;
        }
    }
}

function logout() { localStorage.removeItem("usuarioLogado"); window.location.href = "login.html"; }

function marcarAbaAtiva() {
    const path = window.location.pathname.split("/").pop() || "home.html";
    document.querySelectorAll(".nav-links a").forEach(l => {
        if(l.getAttribute("href")===path) l.classList.add("ativo");
    });
}

window.addEventListener("resize", render);
window.addEventListener("load", marcarAbaAtiva);
render();