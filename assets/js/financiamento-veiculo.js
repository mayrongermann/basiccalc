document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('financiamento-form');
    if (!form) return;

    const formatarDinheiro = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    form.addEventListener('submit', function(event) {
        event.preventDefault();

        const valorVeiculo = parseFloat(document.getElementById('valorVeiculo').value);
        const valorEntrada = parseFloat(document.getElementById('valorEntrada').value) || 0;
        const taxaJurosMes = parseFloat(document.getElementById('taxaJurosMes').value);
        const prazoMeses = parseInt(document.getElementById('prazoMeses').value);

        const resultadoDiv = document.getElementById('resultado');
        resultadoDiv.style.display = 'block';

        if (isNaN(valorVeiculo) || isNaN(taxaJurosMes) || isNaN(prazoMeses) || valorEntrada >= valorVeiculo) {
            resultadoDiv.innerHTML = '<p style="color: red;">Por favor, preencha os campos com valores válidos.</p>';
            return;
        }

        const valorFinanciado = valorVeiculo - valorEntrada;
        const i = taxaJurosMes / 100; // Juros em formato decimal

        // --- Cálculo Tabela Price ---
        const pmtPrice = valorFinanciado * (i * Math.pow(1 + i, prazoMeses)) / (Math.pow(1 + i, prazoMeses) - 1);
        const totalPagoPrice = pmtPrice * prazoMeses;
        const jurosPrice = totalPagoPrice - valorFinanciado;
        const custoTotalVeiculoPrice = totalPagoPrice + valorEntrada;

        // --- Cálculo Tabela SAC ---
        const amortizacaoSAC = valorFinanciado / prazoMeses;
        const primeiraParcelaSAC = amortizacaoSAC + (valorFinanciado * i);
        const ultimaParcelaSAC = amortizacaoSAC + (amortizacaoSAC * i);
        const jurosSAC = (valorFinanciado * i * (prazoMeses + 1)) / 2;
        const totalPagoSAC = valorFinanciado + jurosSAC;
        const custoTotalVeiculoSAC = totalPagoSAC + valorEntrada;

        // --- Exibição ---
        resultadoDiv.innerHTML = `
            <h3 style="text-align: center;">Comparativo do Financiamento</h3>
            <div style="text-align: center; margin-bottom: 1rem;">
                <p style="margin: 0;"><strong>Valor Financiado:</strong> ${formatarDinheiro(valorFinanciado)}</p>
            </div>
            <div class="comparison-container">
                <div class="result-card">
                    <h4>Tabela Price (Parcelas Fixas)</h4>
                    <p><span>Valor da Parcela:</span> <strong>${formatarDinheiro(pmtPrice)}</strong></p>
                    <p><span>Total de Juros:</span> <span style="color: #dc3545;">${formatarDinheiro(jurosPrice)}</span></p>
                    <p class="total-cost"><span>Custo Total do Veículo:</span> <span>${formatarDinheiro(custoTotalVeiculoPrice)}</span></p>
                </div>
                <div class="result-card">
                    <h4>Tabela SAC (Parcelas Decrescentes)</h4>
                    <p><span>1ª Parcela:</span> <strong>${formatarDinheiro(primeiraParcelaSAC)}</strong></p>
                    <p><span>Última Parcela:</span> <strong>${formatarDinheiro(ultimaParcelaSAC)}</strong></p>
                    <p><span>Total de Juros:</span> <span style="color: green;">${formatarDinheiro(jurosSAC)}</span></p>
                    <p class="total-cost"><span>Custo Total do Veículo:</span> <span>${formatarDinheiro(custoTotalVeiculoSAC)}</span></p>
                </div>
            </div>
            <div style="margin-top: 1.5rem; font-size: 0.9em; text-align: left; line-height: 1.5;">
                <p><strong>Qual é melhor?</strong><br>
                • A <strong>Tabela Price</strong> é ideal se você precisa de uma parcela inicial menor e previsível.<br>
                • A <strong>Tabela SAC</strong> é melhor se você pode pagar uma parcela inicial mais alta, pois você economiza muito em juros no final.</p>
            </div>
        `;
    });
});