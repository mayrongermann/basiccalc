// Arquivo: assets/js/main.js (VERSÃO FINAL E CORRIGIDA)

/**
 * Função genérica para carregar um componente HTML em um elemento da página.
 * @param {string} url - O caminho para o arquivo do componente (ex: '/assets/components/header.html').
 * @param {string} placeholderId - O ID do elemento onde o componente será inserido.
 */
async function carregarComponente(url, placeholderId) {
    const placeholder = document.getElementById(placeholderId);
    if (placeholder) { // Só tenta carregar se o placeholder existir na página
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Componente não encontrado: ${url}`);
            placeholder.innerHTML = await response.text();
        } catch (error) {
            console.error(`Erro ao carregar o componente ${url}:`, error);
            placeholder.innerHTML = `<p style="color:red; text-align:center;">Erro ao carregar.</p>`;
        }
    }
}

/**
 * Ativa a funcionalidade do menu hamburger.
 * Deve ser chamada DEPOIS que o header for carregado.
 */
function ativarMenuHamburger() {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const navLinks = document.getElementById('main-nav-links');
    if (hamburgerBtn && navLinks) {
        hamburgerBtn.addEventListener('click', () => navLinks.classList.toggle('active'));
    }
}

// Quando a página terminar de carregar, executa as funções de carregamento.
document.addEventListener('DOMContentLoaded', () => {
    // Carrega o header e, QUANDO TERMINAR (.then), ativa o menu.
    carregarComponente('../assets/components/header.html', 'header-placeholder').then(() => {
        ativarMenuHamburger();
    });
    
    // Carrega os outros componentes universais.
    carregarComponente('../assets/components/ads.html', 'left-ad-placeholder');
    carregarComponente('../assets/components/ads.html', 'right-ad-placeholder');
});