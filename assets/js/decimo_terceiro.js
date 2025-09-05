
// Funções de cálculo de impostos reutilizadas
const formatarDinheiro = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function calcularINSS(salario) {
    // Tabela e regras de Setembro de 2025
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

document.getElementById('decimo-terceiro-form').addEventListener('submit', function(event) {
    event.preventDefault();

    // 1. CAPTURAR VALORES
    const salarioBruto = parseFloat(document.getElementById('salarioBruto').value);
    const mediaAdicionais = parseFloat(document.getElementById('mediaAdicionais').value) || 0;
    const mesesTrabalhados = parseInt(document.getElementById('mesesTrabalhados').value);
    const primeiraParcelaAdiantada = parseFloat(document.getElementById('primeiraParcela').value) || 0;
    const dependentes = parseInt(document.getElementById('dependentes').value);
    
    const resultadoDiv = document.getElementById('resultado');
    resultadoDiv.style.display = 'block';

    if (isNaN(salarioBruto) || isNaN(mesesTrabalhados)) {
        resultadoDiv.innerHTML = '<p style="color: red;">Por favor, preencha os campos obrigatórios.</p>';
        return;
    }

    // 2. CÁLCULOS
    const salarioBase = salarioBruto + mediaAdicionais;
    const total13Bruto = (salarioBase / 12) * mesesTrabalhados;
    
    const primeiraParcela = primeiraParcelaAdiantada > 0 ? primeiraParcelaAdiantada : total13Bruto / 2;

    // 3. DESCONTOS (calculados sobre o valor BRUTO TOTAL)
    const descontoINSS = calcularINSS(total13Bruto);
    const baseIRRF = total13Bruto - descontoINSS - (dependentes * 189.59);
    const descontoIRRF = calcularIRRF(baseIRRF);
    
    // 4. CÁLCULO DA SEGUNDA PARCELA E TOTAL LÍQUIDO
    const segundaParcelaLiquida = total13Bruto - primeiraParcela - descontoINSS - descontoIRRF;
    const totalLiquido = primeiraParcela + segundaParcelaLiquida;

    // 5. EXIBIÇÃO
    resultadoDiv.innerHTML = `
        <h3 style="text-align: center;">Seu Extrato do 13º Salário</h3>
        <ul style="list-style: none; padding: 0;">
            <li style="display: flex; justify-content: space-between; padding: 0.5rem 0;"><span>(+) 13º Salário Bruto Total:</span> <strong>${formatarDinheiro(total13Bruto)}</strong></li>
            <hr>
            <li style="display: flex; justify-content: space-between; padding: 0.5rem 0;"><span><strong>1ª Parcela (Adiantamento):</strong></span> <strong>${formatarDinheiro(primeiraParcela)}</strong></li>
            <small>Sem descontos nesta parcela.</small>
            <hr style="margin-top: 1rem;">
            <li style="display: flex; justify-content: space-between; padding: 0.5rem 0;"><span>(+) Saldo Bruto para 2ª Parcela:</span> <strong>${formatarDinheiro(total13Bruto - primeiraParcela)}</strong></li>
            <li style="display: flex; justify-content: space-between; padding: 0.5rem 0;"><span>(-) Desconto INSS:</span> <span style="color: #dc3545;">${formatarDinheiro(descontoINSS)}</span></li>
            <li style="display: flex; justify-content: space-between; padding: 0.5rem 0;"><span>(-) Desconto IRRF:</span> <span style="color: #dc3545;">${formatarDinheiro(descontoIRRF)}</span></li>
            <li style="display: flex; justify-content: space-between; padding: 0.5rem 0;"><span><strong>(=) Líquido da 2ª Parcela:</strong></span> <strong>${formatarDinheiro(segundaParcelaLiquida)}</strong></li>
            <hr>
            <li style="display: flex; justify-content: space-between; padding: 0.8rem 0; font-size: 1.2em;"><strong>TOTAL LÍQUIDO (1ª + 2ª):</strong> <strong style="color: #28a745;">${formatarDinheiro(totalLiquido)}</strong></li>
        </ul>
        <p style="font-size: 0.8em; text-align: center; color: #6c757d; margin-top: 1rem;">A 1ª parcela deve ser paga até 30 de Novembro e a 2ª até 20 de Dezembro.</p>
    `;
});