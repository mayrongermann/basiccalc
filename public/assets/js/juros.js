document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos HTML
    const form = document.getElementById('juros-form');
    const capitalInicialInput = document.getElementById('capital-inicial');
    const aporteMensalInput = document.getElementById('aporte-mensal');
    const taxaJurosInput = document.getElementById('taxa-juros');
    const periodoInput = document.getElementById('periodo');
    const resultadoDiv = document.getElementById('resultado');

    // Oculta e exibe o header ao rolar a página
    let lastScrollTop = 0;
    const header = document.querySelector('header');

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop) {
            header.style.top = '-150px'; // Move o header para cima
        } else {
            header.style.top = '0'; // Traz o header de volta
        }
        lastScrollTop = scrollTop;
    });
    // Evento de envio do formulário
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Pega os valores e converte para números
        const capitalInicial = parseFloat(capitalInicialInput.value) || 0;
        const aporteMensal = parseFloat(aporteMensalInput.value) || 0;
        const taxaAnual = parseFloat(taxaJurosInput.value) / 100;
        const periodoAnos = parseInt(periodoInput.value);

        // Validação básica
        if (capitalInicial < 0 || taxaAnual < 0 || periodoAnos <= 0 || isNaN(capitalInicial) || isNaN(taxaAnual) || isNaN(periodoAnos)) {
            resultadoDiv.innerHTML = '<p style="color: red;">Por favor, insira valores válidos.</p>';
            return;
        }

        // Calcula a taxa de juros mensal e o número total de meses
        const taxaMensal = taxaAnual / 12;
        const totalMeses = periodoAnos * 12;

        let montanteFinal = capitalInicial;

        // Itera sobre cada mês para calcular o crescimento
        for (let i = 0; i < totalMeses; i++) {
            montanteFinal = (montanteFinal + aporteMensal) * (1 + taxaMensal);
        }

        // Calcula o capital total investido (capital inicial + aportes)
        const capitalTotalInvestido = capitalInicial + (aporteMensal * totalMeses);

        // Calcula o total de juros gerados
        const jurosTotais = montanteFinal - capitalTotalInvestido;

        // Formata os valores para exibição em moeda
        const formatarMoeda = (valor) => {
            return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        };

        // Exibe o resultado na tela
        resultadoDiv.innerHTML = `
            <h4>Resumo do Investimento:</h4>
            <p><strong>Capital Inicial:</strong> ${formatarMoeda(capitalInicial)}</p>
            <p><strong>Aportes Mensais:</strong> ${formatarMoeda(aporteMensal)}</p>
            <p><strong>Capital Total Investido:</strong> ${formatarMoeda(capitalTotalInvestido)}</p>
            <p><strong>Total de Juros Gerados:</strong> ${formatarMoeda(jurosTotais)}</p>
            <p><strong>Valor Total Acumulado:</strong> <span style="color: #28a745; font-weight: bold;">${formatarMoeda(montanteFinal)}</span></p>
        `;
    });
});