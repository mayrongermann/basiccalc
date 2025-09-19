    document.addEventListener('DOMContentLoaded', function() {
        const form = document.getElementById('amortizacao-form');
        if (!form) return;

        const formatarDinheiro = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const formatarTempo = (meses) => {
            if (!isFinite(meses) || meses <= 0) return '0 meses';
            const anos = Math.floor(meses / 12);
            const mesesRestantes = Math.round(meses % 12);
            if (mesesRestantes === 12) return `${anos + 1} ${anos + 1 > 1 ? 'anos' : 'ano'}`;
            const partes = [];
            if (anos > 0) partes.push(`${anos} ${anos > 1 ? 'anos' : 'ano'}`);
            if (mesesRestantes > 0) partes.push(`${mesesRestantes} ${mesesRestantes > 1 ? 'meses' : 'mês'}`);
            return partes.join(' e ');
        };

        function simularAmortizacao(saldoInicial, taxaJuros, pagamentoMensal, pagamentoExtra = 0) {
            let saldo = saldoInicial;
            let meses = 0;
            let jurosTotais = 0;
            const tabela = [];
            const i = taxaJuros / 100;

            while (saldo > 0 && meses < 600) {
                meses++;
                const jurosDoMes = saldo * i;
                jurosTotais += jurosDoMes;

                const pagamentoPrincipal = pagamentoMensal - jurosDoMes;
                const amortizacaoTotal = pagamentoPrincipal + pagamentoExtra;
                
                if (amortizacaoTotal <= 0) { // Se o pagamento mal cobre os juros
                    return { meses: Infinity, jurosTotais: Infinity, tabela: [] };
                }

                const saldoAnterior = saldo;
                saldo -= amortizacaoTotal;
                
                tabela.push({
                    mes: meses,
                    pagamento: pagamentoMensal + pagamentoExtra,
                    juros: jurosDoMes,
                    principal: amortizacaoTotal,
                    saldoFinal: Math.max(0, saldo)
                });

                if (saldo < 0) {
                        // Ajusta o último pagamento para não pagar a mais
                    const ultimoPagamento = pagamentoMensal + pagamentoExtra + saldo; // saldo é negativo
                    tabela[tabela.length - 1].pagamento = ultimoPagamento;
                }
            }
            return { meses, jurosTotais, tabela };
        }

        form.addEventListener('submit', function(event) {
            event.preventDefault();

            const saldoDevedor = parseFloat(document.getElementById('saldoDevedor').value);
            const taxaJurosMes = parseFloat(document.getElementById('taxaJurosMes').value);
            const pagamentoMensal = parseFloat(document.getElementById('pagamentoMensal').value);
            const pagamentoExtra = parseFloat(document.getElementById('pagamentoExtra').value) || 0;
            
            const resultadoDiv = document.getElementById('resultado');
            resultadoDiv.style.display = 'block';

            if (isNaN(saldoDevedor) || isNaN(taxaJurosMes) || isNaN(pagamentoMensal)) {
                resultadoDiv.innerHTML = '<p style="color: red;">Preencha os campos obrigatórios.</p>';
                return;
            }

            const resultadoNormal = simularAmortizacao(saldoDevedor, taxaJurosMes, pagamentoMensal, 0);
            const resultadoExtra = simularAmortizacao(saldoDevedor, taxaJurosMes, pagamentoMensal, pagamentoExtra);

            if (!isFinite(resultadoNormal.meses)) {
                resultadoDiv.innerHTML = '<p style="color: red;">Atenção: A parcela mensal não é suficiente para cobrir os juros. A dívida nunca será quitada.</p>';
                return;
            }
            
            const mesesEconomizados = resultadoNormal.meses - resultadoExtra.meses;
            const jurosEconomizados = resultadoNormal.jurosTotais - resultadoExtra.jurosTotais;

            const gerarTabelaHtml = (tabela) => {
                    return `<div style="max-height: 250px; overflow-y: auto; border: 1px solid #eee; margin-top: 10px;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.8em;">
                        <thead><tr style="text-align: left;"><th>Mês</th><th>Juros</th><th>Amortização</th><th>Saldo Devedor</th></tr></thead>
                        <tbody>
                            ${tabela.map(p => `
                                <tr style="border-top: 1px solid #eee;">
                                    <td>${p.mes}</td><td>${formatarDinheiro(p.juros)}</td>
                                    <td>${formatarDinheiro(p.principal)}</td><td>${formatarDinheiro(p.saldoFinal)}</td>
                                </tr>`).join('')}
                        </tbody>
                    </table>
                </div>`;
            };

            resultadoDiv.innerHTML = `
                <div class="comparison-container">
                    <div class="result-card">
                        <h4>🗓️ Pagamento Normal</h4>
                        <p><strong>Tempo para Quitar:</strong> ${formatarTempo(resultadoNormal.meses)}</p>
                        <p><strong>Total de Juros Pagos:</strong> ${formatarDinheiro(resultadoNormal.jurosTotais)}</p>
                        <details style="cursor: pointer;"><summary style="font-size: 0.9em;">Ver tabela de amortização</summary>${gerarTabelaHtml(resultadoNormal.tabela)}</details>
                    </div>
                    <div class="result-card">
                        <h4>🚀 Com Pagamento Extra</h4>
                        <p><strong>Tempo para Quitar:</strong> ${formatarTempo(resultadoExtra.meses)}</p>
                        <p><strong>Total de Juros Pagos:</strong> ${formatarDinheiro(resultadoExtra.jurosTotais)}</p>
                        <details style="cursor: pointer;"><summary style="font-size: 0.9em;">Ver tabela de amortização</summary>${gerarTabelaHtml(resultadoExtra.tabela)}</details>
                    </div>
                </div>
                ${pagamentoExtra > 0 ? `
                <div class="savings-box">
                    <h3>🎉 Sua Economia 🎉</h3>
                    <p>Amortizando ${formatarDinheiro(pagamentoExtra)} a mais todo mês, você quitará sua dívida <strong>${formatarTempo(mesesEconomizados)} mais cedo</strong> e economizará <strong>${formatarDinheiro(jurosEconomizados)}</strong> em juros!</p>
                </div>` : ''}
            `;
        });
    });