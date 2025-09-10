const formatarDinheiro = (valor) => valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    // Funções de INSS e IRRF (Tabelas e regras de Setembro de 2025)
    function calcularINSS(baseDeCalculo) {
        const teto = 8246.68;
        let salario = Math.min(baseDeCalculo, teto);
        let inss = 0;
        if (salario > 4173.34) { inss += (Math.min(salario, teto) - 4173.34) * 0.14; }
        if (salario > 2782.23) { inss += (Math.min(salario, 4173.34) - 2782.23) * 0.12; }
        if (salario > 1556.94) { inss += (Math.min(salario, 2782.23) - 1556.94) * 0.09; }
        if (salario > 0) { inss += Math.min(salario, 1556.94) * 0.075; }
        return inss;
    }

    function calcularIRRF(baseDeCalculo, numDependentes) {
        const deducaoDependentes = numDependentes * 189.59;
        const baseFinal = baseDeCalculo - deducaoDependentes;
        let irrf = 0;
        if (baseFinal > 4664.68) { irrf = (baseFinal * 0.275) - 896.00; } 
        else if (baseFinal > 3751.05) { irrf = (baseFinal * 0.225) - 662.77; } 
        else if (baseFinal > 2826.65) { irrf = (baseFinal * 0.15) - 381.44; } 
        else if (baseFinal > 2259.20) { irrf = (baseFinal * 0.075) - 169.44; }
        return Math.max(0, irrf);
    }

    document.getElementById('rescisao-form').addEventListener('submit', function(event) {
        event.preventDefault();

        // --- CAPTURA DE DADOS ---
        const motivo = document.getElementById('motivoSaida').value;
        const dataAdmissao = new Date(document.getElementById('dataAdmissao').value + 'T00:00:00');
        const dataSaida = new Date(document.getElementById('dataSaida').value + 'T00:00:00');
        const salarioBruto = parseFloat(document.getElementById('salarioBruto').value);
        const saldoFgts = parseFloat(document.getElementById('saldoFgts').value);
        const feriasVencidas = document.getElementById('feriasVencidas').checked;
        const dependentes = 0; // Você pode adicionar este campo no HTML se quiser
        
        const resultadoDiv = document.getElementById('resultado');
        resultadoDiv.style.display = 'block';

        if (isNaN(salarioBruto) || isNaN(dataAdmissao.getTime()) || isNaN(dataSaida.getTime())) {
            resultadoDiv.innerHTML = '<p style="color: red;">Preencha todos os campos corretamente.</p>';
            return;
        }

        // --- OBJETOS PARA ARMAZENAR OS VALORES ---
        let proventos = {};
        let descontos = {};
        let informativos = {};

        // --- CÁLCULOS BASE (APLICÁVEIS A VÁRIOS CENÁRIOS) ---
        const diasTrabalhadosNoMes = dataSaida.getDate();
        const saldoDeSalario = (salarioBruto / 30) * diasTrabalhadosNoMes;
        
        const mesesTrabalhadosNoAno = dataSaida.getMonth() + 1;
        const decimoTerceiroProporcional = (salarioBruto / 12) * mesesTrabalhadosNoAno;

        const diffTotalMeses = (dataSaida.getFullYear() - dataAdmissao.getFullYear()) * 12 + (dataSaida.getMonth() - dataAdmissao.getMonth());
        const mesesFeriasProporcionais = (diffTotalMeses % 12) + 1;
        const feriasProporcionais = (salarioBruto / 12) * mesesFeriasProporcionais;
        const tercoFeriasProporcionais = feriasProporcionais / 3;

        // --- LÓGICA CORRIGIDA USANDO 'SWITCH' PARA SEPARAR OS CENÁRIOS ---
        proventos['Saldo de Salário'] = saldoDeSalario;
        if (feriasVencidas) {
            proventos['Férias Vencidas'] = salarioBruto;
            proventos['1/3 sobre Férias Vencidas'] = salarioBruto / 3;
        }

        switch (motivo) {
            case 'sem_justa_causa':
                proventos['13º Salário Proporcional'] = decimoTerceiroProporcional;
                proventos['Férias Proporcionais'] = feriasProporcionais;
                proventos['1/3 sobre Férias Proporcionais'] = tercoFeriasProporcionais;
                proventos['Aviso Prévio Indenizado'] = salarioBruto;
                proventos['Multa de 40% do FGTS'] = saldoFgts * 0.4;
                informativos['Saque do FGTS'] = saldoFgts;
                informativos['Seguro Desemprego'] = 'Direito a solicitar';
                break;

            case 'pedido_demissao':
                proventos['13º Salário Proporcional'] = decimoTerceiroProporcional;
                proventos['Férias Proporcionais'] = feriasProporcionais;
                proventos['1/3 sobre Férias Proporcionais'] = tercoFeriasProporcionais;
                descontos['Aviso Prévio (desconto)'] = salarioBruto;
                break;

            case 'acordo':
                proventos['13º Salário Proporcional'] = decimoTerceiroProporcional;
                proventos['Férias Proporcionais'] = feriasProporcionais;
                proventos['1/3 sobre Férias Proporcionais'] = tercoFeriasProporcionais;
                proventos['Aviso Prévio (50%)'] = salarioBruto / 2;
                proventos['Multa de 20% do FGTS'] = saldoFgts * 0.2;
                informativos['Saque do FGTS (80%)'] = saldoFgts * 0.8;
                break;

            case 'com_justa_causa':
                // Nenhuma verba proporcional é devida. Apenas o que já foi adicionado acima (saldo e vencidas).
                break;
        }
        
        // --- CÁLCULO FINAL DE DESCONTOS ---
        // INSS incide sobre Saldo de Salário e 13º. Férias e Aviso Indenizado são isentos.
        const inssSobreSalario = calcularINSS(proventos['Saldo de Salário'] || 0);
        const inssSobre13 = calcularINSS(proventos['13º Salário Proporcional'] || 0);
        if (inssSobreSalario > 0) descontos['INSS sobre Saldo de Salário'] = inssSobreSalario;
        if (inssSobre13 > 0) descontos['INSS sobre 13º'] = inssSobre13;
        // O IRRF tem uma base de cálculo específica na rescisão, mas para simplificar, vamos aplicar sobre as verbas tributáveis.
        const baseIRRF = (proventos['Saldo de Salário'] || 0) + (proventos['13º Salário Proporcional'] || 0) - inssSobreSalario - inssSobre13;
        const irrf = calcularIRRF(baseIRRF, dependentes);
        if(irrf > 0) descontos['IRRF sobre Verbas'] = irrf;
        
        let totalProventos = Object.values(proventos).reduce((a, b) => a + b, 0);
        let totalDescontos = Object.values(descontos).reduce((a, b) => a + b, 0);
        let totalLiquido = totalProventos - totalDescontos;

        // --- MONTAGEM DO HTML ---
        let html = '<h3 style="text-align: center;">Extrato da sua Rescisão</h3>';
        html += '<h4>Verbas Rescisórias (Proventos)</h4><ul>';
        for (const key in proventos) { html += `<li style="display: flex; justify-content: space-between;"><span>(+) ${key}:</span> <strong>${formatarDinheiro(proventos[key])}</strong></li>`; }
        html += '</ul><hr>';
        html += '<h4>Descontos</h4><ul>';
        for (const key in descontos) { html += `<li style="display: flex; justify-content: space-between;"><span>(-) ${key}:</span> <span style="color: #dc3545;">${formatarDinheiro(descontos[key])}</span></li>`; }
        html += '</ul><hr>';
        html += `<li style="display: flex; justify-content: space-between; font-size: 1.2em;"><strong>TOTAL LÍQUIDO A RECEBER:</strong> <strong style="color: #28a745;">${formatarDinheiro(totalLiquido)}</strong></li>`;

        if (Object.keys(informativos).length > 0) {
            html += '<hr><h4>Outros Direitos</h4><ul>';
            for (const key in informativos) {
                const valor = typeof informativos[key] === 'number' ? formatarDinheiro(informativos[key]) : informativos[key];
                html += `<li style="display: flex; justify-content: space-between;"><span>${key}:</span> <strong>${valor}</strong></li>`;
            }
            html += '</ul>';
        }
        html += `<p style="font-size: 0.8em; text-align: center; color: #6c757d; margin-top: 1rem;">Esta é uma simulação. Os valores exatos podem variar e devem ser confirmados no seu termo de rescisão oficial.</p>`;
        resultadoDiv.innerHTML = html;
    });