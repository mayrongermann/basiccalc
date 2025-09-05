// Funções de cálculo de impostos (reutilizadas da calculadora de salário líquido)
// Tabelas e valores baseados na legislação de Setembro de 2025.
const formatarDinheiro = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function calcularINSS(salario) {
const teto = 8246.68;
salario = Math.min(salario, teto);
let inss = 0;

if (salario > 4173.34) { inss += (Math.min(salario, teto) - 4173.34) * 0.14; }
if (salario > 2782.23) { inss += (Math.min(salario, 4173.34) - 2782.23) * 0.12; }
if (salario > 1556.94) { inss += (Math.min(salario, 2782.23) - 1556.94) * 0.09; }
if (salario > 0) { inss += Math.min(salario, 1556.94) * 0.075; }
return inss;
}

function calcularIRRF(baseCalculo) {
let irrf = 0;
if (baseCalculo > 4664.68) { irrf = (baseCalculo * 0.275) - 896.00; } 
else if (baseCalculo > 3751.05) { irrf = (baseCalculo * 0.225) - 662.77; } 
else if (baseCalculo > 2826.65) { irrf = (baseCalculo * 0.15) - 381.44; } 
else if (baseCalculo > 2259.20) { irrf = (baseCalculo * 0.075) - 169.44; }
return Math.max(0, irrf);
}

document.getElementById('ferias-form').addEventListener('submit', function(event) {
event.preventDefault();

// 1. CAPTURAR VALORES
const salarioBruto = parseFloat(document.getElementById('salarioBruto').value);
const mediaAdicionais = parseFloat(document.getElementById('mediaAdicionais').value) || 0;
const diasFerias = parseInt(document.getElementById('diasFerias').value);
const venderFerias = document.getElementById('venderFerias').checked;
const dependentes = parseInt(document.getElementById('dependentes').value);

const resultadoDiv = document.getElementById('resultado');
resultadoDiv.style.display = 'block';

if (isNaN(salarioBruto) || isNaN(diasFerias)) {
    resultadoDiv.innerHTML = '<p style="color: red;">Por favor, preencha os campos obrigatórios.</p>';
    return;
}

// 2. CÁLCULOS
const salarioBase = salarioBruto + mediaAdicionais;
const valorDia = salarioBase / 30;

const diasAbono = venderFerias ? Math.floor(diasFerias / 3) : 0;
const diasGozo = diasFerias - diasAbono;

const valorFeriasBruto = valorDia * diasGozo;
const tercoConstitucional = (valorDia * diasFerias) / 3; // O terço é sobre o total de dias contratados
const totalBrutoTributavel = valorFeriasBruto + tercoConstitucional;

let totalAbono = 0;
if (venderFerias) {
    const valorAbonoBase = valorDia * diasAbono;
    const tercoAbono = valorAbonoBase / 3;
    totalAbono = valorAbonoBase + tercoAbono; // Abono é isento de impostos
}

// 3. DESCONTOS (Apenas sobre o valor das férias, não sobre o abono)
const descontoINSS = calcularINSS(totalBrutoTributavel);
const baseIRRF = totalBrutoTributavel - descontoINSS - (dependentes * 189.59);
const descontoIRRF = calcularIRRF(baseIRRF);

// 4. RESULTADO FINAL
const liquidoFerias = totalBrutoTributavel - descontoINSS - descontoIRRF;
const totalReceber = liquidoFerias + totalAbono;

// 5. EXIBIÇÃO
resultadoDiv.innerHTML = `
    <h3 style="text-align: center;">Seu Recibo de Férias</h3>
    <ul style="list-style: none; padding: 0;">
        <li style="display: flex; justify-content: space-between; padding: 0.5rem 0;"><span>(+) Valor Férias (${diasGozo} dias):</span> <strong>${formatarDinheiro(valorFeriasBruto)}</strong></li>
        <li style="display: flex; justify-content: space-between; padding: 0.5rem 0;"><span>(+) 1/3 Constitucional:</span> <strong>${formatarDinheiro(tercoConstitucional)}</strong></li>
        ${venderFerias ? `<li style="display: flex; justify-content: space-between; padding: 0.5rem 0;"><span>(+) Abono Pecuniário (Venda):</span> <strong>${formatarDinheiro(totalAbono)}</strong></li>` : ''}
        <hr>
        <li style="display: flex; justify-content: space-between; padding: 0.5rem 0;"><span>(-) INSS sobre Férias:</span> <span style="color: #dc3545;">${formatarDinheiro(descontoINSS)}</span></li>
        <li style="display: flex; justify-content: space-between; padding: 0.5rem 0;"><span>(-) IRRF sobre Férias:</span> <span style="color: #dc3545;">${formatarDinheiro(descontoIRRF)}</span></li>
        <hr>
        <li style="display: flex; justify-content: space-between; padding: 0.8rem 0; font-size: 1.2em;"><strong>(=) LÍQUIDO A RECEBER:</strong> <strong style="color: #28a745;">${formatarDinheiro(totalReceber)}</strong></li>
    </ul>
    <p style="font-size: 0.8em; text-align: center; color: #6c757d; margin-top: 1rem;">O pagamento das férias deve ser feito até 2 dias antes do início do seu descanso.</p>
`;
});
