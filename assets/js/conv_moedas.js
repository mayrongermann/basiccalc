        document.addEventListener('DOMContentLoaded', function() {
            // --- CONFIGURAÇÃO ---
            const apiKey = '77de3f775c26641bba520b7a'; // Sua chave da API
            
            const fromSelect = document.getElementById('from-currency');
            const toSelect = document.getElementById('to-currency');
            const amountInput = document.getElementById('amount');
            const swapButton = document.getElementById('swap-currency-button');
            const resultadoDiv = document.getElementById('resultado');

            const moedasPrincipais = {
                "BRL": "Real Brasileiro", "USD": "Dólar Americano", "EUR": "Euro",
                "GBP": "Libra Esterlina", "JPY": "Iene Japonês", "ARS": "Peso Argentino",
                "CAD": "Dólar Canadense", "AUD": "Dólar Australiano", "CNY": "Yuan Chinês",
                "CHF": "Franco Suíço"
            };

            let taxasDeCambio = {};

            // --- FUNÇÕES ---
            function popularMoedas() {
                for (const codigo in moedasPrincipais) {
                    const nome = moedasPrincipais[codigo];
                    fromSelect.add(new Option(`${codigo} - ${nome}`, codigo));
                    toSelect.add(new Option(`${codigo} - ${nome}`, codigo));
                }
                fromSelect.value = 'USD';
                toSelect.value = 'BRL';
            }
            
            async function obterTaxas() {
                try {
                    const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`);
                    if (!response.ok) throw new Error('Erro ao buscar dados da API.');
                    
                    const data = await response.json();
                    if (data.result === 'success') {
                        taxasDeCambio = data.conversion_rates;
                        converter();
                    } else {
                        throw new Error(data['error-type'] || 'A resposta da API não foi bem-sucedida.');
                    }
                } catch (error) {
                    console.error("Erro na API:", error);
                    resultadoDiv.innerHTML = `<p style="color: red;">Não foi possível carregar as cotações. Verifique sua chave de API ou a conexão.</p>`;
                }
            }

            function converter() {
                const amount = parseFloat(amountInput.value);
                const fromCurrency = fromSelect.value;
                const toCurrency = toSelect.value;

                if (isNaN(amount) || !taxasDeCambio[fromCurrency] || !taxasDeCambio[toCurrency]) {
                    resultadoDiv.innerHTML = ''; // Limpa o resultado se não houver dados
                    return;
                }

                const resultado = (amount / taxasDeCambio[fromCurrency]) * taxasDeCambio[toCurrency];
                const taxaUnitatia = taxasDeCambio[toCurrency] / taxasDeCambio[fromCurrency];

                resultadoDiv.innerHTML = `
                    <h3>${resultado.toLocaleString('pt-BR', {style:'currency', currency: toCurrency, maximumFractionDigits: 2})}</h3>
                    <p>1 ${fromCurrency} = ${taxaUnitatia.toFixed(4).replace('.', ',')} ${toCurrency}</p>
                `;
            }

            function trocarMoedas() {
                const temp = fromSelect.value;
                fromSelect.value = toSelect.value;
                toSelect.value = temp;
                converter();
            }

            // --- INICIALIZAÇÃO E EVENTOS ---
            popularMoedas();
            obterTaxas();

            amountInput.addEventListener('input', converter);
            fromSelect.addEventListener('change', converter);
            toSelect.addEventListener('change', converter);
            swapButton.addEventListener('click', trocarMoedas);
        });