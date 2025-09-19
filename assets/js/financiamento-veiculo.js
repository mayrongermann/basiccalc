document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('financiamento-form');
            if (!form) return;

            // --- Elementos do Formulário FIPE ---
            const selectMarcas = document.getElementById('marcas');
            const selectModelos = document.getElementById('modelos');
            const selectAnos = document.getElementById('anos');
            const modelosGroup = document.getElementById('modelos-group');
            const anosGroup = document.getElementById('anos-group');
            const inputValorVeiculo = document.getElementById('valorVeiculo');
            const resultadoDiv = document.getElementById('resultado');

            // URL da API da Tabela FIPE (projeto de deividfortuna)
            const API_URL = "https://parallelum.com.br/fipe/api/v1/carros";

            // 1. CARREGAR AS MARCAS QUANDO A PÁGINA ABRIR
            async function carregarMarcas() {
                try {
                    const response = await fetch(`${API_URL}/marcas`);
                    const marcas = await response.json();
                    selectMarcas.innerHTML = '<option value="">Selecione a Marca</option>';
                    marcas.forEach(marca => {
                        selectMarcas.add(new Option(marca.nome, marca.codigo));
                    });
                } catch (error) {
                    console.error("Erro ao carregar marcas:", error);
                    selectMarcas.innerHTML = '<option value="">Erro ao carregar</option>';
                }
            }
            
            // 2. ESCUTAR MUDANÇAS NA MARCA PARA CARREGAR OS MODELOS
            selectMarcas.addEventListener('change', async function() {
                const marcaId = this.value;
                modelosGroup.style.display = 'none';
                anosGroup.style.display = 'none';
                selectModelos.innerHTML = '';
                inputValorVeiculo.value = '';
                resultadoDiv.style.display = 'none';

                if (!marcaId) return;

                selectModelos.innerHTML = '<option>Carregando modelos...</option>';
                modelosGroup.style.display = 'block';

                try {
                    const response = await fetch(`${API_URL}/marcas/${marcaId}/modelos`);
                    const data = await response.json();
                    selectModelos.innerHTML = '<option value="">Selecione o Modelo</option>';
                    data.modelos.forEach(modelo => {
                        selectModelos.add(new Option(modelo.nome, modelo.codigo));
                    });
                } catch (error) {
                    console.error("Erro ao carregar modelos:", error);
                }
            });

            // 3. ESCUTAR MUDANÇAS NO MODELO PARA CARREGAR OS ANOS
            selectModelos.addEventListener('change', async function() {
                const marcaId = selectMarcas.value;
                const modeloId = this.value;
                anosGroup.style.display = 'none';
                selectAnos.innerHTML = '';
                inputValorVeiculo.value = '';
                resultadoDiv.style.display = 'none';

                if (!modeloId) return;

                selectAnos.innerHTML = '<option>Carregando anos...</option>';
                anosGroup.style.display = 'block';

                try {
                    const response = await fetch(`${API_URL}/marcas/${marcaId}/modelos/${modeloId}/anos`);
                    const anos = await response.json();
                    selectAnos.innerHTML = '<option value="">Selecione o Ano</option>';
                    anos.forEach(ano => {
                        selectAnos.add(new Option(ano.nome, ano.codigo));
                    });
                } catch (error) {
                    console.error("Erro ao carregar anos:", error);
                }
            });

            // 4. ESCUTAR MUDANÇAS NO ANO PARA BUSCAR O PREÇO FINAL
            selectAnos.addEventListener('change', async function() {
                const marcaId = selectMarcas.value;
                const modeloId = selectModelos.value;
                const anoId = this.value;
                inputValorVeiculo.value = '';
                resultadoDiv.style.display = 'none';

                if (!anoId) return;

                try {
                    const response = await fetch(`${API_URL}/marcas/${marcaId}/modelos/${modeloId}/anos/${anoId}`);
                    const veiculo = await response.json();
                    
                    const valorNumerico = parseFloat(veiculo.Valor.replace('R$ ', '').replace(/\./g, '').replace(',', '.'));
                    inputValorVeiculo.value = valorNumerico.toFixed(2);

                } catch (error) {
                    console.error("Erro ao carregar valor do veículo:", error);
                }
            });
            
            // --- LÓGICA DO CÁLCULO DE FINANCIAMENTO ---
            const formatarDinheiro = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            form.addEventListener('submit', function(event) {
                event.preventDefault();
                
                const valorVeiculo = parseFloat(document.getElementById('valorVeiculo').value);
                const valorEntrada = parseFloat(document.getElementById('valorEntrada').value) || 0;
                const taxaJurosMes = parseFloat(document.getElementById('taxaJurosMes').value);
                const prazoMeses = parseInt(document.getElementById('prazoMeses').value);

                resultadoDiv.style.display = 'block';

                if (isNaN(valorVeiculo) || valorVeiculo <= 0 || isNaN(taxaJurosMes) || isNaN(prazoMeses) || valorEntrada >= valorVeiculo || prazoMeses <= 0) {
                    resultadoDiv.innerHTML = '<p style="color: red;">Por favor, selecione um veículo e preencha os dados do financiamento.</p>';
                    return;
                }

                const valorFinanciado = valorVeiculo - valorEntrada;
                const i = taxaJurosMes / 100;
                
                const pmtPrice = valorFinanciado * (i * Math.pow(1 + i, prazoMeses)) / (Math.pow(1 + i, prazoMeses) - 1);
                const totalPagoPrice = pmtPrice * prazoMeses;
                const jurosPrice = totalPagoPrice - valorFinanciado;
                const custoTotalVeiculoPrice = totalPagoPrice + valorEntrada;
                
                const amortizacaoSAC = valorFinanciado / prazoMeses;
                const primeiraParcelaSAC = amortizacaoSAC + (valorFinanciado * i);
                const ultimaParcelaSAC = amortizacaoSAC + (amortizacaoSAC * i);
                const jurosSAC = (valorFinanciado * i * (prazoMeses + 1)) / 2;
                const totalPagoSAC = valorFinanciado + jurosSAC;
                const custoTotalVeiculoSAC = totalPagoSAC + valorEntrada;
                
                resultadoDiv.innerHTML = `
                    <h3 style="text-align: center;">Comparativo do Financiamento</h3>
                    <div style="text-align: center; margin-bottom: 1rem; border-bottom: 1px solid #eee; padding-bottom: 1rem;">
                        <p style="margin: 0;"><strong>Valor Financiado:</strong> ${formatarDinheiro(valorFinanciado)}</p>
                    </div>
                    <div class="comparison-container">
                        <div class="result-card">
                            <h4>Tabela Price</h4>
                            <p class="main-value"><span>Parcelas Fixas:</span> <strong>${formatarDinheiro(pmtPrice)}</strong></p>
                            <hr><p><span>Total de Juros Pagos:</span> <span style="color: #dc3545;">${formatarDinheiro(jurosPrice)}</span></p>
                            <p class="total-cost"><span>Custo Total do Veículo:</span> <span>${formatarDinheiro(custoTotalVeiculoPrice)}</span></p>
                        </div>
                        <div class="result-card">
                            <h4>Tabela SAC</h4>
                            <p class="main-value"><span>1ª Parcela:</span> <strong>${formatarDinheiro(primeiraParcelaSAC)}</strong></p>
                            <p><span>Última Parcela:</span> <strong>${formatarDinheiro(ultimaParcelaSAC)}</strong></p>
                            <hr><p><span>Total de Juros Pagos:</span> <span style="color: green;">${formatarDinheiro(jurosSAC)}</span></p>
                            <p class="total-cost"><span>Custo Total do Veículo:</span> <span>${formatarDinheiro(custoTotalVeiculoSAC)}</span></p>
                        </div>
                    </div>
                    <div style="margin-top: 1.5rem; font-size: 0.9em; text-align: left; line-height: 1.5;">
                        <p><strong>Qual é melhor?</strong><br>• A <strong>Tabela Price</strong> é ideal se você precisa de uma parcela inicial menor e que não mude de valor.<br>• A <strong>Tabela SAC</strong> é melhor se você pode pagar uma parcela inicial mais alta, pois você economiza muito em juros no longo prazo.</p>
                    </div>
                `;
            });

            // Inicia o processo carregando as marcas
            carregarMarcas();
        });