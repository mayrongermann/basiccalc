// Arquivo: assets/js/dividas.js (VERSÃO CORRIGIDA)

// Garante que o código só rode depois que o HTML for carregado
document.addEventListener('DOMContentLoaded', function() {
    const dividasForm = document.getElementById('dividas-form');
    if (!dividasForm) return;

    let contadorDivida = 0;

    function adicionarDivida() {
        contadorDivida++;
        const div = document.createElement('div');
        div.className = 'divida-item';
        div.style.border = '1px solid #ddd';
        div.style.padding = '1rem';
        div.style.marginBottom = '1rem';
        div.style.borderRadius = '5px';

        div.innerHTML = `
            <h5>Dívida #${contadorDivida}</h5>
            <div class="input-group">
                <label>Nome da Dívida</label>
                <input type="text" class="nome-divida" placeholder="Ex: Cartão de Crédito" required>
            </div>
            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                <div class="input-group" style="flex: 1; min-width: 120px;">
                    <label>Saldo Devedor (R$)</label>
                    <input type="number" step="0.01" class="saldo-divida" required>
                </div>
                <div class="input-group" style="flex: 1; min-width: 120px;">
                    <label>Juros Mensais (%)</label>
                    <input type="number" step="0.01" class="juros-divida" required>
                </div>
                <div class="input-group" style="flex: 1; min-width: 120px;">
                    <label>Pag. Mínimo (R$)</label>
                    <input type="number" step="0.01" class="minimo-divida" required>
                </div>
            </div>
        `;
        document.getElementById('lista-dividas').appendChild(div);
    }

    document.getElementById('add-divida-btn').addEventListener('click', adicionarDivida);
    adicionarDivida(); // Adiciona a primeira dívida ao carregar a página

    function simularPlano(dividas, orcamentoTotal, metodo) {
        if (metodo === 'BOLA_DE_NEVE') {
            dividas.sort((a, b) => a.saldo - b.saldo);
        } else if (metodo === 'AVALANCHA') {
            dividas.sort((a, b) => b.juros - a.juros);
        }

        let meses = 0;
        let jurosTotais = 0;
        
        while (dividas.some(d => d.saldo > 0) && meses < 600) {
            meses++;
            let pagamentosCongelados = dividas.filter(d => d.saldo <= 0).reduce((acc, d) => acc + d.minimoOriginal, 0);
            let somaMinimosDoMes = dividas.reduce((acc, d) => d.saldo > 0 ? acc + d.minimo : acc, 0);
            let pagamentoExtra = orcamentoTotal - somaMinimosDoMes + pagamentosCongelados;

            for (const d of dividas) {
                if (d.saldo > 0) {
                    const jurosDoMes = d.saldo * (d.juros / 100);
                    d.saldo += jurosDoMes;
                    jurosTotais += jurosDoMes;
                }
            }
            
            let extraAplicado = false;
            for (const d of dividas) {
                if (d.saldo > 0) {
                    let pagamentoEsteMes = d.minimo;
                    if (!extraAplicado && pagamentoExtra > 0) {
                        pagamentoEsteMes += pagamentoExtra;
                        extraAplicado = true;
                    }
                    d.saldo -= pagamentoEsteMes;
                }
            }
        }
        return { meses, jurosTotais };
    }

    dividasForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const orcamentoTotal = parseFloat(document.getElementById('orcamentoTotal').value);
        const dividasItens = document.querySelectorAll('.divida-item');
        const dividas = [];

        dividasItens.forEach(item => {
            const minimo = parseFloat(item.querySelector('.minimo-divida').value);
            dividas.push({
                nome: item.querySelector('.nome-divida').value,
                saldo: parseFloat(item.querySelector('.saldo-divida').value),
                juros: parseFloat(item.querySelector('.juros-divida').value),
                minimo: minimo,
                minimoOriginal: minimo // Guarda o mínimo original
            });
        });

        const somaMinimos = dividas.reduce((acc, d) => acc + d.minimo, 0);
        const resultadoDiv = document.getElementById('resultado');
        resultadoDiv.style.display = 'block';

        if (orcamentoTotal < somaMinimos) {
            resultadoDiv.innerHTML = `<p style="color: red;">Seu orçamento total é menor que a soma dos pagamentos mínimos. O plano é inviável.</p>`;
            return;
        }

        // CORREÇÃO AQUI: Criando uma cópia "limpa" do array para cada simulação
        const resultadoNeve = simularPlano(JSON.parse(JSON.stringify(dividas)), orcamentoTotal, 'BOLA_DE_NEVE');
        const resultadoAvalancha = simularPlano(JSON.parse(JSON.stringify(dividas)), orcamentoTotal, 'AVALANCHA');
        const resultadoMinimo = simularPlano(JSON.parse(JSON.stringify(dividas)), somaMinimos, 'NENHUM');

        const formatarDinheiro = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const formatarTempo = (meses) => {
            if (meses === 0) return '0 meses';
            const anos = Math.floor(meses / 12);
            const mesesRestantes = Math.ceil(meses % 12);
            let resultado = '';
            if (anos > 0) resultado += `${anos} ${anos > 1 ? 'anos' : 'ano'}`;
            if (mesesRestantes > 0) resultado += ` e ${mesesRestantes} ${mesesRestantes > 1 ? 'meses' : 'mês'}`;
            return resultado.trim();
        };

        resultadoDiv.innerHTML = `
            <h3>Seu Plano de Batalha Contra as Dívidas</h3>
            <p>Comparamos duas estratégias para você. Se pagasse apenas o mínimo, levaria <strong>${formatarTempo(resultadoMinimo.meses)}</strong> e pagaria <strong>${formatarDinheiro(resultadoMinimo.jurosTotais)}</strong> em juros.</p>
            <div style="display: flex; gap: 2rem; margin-top: 1.5rem; flex-wrap: wrap;">
                
                <div style="flex: 1; padding: 1rem; border: 2px solid var(--primary-color); border-radius: 8px;">
                    <h4>❄️ Plano Bola de Neve</h4>
                    <p style="font-size: 0.9em;">Foco em quitar a menor dívida primeiro para vitórias rápidas e motivação.</p>
                    <p><strong>Tempo para liberdade:</strong> ${formatarTempo(resultadoNeve.meses)}</p>
                    <p><strong>Total de juros pagos:</strong> ${formatarDinheiro(resultadoNeve.jurosTotais)}</p>
                    <p style="color: green;"><strong>Economia de Juros: ${formatarDinheiro(resultadoMinimo.jurosTotais - resultadoNeve.jurosTotais)}</strong></p>
                </div>

                <div style="flex: 1; padding: 1rem; border: 2px solid var(--secondary-color); border-radius: 8px;">
                    <h4>🔥 Plano Avalancha</h4>
                    <p style="font-size: 0.9em;">Foco em quitar a dívida com maior juros primeiro para economizar mais dinheiro.</p>
                    <p><strong>Tempo para liberdade:</strong> ${formatarTempo(resultadoAvalancha.meses)}</p>
                    <p><strong>Total de juros pagos:</strong> ${formatarDinheiro(resultadoAvalancha.jurosTotais)}</p>
                    <p style="color: green;"><strong>Economia de Juros: ${formatarDinheiro(resultadoMinimo.jurosTotais - resultadoAvalancha.jurosTotais)}</strong></p>
                </div>
            </div>
            <div style="margin-top: 1.5rem; text-align: center; background-color: #e9ecef; padding: 1rem; border-radius: 5px;">
                <p><strong>Recomendação:</strong> O método <strong>Avalancha</strong> economiza mais dinheiro. O método <strong>Bola de Neve</strong> pode ser mais motivador. Escolha o que funciona melhor para você!</p>
            </div>
        `;
    });
});