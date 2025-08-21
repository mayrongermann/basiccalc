document.addEventListener('DOMContentLoaded', () => {
    // Esconde e exibe o header ao rolar a página
    let lastScrollTop = 0;
    const header = document.querySelector('header');

    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        if (scrollTop > lastScrollTop) {
            header.style.top = '-150px';
        } else {
            header.style.top = '0';
        }
        lastScrollTop = scrollTop;
    });

    // Referências aos elementos HTML
    const form = document.getElementById('expense-form');
    const expenseNameInput = document.getElementById('expense-name');
    const expenseAmountInput = document.getElementById('expense-amount');
    const categoryButtonsContainer = document.getElementById('category-buttons');
    const expensesListContainer = document.getElementById('expenses-list-container');
    const summaryChartContainer = document.getElementById('summary-chart-container');

    // Variáveis para armazenar os dados e o estado
    let expenses = [];
    let categories = {
        'Necessidades': '#007bff',
        'Desejos': '#28a745',
        'Investimentos': '#fbc02d',
    };
    let selectedCategory = null;
    let chartInstance = null;

    // Função para gerar cores aleatórias
    const getRandomColor = () => {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    };

    // Função para renderizar os botões de categoria
    const renderCategoryButtons = () => {
        categoryButtonsContainer.innerHTML = '';

        for (const category in categories) {
            const button = document.createElement('button');
            button.className = 'category-button';
            button.textContent = category;
            button.style.backgroundColor = categories[category];
            button.setAttribute('data-category', category);

            button.addEventListener('click', () => {
                // Remove a classe 'active' de todos os botões
                document.querySelectorAll('.category-button').forEach(btn => btn.classList.remove('active'));
                // Adiciona a classe 'active' apenas ao botão clicado
                button.classList.add('active');
                selectedCategory = button.getAttribute('data-category');
            });

            categoryButtonsContainer.appendChild(button);
        }

        // Adiciona o botão "Criar Categoria"
        const createButton = document.createElement('button');
        createButton.id = 'create-category-button';
        createButton.className = 'category-button';
        createButton.textContent = 'Criar Categoria';
        createButton.addEventListener('click', (e) => {
            e.preventDefault();
            const newCategory = prompt('Digite o nome da nova categoria:');
            if (newCategory && newCategory.trim() !== '') {
                categories[newCategory] = getRandomColor();
                renderCategoryButtons();
            }
        });
        categoryButtonsContainer.appendChild(createButton);
    };

    // Funções de renderização do gráfico e da lista de despesas (mantidas as originais)
    const renderChart = () => {
        summaryChartContainer.innerHTML = '<canvas id="expense-chart"></canvas>';
        const ctx = document.getElementById('expense-chart').getContext('2d');

        const summary = expenses.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
            return acc;
        }, {});

        const labels = Object.keys(summary);
        const data = Object.values(summary);
        const backgroundColors = labels.map(label => categories[label] || getRandomColor());

        if (chartInstance) {
            chartInstance.destroy();
        }

        chartInstance = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: backgroundColors,
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                const total = context.chart._metasets[0].total;
                                const currentValue = context.raw;
                                const percentage = parseFloat(((currentValue/total) * 100).toFixed(2));
                                return `${label} R$ ${currentValue.toFixed(2).replace('.', ',')} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    };

    const renderExpensesList = () => {
        expensesListContainer.innerHTML = '';
        
        const groupedExpenses = expenses.reduce((acc, expense) => {
            if (!acc[expense.category]) {
                acc[expense.category] = [];
            }
            acc[expense.category].push(expense);
            return acc;
        }, {});

        const categoryList = document.createElement('ul');
        categoryList.classList.add('category-list');

        for (const category in groupedExpenses) {
            const categoryItem = document.createElement('li');
            categoryItem.classList.add('category-item');
            
            const categoryTitle = document.createElement('h4');
            categoryTitle.textContent = category.charAt(0).toUpperCase() + category.slice(1);
            categoryTitle.style.color = categories[category] || '#333'; // Usa a cor da categoria
            
            const expenseSublist = document.createElement('ul');

            groupedExpenses[category].forEach(expense => {
                const expenseItem = document.createElement('li');
                expenseItem.classList.add('expense-item');
                expenseItem.textContent = `${expense.name} - R$ ${expense.amount.toFixed(2).replace('.', ',')}`;
                expenseSublist.appendChild(expenseItem);
            });
            
            categoryItem.appendChild(categoryTitle);
            categoryItem.appendChild(expenseSublist);
            categoryList.appendChild(categoryItem);
        }
        
        expensesListContainer.appendChild(categoryList);
    };

    // Evento de envio do formulário
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Validação: checa se uma categoria foi selecionada
        if (!selectedCategory) {
            alert('Por favor, selecione ou crie uma categoria.');
            return;
        }

        // Cria um novo objeto de despesa
        const newExpense = {
            name: expenseNameInput.value,
            amount: parseFloat(expenseAmountInput.value),
            category: selectedCategory,
        };

        // Validação simples
        if (newExpense.name === '' || isNaN(newExpense.amount) || newExpense.amount <= 0) {
            alert('Por favor, preencha a descrição e o valor com informações válidas.');
            return;
        }

        // Adiciona a nova despesa ao array
        expenses.push(newExpense);

        // Atualiza a visualização
        renderChart();
        renderExpensesList();

        // Limpa o formulário e a seleção de categoria
        form.reset();
        document.querySelectorAll('.category-button').forEach(btn => btn.classList.remove('active'));
        selectedCategory = null;
    });

    // Chamadas iniciais para renderizar os botões e os gráficos/listas vazios
    renderCategoryButtons();
    renderChart();
    renderExpensesList();
});
// Função para baixar o gráfico
function downloadChart() {
    // Obtenha o elemento canvas do gráfico. Certifique-se de que o ID está correto.
    const canvas = document.getElementById('summary-chart-container').querySelector('canvas');

    if (canvas) {
        // Converte o conteúdo do canvas para uma URL de dados (imagem PNG)
        const image = canvas.toDataURL('image/png');

        // Cria um link temporário
        const link = document.createElement('a');
        link.href = image;
        link.download = 'grafico-despesas.png'; // Define o nome do arquivo

        // Simula o clique no link para iniciar o download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// Adiciona um listener de evento ao botão para acionar o download
document.getElementById('download-chart-btn').addEventListener('click', downloadChart);