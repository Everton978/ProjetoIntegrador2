document.addEventListener("DOMContentLoaded", () => {

    /* LINK ATIVO AUTOMÁTICO */
    const paginaAtual = window.location.pathname.split("/").pop();

    document.querySelectorAll(".nav-links a").forEach(link => {
        const href = link.getAttribute("href");

        if (href === paginaAtual) {
            link.classList.add("ativo");
        }
    });

    /* MENU MOBILE */
    const toggle = document.getElementById("menuToggle");
    const nav = document.getElementById("navLinks");

    toggle.addEventListener("click", () => {
        nav.classList.toggle("show");
    });

});


/* LOGOUT */
function logout() {
    localStorage.removeItem("usuarioLogado");
    localStorage.removeItem("nomeUsuarioLogado");

    window.location.href = "login.html";
}