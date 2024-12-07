let debts = JSON.parse(localStorage.getItem("debts")) || [];

const debtForm = document.getElementById("debt-form");
const debtList = document.getElementById("debt-list");
const filterStatus = document.getElementById("filter-status");
const filterBtn = document.getElementById("filter-btn");
const totalsList = document.getElementById("totals-list");
const chartCanvas = document.getElementById("debt-chart");
let debtChart;

// Salvar no LocalStorage
function saveToLocalStorage() {
    localStorage.setItem("debts", JSON.stringify(debts));
}

// Atualizar Tabela
function renderDebts(filter = "Todos") {
    debtList.innerHTML = "";
    const filteredDebts = filter === "Todos" ? debts : debts.filter(d => d.status === filter);

    filteredDebts.forEach((debt, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${debt.description}</td>
            <td>R$ ${debt.amount.toFixed(2)}</td>
            <td>${debt.dueDate}</td>
            <td>${debt.status}</td>
            <td>
                <button class="delete-btn" onclick="deleteDebt(${index})">Excluir</button>
            </td>
        `;
        debtList.appendChild(row);
    });

    updateChart();
    updateTotals();
}

// Atualizar Gráfico
function updateChart() {
    const statusTotals = { Pendente: 0, Paga: 0 };
    debts.forEach(d => statusTotals[d.status] += d.amount);

    if (debtChart) debtChart.destroy();
    debtChart = new Chart(chartCanvas, {
        type: "bar",
        data: {
            labels: ["Pendente", "Paga"],
            datasets: [{
                label: "Total por Status (R$)",
                data: [statusTotals.Pendente, statusTotals.Paga],
                backgroundColor: ["#f04747", "#43b581"]
            }]
        },
        options: {
            responsive: true,
            scales: { y: { beginAtZero: true } }
        }
    });
}

// Atualizar Totais
function updateTotals() {
    const totals = { Pendente: 0, Paga: 0, Todos: 0 };
    debts.forEach(d => {
        totals[d.status] += d.amount;
        totals.Todos += d.amount;
    });

    totalsList.innerHTML = `
        <li><strong>Pendente:</strong> R$ ${totals.Pendente.toFixed(2)}</li>
        <li><strong>Paga:</strong> R$ ${totals.Paga.toFixed(2)}</li>
        <li><strong>Total:</strong> R$ ${totals.Todos.toFixed(2)}</li>
    `;
}

// Adicionar Dívida
debtForm.addEventListener("submit", e => {
    e.preventDefault();
    const description = document.getElementById("description").value;
    const amount = parseFloat(document.getElementById("amount").value);
    const dueDate = document.getElementById("due-date").value;
    const status = document.getElementById("status").value;

    debts.push({ description, amount, dueDate, status });
    saveToLocalStorage();
    debtForm.reset();
    renderDebts(filterStatus.value);
});

// Excluir Dívida
function deleteDebt(index) {
    debts.splice(index, 1);
    saveToLocalStorage();
    renderDebts(filterStatus.value);
}

// Filtrar Dívidas
filterBtn.addEventListener("click", () => {
    renderDebts(filterStatus.value);
});

// Inicializar
renderDebts();
