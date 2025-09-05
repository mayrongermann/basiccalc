document.getElementById('metas-form').addEventListener('submit', function(event) {
event.preventDefault(); // Impede o recarregamento da página

// 1. CAPTURAR OS VALORES DOS INPUTS
const objetivo = document.getElementById('objetivo').value;
const valorFuturo = parseFloat(document.getElementById('valorFuturo').value);
const valorInicial = parseFloat(document.getElementById('valorInicial').value);
const prazoAnos = parseInt(document.getElementById('prazoAnos').value) || 0;
const prazoMeses = parseInt(document.getElementById('prazoMeses').value) || 0;
const rentabilidade = parseFloat(document.getElementById('rentabilidade').value);

// 2. PREPARAR AS VARIÁVEIS PARA O CÁLCULO
const n = (prazoAnos * 12) + prazoMeses; // Prazo total em meses
const i = rentabilidade / 100; // Taxa de juros em formato decimal

const resultadoDiv = document.getElementById('resultado');

// 3. VALIDAÇÃO DOS DADOS
if (isNaN(valorFuturo) || isNaN(rentabilidade) || isNaN(valorInicial)) {
        resultadoDiv.innerHTML = `<p style="color: red;">Por favor, preencha todos os campos com valores válidos.</p>`;
        return;
}
if (n <= 0) {
    resultadoDiv.innerHTML = `<p style="color: red;">Por favor, insira um prazo maior que zero.</p>`;
    return;
}
if (valorFuturo <= valorInicial) {
    resultadoDiv.innerHTML = `<p style="color: green;">Parabéns! Você já alcançou ou ultrapassou o valor do seu objetivo.</p>`;
    return;
}

// 4. REALIZAR O CÁLCULO FINANCEIRO
let pmt; // Valor do depósito mensal

if (i === 0) {
    pmt = (valorFuturo - valorInicial) / n;
} else {
    const termoComum = Math.pow(1 + i, n);
    pmt = (valorFuturo - valorInicial * termoComum) / ((termoComum - 1) / i);
}

if (pmt <= 0) {
    const valorInicialFormatado = valorInicial.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    resultadoDiv.innerHTML = `
        <h3>Plano para ${objetivo || 'seu objetivo'}!</h3>
        <p style="color: green;">Ótima notícia! O valor que você já tem guardado (${valorInicialFormatado}) renderá o suficiente para atingir sua meta sem novos depósitos.</p>
    `;
    return;
}

// 5. CALCULAR O RESUMO FINANCEIRO
const totalDepositado = pmt * n;
const totalJuros = valorFuturo - valorInicial - totalDepositado;

const formatarDinheiro = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

// 6. MONTAR E EXIBIR O HTML DO RESULTADO
resultadoDiv.innerHTML = `
    <h3>Seu Plano para ${objetivo || 'seu objetivo'}!</h3>
    <p>Para alcançar sua meta de ${formatarDinheiro(valorFuturo)} em ${prazoAnos} anos e ${prazoMeses} meses, você precisará guardar:</p>
    
    <h4 style="text-align: center; font-size: 1.5em; margin: 1em 0;">${formatarDinheiro(pmt)} por mês.</h4>

    <p><b>Resumo do Plano:</b></p>
    <ul>
        <li>Valor Inicial: <b>${formatarDinheiro(valorInicial)}</b></li>
        <li>Total Depositado por você: <b>${formatarDinheiro(totalDepositado)}</b></li>
        <li>Juros a seu favor: <b style="color: green;">${formatarDinheiro(totalJuros)} ✨</b></li>
        <li>Total Final: <b>${formatarDinheiro(valorFuturo)}</b></li>
                    </ul>`;
    });