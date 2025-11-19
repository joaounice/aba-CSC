// VARIÁVEIS DE CONFIGURAÇÃO E UI
const body = document.querySelector('body');
const sidebar = body.querySelector('nav');
const toggle = body.querySelector(".toggle");
const modeSwitch = body.querySelector(".toggle-switch");
const modeText = body.querySelector('.mode-text');
const navLinks = body.querySelectorAll('.nav-link a');
const pageSections = document.querySelectorAll('.page-section');
const mainContent = document.getElementById('main-content');
const loginScreen = document.getElementById('login-screen');
const loginForm = document.getElementById('login-form');
const loginMessage = document.getElementById('login-message');
const togglePassword = document.getElementById('togglePassword');
const passwordInput = document.getElementById('password');
const btnShowCadastro = document.getElementById('btn-show-cadastro');
const btnShowTabela = document.getElementById('btn-show-tabela');
const formNovoCadastro = document.getElementById('form-novo-cadastro');
const tabelaColaboradoresContainer = document.getElementById('tabela-colaboradores-container');
const colaboradoresTableBody = document.querySelector('#colaboradores-table tbody');
const searchInput = document.getElementById('search-colaboradores'); 

// VARIÁVEIS PARA O NOVO CAMPO DE SENHA (CADASTRO)
const cadPasswordInput = document.getElementById('cad-password');
const toggleCadPassword = document.getElementById('toggleCadPassword');

// VARIÁVEIS DE CADASTRO
const cargoSelect = document.getElementById('cad-cargo');
const nivelInput = document.getElementById('cad-nivel');
const cadastroForm = document.getElementById('cadastro-colaborador-form');
const btnLimparCadastro = document.getElementById('btn-limpar-cadastro');

let isEditMode = {};
let allColaboradores = []; 
let demandasChartInstance = null; // Instância do Chart.js

// --- CONTROLE DE ACESSO ---
// AJUSTE: Incluindo os níveis numéricos ('4', '5', '6') além do formato completo ('NIVEL X') para evitar o erro de acesso negado.
const niveisPermitidosCadastro = ['NIVEL 4', 'NIVEL 5', 'NIVEL 6', '4', '5', '6']; 
const menuCadastros = document.getElementById('menu-cadastros'); 

// CONFIGURAÇÃO DE NÍVEIS E API
const nivelMapping = {
    'ANALISTA DE CSC JR': 'NIVEL 3',
    'ASSISTENTE DE CSC': 'NIVEL 2',
    'AUXILIAR ADMINISTRATIVO APRENDIZ': 'NIVEL 1',
    'SUPERVISOR DE CSC': 'NIVEL 5',
    'GERENTE DE CSC': 'NIVEL 6',
    'ANALISTA DE CSC PL': 'NIVEL 4'
};

// URL base da API (Assumindo que o index.js é o seu servidor rodando em 10.32.2.219:3000)
const API_BASE_URL = 'http://10.32.2.219:3000'; 
let userData = {};

// --- FUNÇÕES GERAIS DE UI ---

// Toggle Sidebar
if (toggle) {
    toggle.addEventListener("click", () => {
        sidebar.classList.toggle("close");
    });
}

// Toggle Dark/Light Mode
if (modeSwitch) {
    modeSwitch.addEventListener("click", () => {
        body.classList.toggle("dark");
        localStorage.setItem("mode", body.classList.contains("dark") ? "dark" : "light");
        if (body.classList.contains("dark")) {
            modeText.innerText = "Modo Claro";
        } else {
            modeText.innerText = "Modo Escuro";
        }
    });
}

// Apply saved mode
if (localStorage.getItem("mode") === "dark") {
    body.classList.add("dark");
    modeText.innerText = "Modo Claro";
} else {
    body.classList.remove("dark");
    modeText.innerText = "Modo Escuro";
}

// Lógica de navegação modificada para usar a verificação de acesso
navLinks.forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        const targetHref = link.getAttribute('href');

        // Se for o link de Cadastros, chama a função de controle de acesso
        if (targetHref === '#cadastros') {
            handleCadastroClick(link);
            return; 
        }

        // Para os outros links (Demanda, Chamados)
        activateSection(link, targetHref);
        
        if (targetHref === '#demanda') {
            renderDemandasChart();
        }
    });
});

// Função de ativação de seção comum
function activateSection(linkElement, targetHref) {
    pageSections.forEach(section => section.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(item => item.classList.remove('active'));
    
    linkElement.parentElement.classList.add('active');
    const targetSection = document.querySelector(targetHref);
    
    // Esconde a mensagem de acesso negado
    const acessoNegadoContainer = document.getElementById('acesso-negado-cadastros');
    if (acessoNegadoContainer) acessoNegadoContainer.style.display = 'none';

    if (targetSection) targetSection.classList.add('active');
}

// Nova função de controle de acesso para Cadastros
function handleCadastroClick(linkElement) {
    const targetHref = linkElement.getAttribute('href');
    const cadastroSection = document.querySelector(targetHref);
    const acessoNegadoContainer = document.getElementById('acesso-negado-cadastros');
    
    // Verifica o nível do usuário
    // AJUSTE CRÍTICO: Converte userData.NIVEL para string para garantir que a checagem funcione
    const userNivel = String(userData.NIVEL); 
    const hasAccess = niveisPermitidosCadastro.includes(userNivel);

    pageSections.forEach(section => section.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(item => item.classList.remove('active'));
    linkElement.parentElement.classList.add('active');

    if (hasAccess) {
        // Usuário tem acesso: exibe a seção de cadastros e esconde o aviso
        if (cadastroSection) cadastroSection.classList.add('active');
        if (acessoNegadoContainer) acessoNegadoContainer.style.display = 'none';
        
        // Garante que o conteúdo de cadastros é reexibido
        document.querySelector('#cadastros .page-title').style.display = 'block';
        document.querySelector('#cadastros > div:nth-of-type(1)').style.display = 'block'; 
        if(formNovoCadastro) formNovoCadastro.style.display = 'block'; 
        // A view padrão é Novo Cadastro, mas se a tabela estava ativa, ela reaparece
        if(tabelaColaboradoresContainer && tabelaColaboradoresContainer.style.display === 'block'){
            toggleCadastroView(true);
        } else {
            toggleCadastroView(false);
        }
        
    } else {
        // Usuário NÃO tem acesso: exibe a seção de cadastros (para ser o container pai) e mostra o aviso
        if (cadastroSection) cadastroSection.classList.add('active');
        if (acessoNegadoContainer) {
             acessoNegadoContainer.style.display = 'flex'; // Usar flex para centralizar o conteúdo
             const userLevelDisplay = document.getElementById('user-level-display');
             if (userLevelDisplay && userData.NIVEL) {
                 userLevelDisplay.textContent = userData.NIVEL;
             }
        }
        // Esconde o conteúdo real de cadastros
        document.querySelector('#cadastros .page-title').style.display = 'none';
        document.querySelector('#cadastros > div:nth-of-type(1)').style.display = 'none'; // Botões
        if(formNovoCadastro) formNovoCadastro.style.display = 'none';
        if(tabelaColaboradoresContainer) tabelaColaboradoresContainer.style.display = 'none';
    }
}


// Inicialização de página após login
function initializePage() {
    const defaultSectionId = '#demanda';
    const defaultSection = document.querySelector(defaultSectionId);
    if (defaultSection) {
        document.querySelectorAll('.page-section').forEach(section => section.classList.remove('active'));
        document.querySelectorAll('.nav-link').forEach(item => item.classList.remove('active'));
        
        defaultSection.classList.add('active');
        document.querySelector(`.nav-link a[href="${defaultSectionId}"]`).parentElement.classList.add('active');
        
        // Garante que a seção de cadastros está resetada para os que têm ou não acesso.
        const acessoNegadoContainer = document.getElementById('acesso-negado-cadastros');
        if (acessoNegadoContainer) acessoNegadoContainer.style.display = 'none';
        document.querySelector('#cadastros .page-title').style.display = 'block';
        document.querySelector('#cadastros > div:nth-of-type(1)').style.display = 'block';
        
        renderDemandasChart();
    }
}

// --- FUNÇÕES DE LOGIN ---
async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    loginMessage.textContent = 'Autenticando...';
    loginMessage.style.color = '#006299';
    try {
        const response = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email, password: password }),
        });
        const data = await response.json();
        if (response.ok && data.success) {
            userData = data.userData;
            console.log('Login realizado com sucesso. Dados do usuário:', userData);
            loginMessage.textContent = 'Login realizado com sucesso!';
            loginMessage.style.color = '#00cc66';
            setTimeout(() => {
                loginScreen.classList.add('hidden');
                mainContent.classList.add('logged-in');
                initializePage();
            }, 500);
        } else {
            loginMessage.textContent = data.message || 'Erro de autenticação. Verifique suas credenciais.';
            loginMessage.style.color = 'red';
        }
    } catch (error) {
        console.error('Erro de conexão ao fazer login:', error);
        loginMessage.textContent = 'Erro de conexão: Não foi possível alcançar o servidor da API.';
        loginMessage.style.color = 'red';
    }
}

if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
}

// Toggle para o campo de senha (Login)
if (togglePassword && passwordInput) {
    togglePassword.addEventListener('click', () => {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePassword.classList.toggle('fa-eye');
        togglePassword.classList.toggle('fa-eye-slash');
    });
}

// Toggle para o campo de senha (Cadastro)
if (toggleCadPassword && cadPasswordInput) {
    toggleCadPassword.addEventListener('click', () => {
        const type = cadPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        cadPasswordInput.setAttribute('type', type);
        toggleCadPassword.classList.toggle('fa-eye');
        toggleCadPassword.classList.toggle('fa-eye-slash');
    });
}

// Logout
const logoutLink = document.getElementById('logout-link');
if (logoutLink) {
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        userData = {};
        mainContent.classList.remove('logged-in');
        loginScreen.classList.remove('hidden');
        loginMessage.textContent = '';
        window.location.hash = '';
        if (demandasChartInstance) {
            demandasChartInstance.destroy();
            demandasChartInstance = null;
        }
    });
}

// --- FUNÇÕES DE CADASTRO E LISTAGEM ---

function toggleCadastroView(showTable = false) {
    // Esconde a mensagem de acesso negado (caso o usuário tenha acabado de fazer login com o nível correto)
    const acessoNegadoContainer = document.getElementById('acesso-negado-cadastros');
    if (acessoNegadoContainer) acessoNegadoContainer.style.display = 'none';
    document.querySelector('#cadastros .page-title').style.display = 'block';
    document.querySelector('#cadastros > div:nth-of-type(1)').style.display = 'block';
    
    if (showTable) {
        formNovoCadastro.style.display = 'none';
        tabelaColaboradoresContainer.style.display = 'block';
        btnShowCadastro.classList.remove('btn-primary');
        btnShowCadastro.classList.add('btn-secondary');
        btnShowTabela.classList.remove('btn-secondary');
        btnShowTabela.classList.add('btn-primary');
        fetchColaboradores();
    } else {
        formNovoCadastro.style.display = 'block';
        tabelaColaboradoresContainer.style.display = 'none';
        btnShowCadastro.classList.remove('btn-secondary');
        btnShowCadastro.classList.add('btn-primary');
        btnShowTabela.classList.remove('btn-primary');
        btnShowTabela.classList.add('btn-secondary');
    }
}

if (btnShowCadastro) {
    btnShowCadastro.addEventListener('click', () => {
        // AJUSTE: Converte userData.NIVEL para string
        if (niveisPermitidosCadastro.includes(String(userData.NIVEL))) { 
            toggleCadastroView(false);
        }
    });
}

if (btnShowTabela) {
    btnShowTabela.addEventListener('click', () => {
        // AJUSTE: Converte userData.NIVEL para string
        if (niveisPermitidosCadastro.includes(String(userData.NIVEL))) {
            toggleCadastroView(true);
        }
    });
}

async function fetchColaboradores() {
    colaboradoresTableBody.innerHTML = '<tr><td colspan="11" style="text-align: center;"><i class="fa-solid fa-spinner fa-spin"></i> Carregando dados...</td></tr>'; 
    try {
        const response = await fetch(`${API_BASE_URL}/api/colaboradores`);
        const data = await response.json();
        if (response.ok && data.success) {
            allColaboradores = data.colaboradores; 
            renderColaboradoresTable(allColaboradores);
            if(searchInput) searchInput.value = ''; 
        } else {
            colaboradoresTableBody.innerHTML = `<tr><td colspan="11" style="text-align: center; color: red;">Erro ao carregar colaboradores: ${data.message || 'Erro desconhecido'}</td></tr>`;
        }
    } catch (error) {
        console.error('Erro na requisição de colaboradores:', error);
        colaboradoresTableBody.innerHTML = '<tr><td colspan="11" style="text-align: center; color: red;">Erro de conexão com o servidor da API.</td></tr>';
    }
}

function renderColaboradoresTable(colaboradores) {
    colaboradoresTableBody.innerHTML = '';
    if (colaboradores.length === 0) {
        colaboradoresTableBody.innerHTML = '<tr><td colspan="11" style="text-align: center;">Nenhum colaborador encontrado.</td></tr>';
        return;
    }

    colaboradores.forEach(colaborador => {
        const tr = document.createElement('tr');
        tr.id = `colaborador-row-${colaborador.ID}`;
        tr.innerHTML = `
            <td data-field="id">${colaborador.ID}</td>
            <td data-field="nome">${colaborador.NOME}</td>
            <td data-field="email_vitru">${colaborador.EMAIL_VITRU}</td>
            <td data-field="senha">******</td> <td data-field="celula">${colaborador.CELULA}</td>
            <td data-field="cargo">${colaborador.CARGO}</td>
            <td data-field="nivel">${colaborador.NIVEL}</td>
            <td data-field="supervisor">${colaborador.SUPERVISOR}</td>
            <td data-field="gerente">${colaborador.GERENTE}</td>
            <td data-field="status">${colaborador.STATUS}</td>
            <td class="action-cell">
                <button class="edit-action-btn save-btn" style="display: none;" onclick="handleSaveEdit(${colaborador.ID})"><i class="fa-solid fa-floppy-disk"></i></button>
                <button class="edit-action-btn cancel-btn" style="display: none;" onclick="toggleEditMode(${colaborador.ID})"><i class="fa-solid fa-xmark"></i></button>
                <button class="edit-action-btn edit-btn" onclick="toggleEditMode(${colaborador.ID})"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="edit-action-btn delete-btn" onclick="handleDeleteColaborador(${colaborador.ID})"><i class="fa-solid fa-trash-can"></i></button>
            </td>
        `;
        colaboradoresTableBody.appendChild(tr);
    });
}

function filterColaboradores() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    const rows = colaboradoresTableBody.querySelectorAll('tr');

    rows.forEach(row => {
        if (row.querySelector('td[colspan="11"]')) {
            return;
        }
        
        let rowText = '';
        Array.from(row.querySelectorAll('td:not(.action-cell)')).forEach(cell => {
            if (cell.dataset.field !== 'senha') {
                rowText += cell.textContent.toLowerCase() + ' ';
            }
        });

        if (rowText.includes(searchTerm)) {
            row.style.display = ''; 
        } else {
            row.style.display = 'none'; 
        }
    });
}

if (searchInput) {
    searchInput.addEventListener('keyup', filterColaboradores);
    searchInput.addEventListener('input', filterColaboradores); 
}

// Delegação de funções globais para o window (necessário porque estão no HTML como `onclick="..."`)
window.handleDeleteColaborador = async function(id) {
    if (!confirm(`Tem certeza que deseja EXCLUIR o colaborador com ID ${id}?`)) {
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/api/delete-colaborador/${id}`, {
            method: 'DELETE',
        });
        const data = await response.json();
        if (response.ok && data.success) {
            alert('Colaborador excluído com sucesso!');
            fetchColaboradores();
        } else {
            alert(`Erro ao excluir: ${data.message || 'Ocorreu um erro desconhecido.'}`);
        }
    } catch (error) {
        console.error('Erro de conexão ao excluir:', error);
        alert('Erro de conexão com o servidor da API.');
    }
}

window.toggleEditMode = function(id) {
    const row = document.getElementById(`colaborador-row-${id}`);
    if (!row) return;

    const editableFields = ['nome', 'email_vitru', 'senha', 'celula', 'cargo', 'nivel', 'supervisor', 'gerente', 'status'];
    const cells = Array.from(row.querySelectorAll('td')).filter(cell => editableFields.includes(cell.dataset.field));

    const actionCell = row.querySelector('td:last-child');
    let isEditing = isEditMode[id];

    if (isEditing) {
        fetchColaboradores();
        isEditMode[id] = false;
        return;
    }

    cells.forEach(cell => {
        const field = cell.dataset.field;
        const currentValue = cell.textContent;
        let inputElement;

        if (field === 'celula' || field === 'cargo' || field === 'supervisor' || field === 'gerente' || field === 'status') {
            inputElement = document.createElement('select');
            inputElement.className = 'edit-input';
            inputElement.name = field;
            
            let options;
            switch (field) {
                case 'celula': 
                    options = ['EMISSÃO', 'INGRESSO', 'VALIDAÇÃO', 'EDUCAÇÃO CONTINUADA', 'DESENVOLVIMENTO & QUALIDADE']; 
                    break;
                case 'cargo': 
                    options = ['ANALISTA DE CSC JR', 'ASSISTENTE DE CSC', 'AUXILIAR ADMINISTRATIVO APRENDIZ', 'SUPERVISOR DE CSC', 'GERENTE DE CSC', 'ANALISTA DE CSC PL']; 
                    break;
                case 'supervisor': 
                    options = ['ALINE KELLY CARRARA SILVA DUTRA', 'GUILHERME CANIATO', 'LUAN HENRIQUE DE MIRANDA', 'MAYARA APARECIDA DE PAULA', 'MARCUS STANDER']; 
                    break;
                case 'gerente': 
                    options = ['MARCUS STANDER']; 
                    break;
                case 'status': 
                    options = ['ATIVO', 'INATIVO']; 
                    break;
            }

            options.forEach(opt => {
                const option = document.createElement('option');
                option.value = opt;
                option.textContent = opt;
                if (opt === currentValue) {
                    option.selected = true;
                }
                inputElement.appendChild(option);
            });
            
            if (field === 'cargo') {
                inputElement.onchange = () => {
                    const newCargo = inputElement.value;
                    const nivelCell = row.querySelector('td[data-field="nivel"]');
                    const nivelInput = nivelCell.querySelector('.edit-input');
                    if (nivelInput) {
                        nivelInput.value = nivelMapping[newCargo] || 'Nível não definido';
                    }
                };
            }

        } else { 
            inputElement = document.createElement('input');
            inputElement.className = 'edit-input';
            inputElement.name = field;
            
            if (field === 'senha') {
                inputElement.type = 'text'; 
                inputElement.placeholder = 'Preencha para alterar a senha';
                inputElement.value = ''; 
                inputElement.setAttribute('minlength', '8'); 
            } else if (field === 'email_vitru') {
                inputElement.type = 'email';
                inputElement.value = currentValue;
                inputElement.required = true;
            } else {
                inputElement.type = 'text'; 
                inputElement.value = currentValue;
            }

            if(field === 'nivel') {
                inputElement.readOnly = true;
                inputElement.style.backgroundColor = 'var(--toggle-color)';
            }
        }

        cell.textContent = '';
        cell.appendChild(inputElement);
    });

    row.classList.add('editing');
    actionCell.querySelector('.edit-btn').style.display = 'none';
    actionCell.querySelector('.delete-btn').style.display = 'none';
    actionCell.querySelector('.save-btn').style.display = 'inline-block';
    actionCell.querySelector('.cancel-btn').style.display = 'inline-block';

    isEditMode[id] = true;
}

window.handleSaveEdit = async function(id) {
    const row = document.getElementById(`colaborador-row-${id}`);
    const inputs = row.querySelectorAll('.edit-input');
    const updatedData = {
        nome: '', email_vitru: '', celula: '', cargo: '', nivel: '', supervisor: '', gerente: '', status: '',
        password: null 
    };
    
    inputs.forEach(input => {
        const field = input.name;
        const value = input.value;
        
        if (field === 'senha') {
            if (value.trim() !== '') {
                updatedData.password = value; 
            }
        } else {
            updatedData[field] = value;
        }
    });

    if (updatedData.password && updatedData.password.length < 8) {
        alert('A nova senha deve ter no mínimo 8 caracteres.');
        return;
    }
    
    const requiredFields = ['nome', 'email_vitru', 'celula', 'cargo', 'nivel', 'supervisor', 'gerente', 'status']; 
    if (requiredFields.some(field => !updatedData[field])) {
        alert('Por favor, preencha todos os campos obrigatórios (Nome, E-mail Vitru, Célula, Cargo, Nível, Supervisor, Gerente, Status).');
        return;
    }

    const actionCell = row.querySelector('td:last-child');
    const originalActionHTML = actionCell.innerHTML;
    actionCell.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>'; 

    try {
        const response = await fetch(`${API_BASE_URL}/api/update-colaborador/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedData),
        });
        const data = await response.json();
        
        if (response.ok && data.success) {
            alert('Colaborador atualizado com sucesso!');
            fetchColaboradores();
            isEditMode[id] = false;
        } else {
            alert(`Erro ao atualizar: ${data.message || 'Ocorreu um erro desconhecido.'}`);
            actionCell.innerHTML = originalActionHTML; 
        }

    } catch (error) {
        console.error('Erro de conexão ao salvar:', error);
        alert('Erro de conexão com o servidor da API.');
        actionCell.innerHTML = originalActionHTML; 
    }
}


// --- FUNÇÕES DE CADASTRO (Novo Colaborador) ---
if (cargoSelect && nivelInput) {
    cargoSelect.addEventListener('change', () => {
        const selectedCargo = cargoSelect.value;
        nivelInput.value = nivelMapping[selectedCargo] || 'Nível não definido';
    });
}

if (btnLimparCadastro && cadastroForm) {
    btnLimparCadastro.addEventListener('click', () => {
        cadastroForm.reset();
        document.getElementById('cad-nivel').value = 'Preenchimento automático';
    });
}

if (cadastroForm) {
    cadastroForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            nome: document.getElementById('cad-name').value,
            email_vitru: document.getElementById('cad-email-vitru').value,
            celula: document.getElementById('cad-celula').value,
            cargo: document.getElementById('cad-cargo').value,
            nivel: nivelInput.value,
            supervisor: document.getElementById('cad-supervisor').value,
            gerente: document.getElementById('cad-gerente').value,
            status: document.getElementById('cad-status').value,
            password: document.getElementById('cad-password').value, 
        };

        const submitButton = document.getElementById('btn-cadastrar');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Cadastrando...';
        submitButton.disabled = true;

        try {
            const response = await fetch(`${API_BASE_URL}/api/register-colaborador`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Sucesso! ${data.message}`);
                cadastroForm.reset();
                document.getElementById('cad-nivel').value = 'Preenchimento automático';
                
                if (tabelaColaboradoresContainer.style.display !== 'none') {
                    fetchColaboradores();
                }
            } else {
                alert(`Erro no Cadastro: ${data.message || 'Ocorreu um erro desconhecido.'}`);
            }

        } catch (error) {
            console.error('Erro ao conectar com a API de Cadastro:', error);
            alert('Erro de conexão: Não foi possível alcançar o servidor da API.');
        } finally {
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    });
}

// --- FUNÇÕES DO GRÁFICO (DASHBOARD) ---
function renderDemandasChart() {
    const ctx = document.getElementById('demandasChart');
    if (!ctx) return;
    
    if (demandasChartInstance) {
        demandasChartInstance.destroy();
    }


}


// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    // Garante que o usuário veja a tela de login ao carregar a página
    mainContent.classList.remove('logged-in'); 
    loginScreen.classList.remove('hidden');

    // Se o hash for '#cadastros' ao carregar, tenta exibir 'Novo Cadastro', conforme solicitado
    if (window.location.hash === '#cadastros') {
        // Ao carregar a página com o hash, como o login ainda não foi feito, 
        // o initializePage irá sobrescrever e levar para #demanda após o login.
        // O hash não será tratado aqui para evitar problemas de estado antes do login.
    }
});