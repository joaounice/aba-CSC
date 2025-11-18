
const body = document.body;
const sidebar = body.querySelector('.sidebar');
const toggle = body.querySelector('.toggle');
const modeSwitch = body.querySelector('.toggle-switch');
const modeText = body.querySelector('.mode-text');
const navLinks = body.querySelectorAll('.nav-link a');
const pageSections = document.querySelectorAll('.page-section');
let myLineChart = null;
let myDoughnutChart = null;

// ===========================================
// FUNCIONALIDADE GERAL DA SIDEBAR E DARK MODE
// ===========================================


if (toggle) {
    toggle.addEventListener('click', () => {
        sidebar.classList.toggle('close');
    });
}
if (modeSwitch) {
    modeSwitch.addEventListener('click', () => {
        body.classList.toggle('dark');
        modeText.innerText = body.classList.contains('dark') ? 'Light Mode' : 'Dark Mode';
        renderChart();
        renderDoughnutChart();
    });
}


// ===========================================
// FUNCIONALIDADE PRINCIPAL: TROCA DE SEÇÕES (NAVEGAÇÃO)
// ===========================================


navLinks.forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        pageSections.forEach(section => section.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(item => item.classList.remove('active'));
        link.parentElement.classList.add('active');
        const targetSection = document.querySelector(link.getAttribute('href'));
        if (targetSection) targetSection.classList.add('active');
    });
});


// ===========================================
// FUNCIONALIDADE: EDIÇÃO DE PERFIL
// ===========================================


const profileView = document.getElementById('profile-view');
const profileEdit = document.getElementById('profile-edit');
const btnEditMode = document.getElementById('btn-edit-mode');
const btnCancelEdit = document.getElementById('btn-cancel-edit');
const profileForm = document.getElementById('profile-form');

if (btnEditMode) {
    btnEditMode.addEventListener('click', () => {
        if (profileView && profileEdit) {
            profileView.style.display = 'none';
            profileEdit.style.display = 'flex';
        }
        ['name', 'role', 'status', 'email', 'phone', 'location'].forEach(field => {
            const edit = document.getElementById(`edit-${field}`);
            const display = document.getElementById(`display-${field}`);
            if (edit && display) edit.value = display.innerText;
        });
    });
}
if (btnCancelEdit) {
    btnCancelEdit.addEventListener('click', () => {
        if (profileEdit && profileView) {
            profileEdit.style.display = 'none';
            profileView.style.display = 'flex';
        }
    });
}
if (profileForm) {
    profileForm.addEventListener('submit', e => {
        e.preventDefault();
        ['name', 'role', 'status', 'email', 'phone', 'location'].forEach(field => {
            const edit = document.getElementById(`edit-${field}`);
            const display = document.getElementById(`display-${field}`);
            if (edit && display) display.innerText = edit.value;
        });
        if (profileEdit && profileView) {
            profileEdit.style.display = 'none';
            profileView.style.display = 'flex';
        }
        alert('Perfil atualizado com sucesso!');
    });
}


// ===========================================
// GRÁFICO 1: DASHBOARD - LINHA (Novos Atendimentos)
// ===========================================


function renderChart() {
    const ctx = document.getElementById('lineChart');
    if (!ctx) return;
    const isDark = body.classList.contains('dark');
    const textColor = isDark ? '#cccccc' : '#707070';
    const gridColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(112,112,112,0.2)';
    const data = {
        labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'],
        datasets: [
            {
                label: 'Novos Atendimentos',
                data: [65, 59, 80, 81, 56, 75, 90],
                fill: true,
                borderColor: '#695cfe',
                backgroundColor: 'rgba(105,92,254,0.2)',
                tension: 0.3,
                pointBackgroundColor: '#695cfe',
                pointRadius: 5,
                pointHoverRadius: 7,
            },
            {
                label: 'AEs Concluídos',
                data: [50, 55, 75, 70, 50, 70, 85],
                fill: false,
                borderColor: '#00cc66',
                backgroundColor: 'rgba(0,204,102,0.2)',
                tension: 0.3,
                pointBackgroundColor: '#00cc66',
                pointRadius: 5,
                pointHoverRadius: 7,
            }
        ]
    };
    const config = {
        type: 'line',
        data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    labels: { color: textColor }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: textColor },
                    grid: { color: gridColor }
                },
                x: {
                    ticks: { color: textColor },
                    grid: { color: gridColor }
                }
            }
        }
    };
    if (myLineChart) myLineChart.destroy();
    myLineChart = new Chart(ctx, config);
}


// ===========================================
// GRÁFICO 2: ANALYTICS - ROSCA/PIZZA (Distribuição por Setor)
// ===========================================


function renderDoughnutChart() {
    const ctx = document.getElementById('sectorChart');
    if (!ctx) return;
    const isDark = body.classList.contains('dark');
    const textColor = isDark ? '#cccccc' : '#707070';
    const backgroundColors = [
        'rgba(105,92,254,0.8)', 'rgba(0,204,102,0.8)', 'rgba(255,193,7,0.8)',
        'rgba(220,53,69,0.8)', 'rgba(23,162,184,0.8)', 'rgba(111,66,193,0.8)'
    ];
    const hoverBackgroundColors = [
        '#695cfe', '#00cc66', '#FFC107', '#dc3545', '#17a2b8', '#6f42c1'
    ];
    const borderColor = isDark ? '#242526' : '#fff';
    const data = {
        labels: ['Atendimento CSC', 'Financeiro', 'Recursos Humanos', 'Tecnologia', 'Marketing', 'Outros'],
        datasets: [{
            label: 'AEs por Setor',
            data: [300, 150, 75, 120, 90, 45],
            backgroundColor,
            hoverBackgroundColor,
            borderColor,
            borderWidth: 2
        }]
    };
    const config = {
        type: 'doughnut',
        data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'right',
                    labels: { color: textColor, font: { size: 14 } }
                },
                tooltip: {
                    callbacks: {
                        label: context => {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((acc, cur) => acc + cur, 0);
                            const perc = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} (${perc}%)`;
                        }
                    }
                }
            }
        }
    };
    if (myDoughnutChart) myDoughnutChart.destroy();
    myDoughnutChart = new Chart(ctx, config);
}


// ===========================================
// ESTADO INICIAL (Carregamento da Página)
// ===========================================


document.addEventListener('DOMContentLoaded', () => {
    const defaultSectionId = '#home';
    const defaultSection = document.querySelector(defaultSectionId);
    if (defaultSection) {
        document.querySelectorAll('.page-section').forEach(section => section.classList.remove('active'));
        defaultSection.classList.add('active');
    }
    const defaultLink = document.querySelector(`.nav-link a[href="${defaultSectionId}"]`);
    if (defaultLink) {
        document.querySelectorAll('.nav-link').forEach(item => item.classList.remove('active'));
        defaultLink.parentElement.classList.add('active');
    }
    renderChart();
    renderDoughnutChart();
});