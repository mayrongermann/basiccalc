        const inputsViagem = document.querySelectorAll('#viagem-form input');
        
        function calcularCustoViagem() {
            const distancia = parseFloat(document.getElementById('distancia').value);
            const precoCombustivel = parseFloat(document.getElementById('precoCombustivel').value);
            const consumoVeiculo = parseFloat(document.getElementById('consumoVeiculo').value);
            const isIdaEVolta = document.getElementById('idaEVolta').checked;
            
            const resultadoDiv = document.getElementById('resultado');
        
            if (isNaN(distancia) || isNaN(precoCombustivel) || isNaN(consumoVeiculo) || distancia <= 0 || precoCombustivel <= 0 || consumoVeiculo <= 0) {
                resultadoDiv.style.display = 'none';
                return;
            }
        
            const distanciaTotal = isIdaEVolta ? distancia * 2 : distancia;
            const litrosNecessarios = distanciaTotal / consumoVeiculo;
            const custoDiario = litrosNecessarios * precoCombustivel;
            const custoSemanal = custoDiario * 5; // Simulação para 5 dias na semana
            const custoMensal = custoDiario * 22; // Simulação para 22 dias úteis no mês
        
            const formatarDinheiro = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        
            resultadoDiv.innerHTML = `
                <p style="text-align: center; margin: 0;">O custo com combustível para este trajeto será de:</p>
                <div class="custo-principal">${formatarDinheiro(custoDiario)}</div>
                
                <div class="projecoes">
                    <p><span>Distância Total a Percorrer:</span> <span>${distanciaTotal.toFixed(1)} km</span></p>
                    <p><span>Litros Necessários:</span> <span>${litrosNecessarios.toFixed(2)} L</span></p>
                    <hr>
                    <p><span>Custo Semanal (5 dias):</span> <span>${formatarDinheiro(custoSemanal)}</span></p>
                    <p><span>Custo Mensal (22 dias):</span> <span>${formatarDinheiro(custoMensal)}</span></p>
                </div>
            `;
            resultadoDiv.style.display = 'block';
        }
        
        inputsViagem.forEach(input => {
            input.addEventListener('keyup', calcularCustoViagem);
            input.addEventListener('change', calcularCustoViagem);
        });