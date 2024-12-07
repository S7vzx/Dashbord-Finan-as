// Lista para armazenar dívidas (usaremos LocalStorage)
let debts = JSON.parse(localStorage.getItem("debts")) || [];

// Selecionar elementos do DOM
const debtForm = document.getElementById("debt-form");
const debtList = document.getElementById("debt-list");
const statusFilter = document.getElementById("status-filter");
const filterBtn = document.getElementById("filter-btn");
const toast = document.getElementById("toast");
const ctx = document.getElementById('debtChart').getContext('2d');

// Variável para armazenar a instância do gráfico
let debtChart;

// Função para salvar no LocalStorage
function saveToLocalStorage() {
    localStorage.setItem("debts", JSON.stringify(debts));
}

// Função para formatar valores como moeda
function formatCurrency(value) {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

// Função para mostrar notificação
function showToast(message) {
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 3000); // Toast desaparece após 3 segundos
}

// Função para renderizar a tabela de dívidas
function renderDebts(debtsToRender) {
    debtList.innerHTML = ""; // Limpa a tabela

    debtsToRender.forEach((debt, index) => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${debt.description}</td>
            <td>${formatCurrency(debt.amount)}</td>
            <td>${debt.dueDate}</td>
            <td>${debt.status}</td>
            <td>
                <button class="delete-btn" onclick="deleteDebt(${index})">Excluir</button>
            </td>
        `;

        debtList.appendChild(row);
    });

    updateChart(debtsToRender); // Atualiza o gráfico após renderizar a tabela
}

// Função para adicionar uma nova dívida
debtForm.addEventListener("submit", (e) => {
    e.preventDefault(); // Previne recarregamento da página

    const description = document.getElementById("description").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const dueDate = document.getElementById("due-date").value;
    const status = document.getElementById("status").value;

    const newDebt = { description, amount, dueDate, status };
    debts.push(newDebt);

    saveToLocalStorage(); // Salva no LocalStorage
    renderDebts(debts); // Atualiza a tabela e gráfico
    showToast('Dívida adicionada com sucesso!'); // Exibe a notificação

    debtForm.reset(); // Limpa o formulário
});

// Função para excluir uma dívida
function deleteDebt(index) {
    debts.splice(index, 1); // Remove a dívida da lista
    saveToLocalStorage(); // Atualiza o LocalStorage
    renderDebts(debts); // Re-renderiza a tabela e gráfico
}

// Função para filtrar as dívidas ao clicar no botão "Filtrar"
filterBtn.addEventListener("click", () => {
    const filter = statusFilter.value;

    let filteredDebts = debts;
    if (filter !== 'all') {
        filteredDebts = debts.filter(debt => debt.status === filter);
    }

    renderDebts(filteredDebts); // Aplica o filtro e renderiza a tabela e gráfico
});

// Função para atualizar o gráfico
function updateChart(debtsToRender) {
    // Contagem de dívidas pendentes e pagas
    const pendingCount = debtsToRender.filter(debt => debt.status === "Pendente").length;
    const paidCount = debtsToRender.filter(debt => debt.status === "Paga").length;

    // Se o gráfico ainda não foi criado, cria o gráfico pela primeira vez
    if (!debtChart) {
        debtChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Pendente', 'Paga'],
                datasets: [{
                    data: [pendingCount, paidCount],
                    backgroundColor: ['#ff4d4d', '#28a745'], // Vermelho para Pendente e Verde para Paga
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                }
            }
        });
    } else {
        // Se o gráfico já existe, atualiza os dados dele
        debtChart.data.datasets[0].data = [pendingCount, paidCount];
        debtChart.update(); // Atualiza o gráfico
    }
}

// Inicializa a tabela e o gráfico ao carregar a página
renderDebts(debts);
