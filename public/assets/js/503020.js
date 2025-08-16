
// Oculta e exibe o header ao rolar a página
let lastScrollTop = 0;
const header = document.querySelector('header');

window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (scrollTop > lastScrollTop) {
        header.style.top = '-150px'; // Move o header para cima
    } else {
        header.style.top = '0';// Traz o header de volta
    }
    lastScrollTop = scrollTop;
});
document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('division-form');
    const resultadoDiv = document.getElementById('resultado');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const salario = parseFloat(document.getElementById('salario').value);

        if (isNaN(salario) || salario <= 0) {
            resultadoDiv.innerHTML = '<p style="color: red;">Por favor, insira um salário válido.</p>';
            return;
        }

        const necessidades = salario * 0.5;
        const desejos = salario * 0.3;
        const poupanca = salario * 0.2;

        const formatarMoeda = (valor) => {
            return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        };

        resultadoDiv.innerHTML = `
            <span style="color: #000000ff;" >Divisão 50/30/20:</span><br>
            <span style="color: #2e7d32;">Necessidades (50%): ${formatarMoeda(necessidades)}</span><br>
            <span style="color: #1976d2;">Desejos (30%): ${formatarMoeda(desejos)}</span><br>
            <span style="color: #fbc02d;">Poupança/Investimentos (20%): ${formatarMoeda(poupanca)}</span>
        `;
    });
});