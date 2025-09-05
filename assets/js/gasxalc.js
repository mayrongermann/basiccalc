const inputs = document.querySelectorAll('#combustivel-form input');
const resultadoDiv = document.getElementById('resultado');

function calcularCombustivel() {
    const precoGasolina = parseFloat(document.getElementById('precoGasolina').value);
    const precoAlcool = parseFloat(document.getElementById('precoAlcool').value);
    const consumoGasolina = parseFloat(document.getElementById('consumoGasolina').value);
    const consumoAlcool = parseFloat(document.getElementById('consumoAlcool').value);

    if (isNaN(precoGasolina) || isNaN(precoAlcool) || precoGasolina <= 0 || precoAlcool <= 0) {
        resultadoDiv.style.display = 'none';
        return;
    }

    let resultadoHTML = '';
    
    // MODO PRECISO: Se o usuário informou ambos os consumos
    if (!isNaN(consumoGasolina) && !isNaN(consumoAlcool) && consumoGasolina > 0 && consumoAlcool > 0) {
        const custoKmGasolina = precoGasolina / consumoGasolina;
        const custoKmAlcool = precoAlcool / consumoAlcool;
        const pontoEquilibrio = (precoGasolina * consumoAlcool) / consumoGasolina;

        if (custoKmAlcool <= custoKmGasolina) {
            resultadoHTML = `
                <div class="resultado-combustivel resultado-alcool">
                    <h3>Abasteça com ÁLCOOL</h3>
                    <p>Com base no consumo do seu carro, o álcool está mais econômico.</p>
                </div>
                <p style="text-align:center; margin-top: 1rem;">Custo por km com Álcool: <strong>${custoKmAlcool.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</strong><br>Custo por km com Gasolina: <strong>${custoKmGasolina.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</strong></p>
                <p style="text-align:center;">Para a gasolina valer a pena, ela precisaria custar até <strong>${(precoAlcool * consumoGasolina / consumoAlcool).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</strong>.</p>
            `;
        } else {
            resultadoHTML = `
                <div class="resultado-combustivel resultado-gasolina">
                    <h3>Abasteça com GASOLINA</h3>
                    <p>Com base no consumo do seu carro, a gasolina está mais econômica.</p>
                </div>
                <p style="text-align:center; margin-top: 1rem;">Custo por km com Gasolina: <strong>${custoKmGasolina.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</strong><br>Custo por km com Álcool: <strong>${custoKmAlcool.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</strong></p>
                <p style="text-align:center;">Para o álcool valer a pena, ele precisaria custar até <strong>${pontoEquilibrio.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</strong>.</p>
            `;
        }
    } 
    // MODO RÁPIDO: Usa a regra dos 70%
    else {
        const relacao = precoAlcool / precoGasolina;
        const pontoEquilibrio = precoGasolina * 0.7;

        if (relacao <= 0.7) {
            resultadoHTML = `
                <div class="resultado-combustivel resultado-alcool">
                    <h3>Abasteça com ÁLCOOL</h3>
                    <p>O preço do álcool está em <strong>${(relacao * 100).toFixed(0)}%</strong> do valor da gasolina.</p>
                </div>
                <p style="text-align:center; margin-top: 1rem;">Pela regra dos 70%, o álcool é a escolha mais vantajosa.</p>
                <p style="text-align:center;">Para a gasolina valer a pena, ela precisaria custar até <strong>${(precoAlcool / 0.7).toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</strong>.</p>
            `;
        } else {
            resultadoHTML = `
                <div class="resultado-combustivel resultado-gasolina">
                    <h3>Abasteça com GASOLINA</h3>
                    <p>O preço do álcool está em <strong>${(relacao * 100).toFixed(0)}%</strong> do valor da gasolina.</p>
                </div>
                <p style="text-align:center; margin-top: 1rem;">Pela regra dos 70%, a gasolina é a escolha mais vantajosa.</p>
                <p style="text-align:center;">Para o álcool valer a pena, ele precisaria custar até <strong>${pontoEquilibrio.toLocaleString('pt-BR', {style: 'currency', currency: 'BRL'})}</strong>.</p>
            `;
        }
    }

    resultadoDiv.innerHTML = resultadoHTML;
    resultadoDiv.style.display = 'block';
}

// Adiciona um listener para cada input para calcular em tempo real
inputs.forEach(input => {
    input.addEventListener('keyup', calcularCombustivel);
    input.addEventListener('change', calcularCombustivel);
});