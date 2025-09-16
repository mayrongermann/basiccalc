// Arquivo: assets/js/dividas.js (VERSÃO FINAL COM PLANO DE AÇÃO INTELIGENTE)

document.addEventListener('DOMContentLoaded', function() {
    const dividasForm = document.getElementById('dividas-form');
    if (!dividasForm) return;

    // ... (função adicionarDivida continua a mesma) ...
    let contadorDivida = 0;
    function adicionarDivida() {
        contadorDivida++;
        const div = document.createElement('div');
        div.className = 'divida-item';
        div.style.border = '1px solid #ddd'; div.style.padding = '1rem';
        div.style.marginBottom = '1rem'; div.style.borderRadius = '5px';
        div.innerHTML = `<h5>Dívida #${contadorDivida}</h5><div class="input-group"><label>Nome da Dívida</label><input type="text" class="nome-divida" placeholder="Ex: Cartão de Crédito" required></div><div style="display: flex; gap: 1rem; flex-wrap: wrap;"><div class="input-group" style="flex: 1; min-width: 120px;"><label>Saldo Devedor (R$)</label><input type="number" step="0.01" class="saldo-divida" required></div><div class="input-group" style="flex: 1; min-width: 120px;"><label>Juros Mensais (%)</label><input type="number" step="0.01" class="juros-divida" required></div><div class="input-group" style="flex: 1; min-width: 120px;"><label>Pag. Mínimo (R$)</label><input type="number" step="0.01" class="minimo-divida" required></div></div>`;
        document.getElementById('lista-dividas').appendChild(div);
    }
    document.getElementById('add-divida-btn').addEventListener('click', adicionarDivida);
    adicionarDivida();

    function simularPlano(dividas, orcamentoTotal, metodo) {
        // ... (a função simularPlano está correta e continua a mesma) ...
        if (metodo === 'BOLA_DE_NEVE') { dividas.sort((a, b) => a.saldo - b.saldo); } 
        else if (metodo === 'AVALANCHA') { dividas.sort((a, b) => b.juros - a.juros); }
        let meses = 0; let jurosTotais = 0; const LIMITE_MESES = 600;
        while (dividas.some(d => d.saldo > 0) && meses < LIMITE_MESES) {
            meses++;
            let jurosDoMesTotal = 0;
            dividas.forEach(d => { if(d.saldo > 0) jurosDoMesTotal += d.saldo * (d.juros / 100); });
            if (orcamentoTotal < jurosDoMesTotal && meses > 1) { return { meses: LIMITE_MESES, jurosTotais: Infinity, quitado: false }; }
            dividas.forEach(d => { if (d.saldo > 0) { const jurosDoMes = d.saldo * (d.juros / 100); d.saldo += jurosDoMes; jurosTotais += jurosDoMes; } });
            let orcamentoRestante = orcamentoTotal;
            let dividaAlvo = dividas.find(d => d.saldo > 0);
            dividas.forEach(d => { if (d.saldo > 0 && d !== dividaAlvo) { const pagamento = Math.min(d.saldo, d.minimo); d.saldo -= pagamento; orcamentoRestante -= pagamento; } });
            if (dividaAlvo) { const pagamentoAlvo = Math.min(dividaAlvo.saldo, orcamentoRestante); dividaAlvo.saldo -= pagamentoAlvo; }
        }
        const quitado = meses < LIMITE_MESES;
        return { meses, jurosTotais, quitado };
    }

    dividasForm.addEventListener('submit', function(event) {
        event.preventDefault();

        // --- COLETA E VALIDAÇÃO ---
        const orcamentoTotal = parseFloat(document.getElementById('orcamentoTotal').value);
        const dividasItens = document.querySelectorAll('.divida-item');
        const dividas = [];
        dividasItens.forEach(item => { /* ... (coleta de dados) ... */
            dividas.push({
                nome: item.querySelector('.nome-divida').value || `Dívida #${dividas.length + 1}`,
                saldo: parseFloat(item.querySelector('.saldo-divida').value),
                juros: parseFloat(item.querySelector('.juros-divida').value),
                minimo: parseFloat(item.querySelector('.minimo-divida').value)
            });
        });
        const somaMinimos = dividas.reduce((acc, d) => acc + d.minimo, 0);
        const resultadoDiv = document.getElementById('resultado');
        resultadoDiv.style.display = 'block';
        if (orcamentoTotal < somaMinimos) { /* ... (validação) ... */ return; }

        // --- SIMULAÇÃO ---
        const resultadoNeve = simularPlano(JSON.parse(JSON.stringify(dividas)), orcamentoTotal, 'BOLA_DE_NEVE');
        const resultadoAvalancha = simularPlano(JSON.parse(JSON.stringify(dividas)), orcamentoTotal, 'AVALANCHA');
        const resultadoMinimo = simularPlano(JSON.parse(JSON.stringify(dividas)), somaMinimos, 'NENHUM');

        // --- FORMATAÇÃO E MONTAGEM DO HTML ---
        const formatarDinheiro = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const formatarTempo = (meses) => { /* ... (função formatarTempo) ... */ };

        // ==================================================================
        // NOVA LÓGICA PARA CRIAR O PLANO DE AÇÃO INTELIGENTE
        // ==================================================================
        function gerarPlanoDeAcaoHtml(dividasOriginais, orcamentoTotal, metodo, corDestaque) {
            const dividasOrdenadas = [...dividasOriginais].sort((a, b) => {
                if (metodo === 'BOLA_DE_NEVE') return a.saldo - b.saldo;
                if (metodo === 'AVALANCHA') return b.juros - a.juros;
                return 0;
            });
            
            const somaMinimos = dividasOriginais.reduce((acc, d) => acc + d.minimo, 0);
            let dinheiroExtra = orcamentoTotal - somaMinimos;

            const pagamentosDoMes = {};
            dividasOriginais.forEach(d => pagamentosDoMes[d.nome] = d.minimo);

            for (const divida of dividasOrdenadas) {
                if (dinheiroExtra <= 0) break;
                
                const saldoAposMinimo = divida.saldo - divida.minimo;
                const pagamentoExtraPossivel = Math.min(dinheiroExtra, saldoAposMinimo);
                
                pagamentosDoMes[divida.nome] += pagamentoExtraPossivel;
                dinheiroExtra -= pagamentoExtraPossivel;
            }

            return `
                <ul style="list-style: none; padding: 0;">
                    ${dividasOriginais.map(d => {
                        const ehAlvo = pagamentosDoMes[d.nome] > d.minimo;
                        return `
                        <li style="padding: 0.5rem 0; border-bottom: 1px solid #eee;">
                            ${d.nome}: 
                            <strong style="float: right; color: ${ehAlvo ? corDestaque : 'inherit'}">
                                ${formatarDinheiro(pagamentosDoMes[d.nome])}
                                ${ehAlvo ? '🎯' : ''}
                            </strong>
                        </li>`
                    }).join('')}
                </ul>`;
        }
        
        const planoAcaoNeveHtml = gerarPlanoDeAcaoHtml(dividas, orcamentoTotal, 'BOLA_DE_NEVE', 'var(--primary-color)');
        const planoAcaoAvalanchaHtml = gerarPlanoDeAcaoHtml(dividas, orcamentoTotal, 'AVALANCHA', 'var(--secondary-color)');

        // (Resto do código de montagem do HTML do resultado)
        let baselineHtml = '';
        if (resultadoMinimo.quitado) { /* ... */ } else { /* ... */ }
        
        resultadoDiv.innerHTML = `
            <h3>1. Escolha sua Estratégia</h3>
            <p>Comparamos dois planos para você quitar suas dívidas com seu orçamento de <strong>${formatarDinheiro(orcamentoTotal)}</strong>.</p>
            ${baselineHtml}
            <div style="display: flex; gap: 2rem; margin-top: 1.5rem; flex-wrap: wrap;">
                <div style="flex: 1; padding: 1rem; border: 2px solid var(--primary-color); border-radius: 8px;">
                     <h4>❄️ Plano Bola de Neve</h4>
                     <p><strong>Tempo para liberdade:</strong> ${formatarTempo(resultadoNeve.meses)}</p>
                     <p><strong>Total de juros pagos:</strong> ${formatarDinheiro(resultadoNeve.jurosTotais)}</p>
                </div>
                <div style="flex: 1; padding: 1rem; border: 2px solid var(--secondary-color); border-radius: 8px;">
                     <h4>🔥 Plano Avalancha</h4>
                     <p><strong>Tempo para liberdade:</strong> ${formatarTempo(resultadoAvalancha.meses)}</p>
                     <p><strong>Total de juros pagos:</strong> ${formatarDinheiro(resultadoAvalancha.jurosTotais)}</p>
                </div>
            </div>

            <hr style="margin: 2rem 0;">

            <h3>2. Seu Plano de Ação para o Próximo Mês</h3>
            <div style="display: flex; gap: 2rem; margin-top: 1.5rem; flex-wrap: wrap; text-align: left;">
                <div style="flex: 1;">
                    <h4>❄️ Pagamentos (Bola de Neve)</h4>
                    ${planoAcaoNeveHtml}
                </div>
                <div style="flex: 1;">
                    <h4>🔥 Pagamentos (Avalancha)</h4>
                    ${planoAcaoAvalanchaHtml}
                </div>
            </div>
        `;
    });
});