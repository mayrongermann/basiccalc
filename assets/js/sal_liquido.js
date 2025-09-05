let salarioChart = null; // Variável global para o gráfico

// Função para formatar valores em Reais
const formatarDinheiro = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// Lógica de cálculo do INSS (Progressivo - Tabela de 2025)
function calcularINSS(salario) {
    const teto = 8246.68;
    salario = Math.min(salario, teto); // O desconto não pode ser maior que o do teto

    let inss = 0;
    // Faixa 1
    if (salario > 0) {
        const baseFaixa1 = Math.min(salario, 1556.94);
        inss += baseFaixa1 * 0.075;
    }
    // Faixa 2
    if (salario > 1556.94) {
        const baseFaixa2 = Math.min(salario, 2782.23) - 1556.94;
        inss += baseFaixa2 * 0.09;
    }
    // Faixa 3
    if (salario > 2782.23) {
        const baseFaixa3 = Math.min(salario, 4173.34) - 2782.23;
        inss += baseFaixa3 * 0.12;
    }
    // Faixa 4
    if (salario > 4173.34) {
        const baseFaixa4 = Math.min(salario, teto) - 4173.34;
        inss += baseFaixa4 * 0.14;
    }
    return inss;
}

// Lógica de cálculo do IRRF (Tabela de 2025)
function calcularIRRF(baseCalculo) {
    let irrf = 0;
    if (baseCalculo > 4664.68) {
        irrf = (baseCalculo * 0.275) - 896.00;
    } else if (baseCalculo > 3751.05) {
        irrf = (baseCalculo * 0.225) - 662.77;
    } else if (baseCalculo > 2826.65) {
        irrf = (baseCalculo * 0.15) - 381.44;
    } else if (baseCalculo > 2259.20) {
        irrf = (baseCalculo * 0.075) - 169.44;
    }
    return Math.max(0, irrf); // Garante que o IRRF não seja negativo
}

document.getElementById('salario-liquido-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // 1. CAPTURAR VALORES
    const salarioBruto = parseFloat(document.getElementById('salarioBruto').value);
    const dependentes = parseInt(document.getElementById('dependentes').value);
    const outrosDescontos = parseFloat(document.getElementById('outrosDescontos').value);

    const resultadoDiv = document.getElementById('resultado');
    resultadoDiv.style.display = 'block';

    if (isNaN(salarioBruto)) {
        resultadoDiv.innerHTML = '<p style="color: red;">Por favor, insira um salário bruto válido.</p>';
        return;
    }

    // 2. REALIZAR CÁLCULOS
    const deducaoDependentes = dependentes * 189.59;
    const descontoINSS = calcularINSS(salarioBruto);
    const baseIRRF = salarioBruto - descontoINSS - deducaoDependentes;
    const descontoIRRF = calcularIRRF(baseIRRF);
    
    const totalDescontos = descontoINSS + descontoIRRF + outrosDescontos;
    const salarioLiquido = salarioBruto - totalDescontos;

    // 3. EXIBIR RESULTADOS
    resultadoDiv.innerHTML = `
        <h3 style="text-align: center;">Resumo do seu Holerite</h3>
        <div style="width: 100%; max-width: 300px; margin: 1rem auto;">
            <canvas id="graficoSalario"></canvas>
        </div>
        <ul style="list-style: none; padding: 0;">
            <li style="display: flex; justify-content: space-between; padding: 0.5rem 0;"><span>(+) Salário Bruto:</span> <strong>${formatarDinheiro(salarioBruto)}</strong></li>
            <hr>
            <li style="display: flex; justify-content: space-between; padding: 0.5rem 0;"><span>(-) INSS:</span> <span style="color: #dc3545;">${formatarDinheiro(descontoINSS)}</span></li>
            <li style="display: flex; justify-content: space-between; padding: 0.5rem 0;"><span>(-) IRRF:</span> <span style="color: #dc3545;">${formatarDinheiro(descontoIRRF)}</span></li>
            ${outrosDescontos > 0 ? `<li style="display: flex; justify-content: space-between; padding: 0.5rem 0;"><span>(-) Outros Descontos:</span> <span style="color: #dc3545;">${formatarDinheiro(outrosDescontos)}</span></li>` : ''}
            <hr>
            <li style="display: flex; justify-content: space-between; padding: 0.8rem 0; font-size: 1.2em;"><strong>(=) Salário Líquido:</strong> <strong style="color: #28a745;">${formatarDinheiro(salarioLiquido)}</strong></li>
        </ul>
    `;
    
    // 4. RENDERIZAR GRÁFICO
    const ctx = document.getElementById('graficoSalario').getContext('2d');
    if (salarioChart) {
        salarioChart.destroy(); // Destrói o gráfico anterior
    }
    salarioChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Salário Líquido', 'INSS', 'IRRF', 'Outros Descontos'],
            datasets: [{
                data: [salarioLiquido, descontoINSS, descontoIRRF, outrosDescontos],
                backgroundColor: ['#28a745', '#ffc107', '#fd7e14', '#6c757d'],
                borderColor: '#fff',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const valor = context.parsed;
                            const percentual = (valor / salarioBruto * 100).toFixed(1);
                            return `${context.label}: ${formatarDinheiro(valor)} (${percentual}%)`;
                        }
                    }
                }
            }
        }
    });
});