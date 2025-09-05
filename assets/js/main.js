document.addEventListener('DOMContentLoaded', function() {
const hamburgerBtn = document.getElementById('hamburger-btn');
const navLinks = document.getElementById('main-nav-links');

if (hamburgerBtn && navLinks) {
    hamburgerBtn.addEventListener('click', function() {
        navLinks.classList.toggle('active');
    });
}
});
function ativarMenuHamburger() {
const hamburgerBtn = document.getElementById('hamburger-btn');
const navLinks = document.getElementById('main-nav-links');

if (hamburgerBtn && navLinks) {
    hamburgerBtn.addEventListener('click', function() {
        navLinks.classList.toggle('active');
    });
}
}

// Função principal para carregar componentes reutilizáveis
async function carregarComponentes() {
// Encontra o placeholder do header no HTML
const headerPlaceholder = document.getElementById('header-placeholder');

if (headerPlaceholder) {
    try {
        // Busca o conteúdo no caminho correto
        const response = await fetch('../assets/components/header.html');
        
        // Verifica se o arquivo foi encontrado
        if (!response.ok) {
            throw new Error(`Arquivo não encontrado: ${response.statusText}`);
        }

        const headerHTML = await response.text();
        
        // Insere o HTML do header dentro do placeholder
        headerPlaceholder.innerHTML = headerHTML;
        
        // Ativa a funcionalidade do menu hamburger DEPOIS que o header foi carregado
        ativarMenuHamburger();

    } catch (error) {
        console.error('Erro ao carregar o header:', error);
        headerPlaceholder.innerHTML = '<p style="color:red; text-align:center;">Erro ao carregar o menu.</p>';
    }
}
}

// Executa a função para carregar os componentes assim que o DOM estiver pronto
document.addEventListener('DOMContentLoaded', carregarComponentes);