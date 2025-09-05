// Variável global para destruir o gráfico anterior antes de criar um novo
let projectionChart = null;

document.getElementById('if-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // 1. CAPTURAR VALORES
    const custoMensal = parseFloat(document.getElementById('custoMensal').value);
    const patrimonioAtual = parseFloat(document.getElementById('patrimonioAtual').value);
    const aporteMensal = parseFloat(document.getElementById('aporteMensal').value);
    const rentabilidadeAnual = parseFloat(document.getElementById('rentabilidadeAnual').value);

    const resultadoDiv = document.getElementById('resultado');
    resultadoDiv.style.display = 'block';

    // 2. VALIDAÇÃO
    if (isNaN(custoMensal) || isNaN(patrimonioAtual) || isNaN(aporteMensal) || isNaN(rentabilidadeAnual) || custoMensal <= 0 || aporteMensal <= 0) {
        resultadoDiv.innerHTML = '<p style="color: red;">Por favor, preencha todos os campos com valores positivos.</p>';
        return;
    }

    // 3. CÁLCULOS INICIAIS
    const metaIF = custoMensal * 12 * 25;
    const i = Math.pow(1 + (rentabilidadeAnual / 100), 1/12) - 1; // Taxa de juros mensal real

    if (patrimonioAtual >= metaIF) {
        resultadoDiv.innerHTML = '<h3>Parabéns!</h3><p style="color: green;">Com base nos seus dados, você já atingiu a Independência Financeira!</p>';
        return;
    }
    
    // 4. CÁLCULO DO TEMPO (NPER)
    // Fórmula NPER: n = log( (FV*i + PMT) / (PV*i + PMT) ) / log(1+i)
    const fv = metaIF;
    const pv = patrimonioAtual;
    const pmt = aporteMensal;
    
    const numerador = Math.log((fv * i + pmt) / (pv * i + pmt));
    const denominador = Math.log(1 + i);
    const totalMeses = numerador / denominador;
    
    if (totalMeses <= 0 || !isFinite(totalMeses)) {
            resultadoDiv.innerHTML = '<p style="color: red;">Com os dados informados, o objetivo não seria alcançável. Tente aumentar o aporte ou a rentabilidade.</p>';
        return;
    }

    const anos = Math.floor(totalMeses / 12);
    const meses = Math.ceil(totalMeses % 12);

    // 5. CÁLCULO DOS TOTAIS
    const totalAportado = aporteMensal * totalMeses;
    const totalJuros = metaIF - patrimonioAtual - totalAportado;

    const formatarDinheiro = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    // 6. GERAR GRÁFICO E RESULTADO
    gerarGrafico(anos, patrimonioAtual, aporteMensal, i, metaIF);

    resultadoDiv.innerHTML = `
        <h3>Sua Jornada para a Independência Financeira</h3>
        <p>Sua meta para a IF (o "Número Mágico") é de <strong>${formatarDinheiro(metaIF)}</strong>.</p>
        <div class="resultado-principal" style="font-size: 1.3em; text-align: center; margin: 1em 0;">
            Você atingirá seu objetivo em<br><strong>${anos} anos e ${meses} meses</strong>.
        </div>
        
        <h4>Resumo da sua jornada:</h4>
        <ul>
            <li>Patrimônio Inicial: <span>${formatarDinheiro(patrimonioAtual)}</span></li>
            <li>Total Investido por você: <span>${formatarDinheiro(totalAportado)}</span></li>
            <li>Total Gerado por Juros: <span class="juros">${formatarDinheiro(totalJuros)} ✨</span></li>
        </ul>
        <hr>
        <canvas id="graficoProjecao" style="margin-top: 1rem;"></canvas>
    `;
    
    // A inicialização do gráfico precisa acontecer depois que o canvas é inserido no DOM
    renderizarGrafico();
});

// Objeto global para armazenar os dados do gráfico
const dadosDoGrafico = {};

function gerarGrafico(anos, pv, pmt, i, meta) {
    const labels = [];
    const data = [];
    let valorAtual = pv;

    for (let ano = 0; ano <= anos + 1; ano++) {
        labels.push(`Ano ${ano}`);
        data.push(valorAtual);
        // Calcula o valor para o próximo ano
        for(let mes = 0; mes < 12; mes++) {
            valorAtual = valorAtual * (1 + i) + pmt;
        }
    }

    dadosDoGrafico.labels = labels;
    dadosDoGrafico.data = data;
    dadosDoGrafico.meta = meta;
}

function renderizarGrafico() {
    const ctx = document.getElementById('graficoProjecao').getContext('2d');
    
    if (projectionChart) {
        projectionChart.destroy(); // Destrói o gráfico antigo
    }

    projectionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dadosDoGrafico.labels,
            datasets: [{
                label: 'Seu Patrimônio',
                data: dadosDoGrafico.data,
                backgroundColor: 'rgba(0, 123, 255, 0.2)',
                borderColor: 'rgba(0, 123, 255, 1)',
                borderWidth: 2,
                fill: true,
                tension: 0.1
            }, {
                label: 'Meta de IF',
                data: Array(dadosDoGrafico.labels.length).fill(dadosDoGrafico.meta),
                borderColor: 'rgba(40, 167, 69, 1)',
                borderWidth: 2,
                borderDash: [5, 5],
                pointRadius: 0
            }]
        },
        options: {
            scales: {
                y: {
                    ticks: {
                        callback: function(value, index, values) {
                            return 'R$ ' + (value / 1000) + 'k';
                        }
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.parsed.y);
                            }
                            return label;
                        }
                    }
                }
            }
        }
    });
}