// ========================================
// CONFIGURAÇÃO INICIAL
// ========================================

const formulario = document.querySelector('form');
const urlOriginal = formulario.action; // Salva a URL original
formulario.removeAttribute('action'); // Remove action para evitar redirect

const camposDoFormulario = document.querySelectorAll("[required]");
const gruposRadio = ['comercial', 'financeiro', 'central-de-atendimento', 'rede-tecnica', 'geral-logos'];

// ========================================
// CONFIGURAÇÃO DE VALIDAÇÃO
// ========================================

const tiposDeErro = [
    "valueMissing",
    "typeMismatch",
    "tooShort",
    "patternMismatch",
    "customError",
];

const mensagens = {
    nome: {
        valueMissing: "O campo de nome não pode estar vazio.",
        patternMismatch: "Por favor, preencha um nome válido.",
        tooShort: "O nome deve ter pelo menos 8 caracteres."
    },
    email: {
        valueMissing: "O campo de e-mail não pode estar vazio.",
        typeMismatch: "Por favor, preencha um email válido.",
        tooShort: "Por favor, preencha um e-mail válido."
    },
    empresa: {
        valueMissing: "O campo empresa não pode estar vazio.",
        patternMismatch: "Por favor, preencha uma empresa válida.",
        tooShort: "O nome da empresa deve ter pelo menos 4 caracteres."
    },
    cargo: {
        valueMissing: "O campo cargo não pode estar vazio.",
        patternMismatch: "Por favor, preencha um cargo válido.",
        tooShort: "O cargo deve ter pelo menos 4 caracteres."
    },
    comercial: {
        valueMissing: "Por favor, selecione uma avaliação para o setor Comercial."
    },
    financeiro: {
        valueMissing: "Por favor, selecione uma avaliação para o setor Financeiro."
    },
    "central-de-atendimento": {
        valueMissing: "Por favor, selecione uma avaliação para a Central de Atendimento."
    },
    "rede-tecnica": {
        valueMissing: "Por favor, selecione uma avaliação para a Rede Técnica."
    },
    "geral-logos": {
        valueMissing: "Por favor, selecione uma avaliação geral para a Logos."
    }
};

// ========================================
// FUNÇÕES DE VALIDAÇÃO
// ========================================

function verificaCampo(campo) {
    let mensagem = "";
    campo.setCustomValidity('');
    
    if (campo.name === "email" && campo.value !== "") {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(campo.value)) {
            campo.setCustomValidity("Email inválido");
        }
    }
    
    tiposDeErro.forEach(erro => {
        if (campo.validity[erro]) {
            mensagem = mensagens[campo.name][erro];
        }
    });
    
    const mensagemErro = campo.parentNode.querySelector('.mensagem-erro');
    const validadorDeInput = campo.checkValidity();
    
    if (!validadorDeInput) {
        if (!mensagemErro) {
            const novaMensagem = document.createElement('span');
            novaMensagem.className = 'mensagem-erro';
            novaMensagem.textContent = mensagem;
            campo.parentNode.appendChild(novaMensagem);
        } else {
            mensagemErro.textContent = mensagem;
        }
        campo.classList.add('campo-invalido');
        campo.classList.remove('campo-valido');
    } else {
        if (mensagemErro) {
            mensagemErro.remove();
        }
        campo.classList.add('campo-valido');
        campo.classList.remove('campo-invalido');
    }
}

function validarFormularioCompleto() {
    let formularioValido = true;
    
    // Valida todos os campos obrigatórios
    camposDoFormulario.forEach(campo => {
        verificaCampo(campo);
        if (!campo.checkValidity()) {
            formularioValido = false;
        }
    });
    
    // Validação especial para grupos de radio
    gruposRadio.forEach(grupo => {
        const radios = document.querySelectorAll(`input[name="${grupo}"]`);
        const radioSelecionado = document.querySelector(`input[name="${grupo}"]:checked`);
        
        if (!radioSelecionado) {
            formularioValido = false;
            const container = radios[0].closest('.div-form-radio');
            
            const mensagemExistente = container.querySelector('.mensagem-erro');
            if (mensagemExistente) {
                mensagemExistente.remove();
            }
            
            const novaMensagem = document.createElement('span');
            novaMensagem.className = 'mensagem-erro';
            novaMensagem.textContent = mensagens[grupo].valueMissing;
            container.appendChild(novaMensagem);
            
            radios.forEach(radio => {
                radio.classList.add('campo-invalido');
                radio.classList.remove('campo-valido');
            });
        }
    });
    
    return formularioValido;
}

// ========================================
// FUNÇÕES DE POPUP
// ========================================

function mostrarPopupSucesso(mensagem = "Formulário enviado com sucesso!") {
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    
    const popup = document.createElement('div');
    popup.className = 'popup-container popup-sucesso';
    
    popup.innerHTML = `
        <div class="popup-content">
            <div class="popup-header sucesso">
                <span class="popup-icon">✅</span>
                <h2>Sucesso!</h2>
            </div>
            <div class="popup-body">
                <p><strong>Obrigado pelo seu feedback!</strong></p>
                <p>${mensagem}</p>
                <p>Sua avaliação é muito importante para melhorarmos nossos serviços.</p>
            </div>
            <div class="popup-footer">
                <button class="btn-fechar" onclick="fecharPopup()">Fechar</button>
            </div>
        </div>
    `;
    
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    setTimeout(() => overlay.classList.add('popup-ativo'), 10);
}

function mostrarPopupErro(mensagem = "Erro ao enviar formulário. Tente novamente.") {
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    
    const popup = document.createElement('div');
    popup.className = 'popup-container popup-erro';
    
    popup.innerHTML = `
        <div class="popup-content">
            <div class="popup-header erro">
                <span class="popup-icon">❌</span>
                <h2>Ops! Algo deu errado</h2>
            </div>
            <div class="popup-body">
                <p><strong>Não foi possível enviar seu formulário.</strong></p>
                <p>${mensagem}</p>
                <p>Por favor, verifique sua conexão e tente novamente.</p>
            </div>
            <div class="popup-footer">
                <button class="btn-tentar-novamente" onclick="fecharPopup()">Tentar Novamente</button>
            </div>
        </div>
    `;
    
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    setTimeout(() => overlay.classList.add('popup-ativo'), 10);
}

function mostrarPopupCarregando() {
    const overlay = document.createElement('div');
    overlay.className = 'popup-overlay';
    overlay.id = 'popup-carregando';
    
    const popup = document.createElement('div');
    popup.className = 'popup-container popup-carregando';
    
    popup.innerHTML = `
        <div class="popup-content">
            <div class="popup-body">
                <div class="spinner"></div>
                <h3>Enviando seu formulário...</h3>
                <p>Por favor, aguarde um momento.</p>
            </div>
        </div>
    `;
    
    overlay.appendChild(popup);
    document.body.appendChild(overlay);
    
    setTimeout(() => overlay.classList.add('popup-ativo'), 10);
}

function fecharPopup() {
    const overlay = document.querySelector('.popup-overlay');
    if (overlay) {
        overlay.classList.remove('popup-ativo');
        setTimeout(() => overlay.remove(), 300);
    }
}

// ========================================
// FUNÇÃO DE ENVIO AJAX
// ========================================

async function enviarFormulario(formData, url) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        });
        
        const data = await response.json().catch(() => ({}));
        
        // Log para debug (você pode remover depois)
        console.log('Resposta do servidor:', { status: response.status, data });
        
        return {
            sucesso: response.ok,
            status: response.status,
            mensagem: data.message || data.mensagem || data.msg || '',
            dados: data
        };
    } catch (error) {
        console.error('Erro ao enviar formulário:', error);
        return {
            sucesso: false,
            status: 0,
            mensagem: 'Erro de conexão. Verifique sua internet.',
            erro: error.message
        };
    }
}

// ========================================
// EVENT LISTENERS
// ========================================

// Validação em blur e invalid
camposDoFormulario.forEach((campo) => {
    campo.addEventListener("blur", () => verificaCampo(campo));
    campo.addEventListener("invalid", evento => evento.preventDefault());
});

// Validação em tempo real para campos de texto
const camposTexto = document.querySelectorAll('input[type="text"], input[type="email"]');
camposTexto.forEach(campo => {
    campo.addEventListener('input', () => {
        if (campo.value.length > 0) {
            verificaCampo(campo);
        }
    });
});

// Validação para campos radio
gruposRadio.forEach(grupo => {
    const radios = document.querySelectorAll(`input[name="${grupo}"]`);
    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            const container = radio.closest('.div-form-radio');
            const mensagemErro = container.querySelector('.mensagem-erro');
            if (mensagemErro) {
                mensagemErro.remove();
            }
            
            radios.forEach(r => {
                r.classList.remove('campo-invalido');
                r.classList.add('campo-valido');
            });
        });
    });
});

// ========================================
// EVENTO SUBMIT PRINCIPAL
// ========================================

formulario.addEventListener('submit', async (evento) => {
    evento.preventDefault();
    evento.stopPropagation();
    
    const formularioValido = validarFormularioCompleto();
    
    if (formularioValido) {
        mostrarPopupCarregando();
        
        const formData = new FormData(formulario);
        const url = urlOriginal || 'https://primary-production-2986.up.railway.app/webhook-test/ee83756f-3560-49c9-a1cf-ad25b41f0736';
        
        const resultado = await enviarFormulario(formData, url);
        
        // Remove popup de carregamento
        const popupCarregando = document.getElementById('popup-carregando');
        if (popupCarregando) {
            popupCarregando.remove();
        }
        
        if (resultado.sucesso) {
            // Filtra mensagens técnicas do n8n e usa uma mensagem amigável
            let mensagemSucesso = resultado.mensagem;
            if (!mensagemSucesso || 
                mensagemSucesso.toLowerCase().includes('workflow') ||
                mensagemSucesso.toLowerCase().includes('started') ||
                mensagemSucesso.trim() === '') {
                mensagemSucesso = "Seu formulário foi enviado com sucesso!";
            }
            
            mostrarPopupSucesso(mensagemSucesso);
            
            // Limpa formulário após sucesso
            setTimeout(() => {
                formulario.reset();
                document.querySelectorAll('.campo-valido, .campo-invalido').forEach(campo => {
                    campo.classList.remove('campo-valido', 'campo-invalido');
                });
            }, 2000);
        } else {
            let mensagemErro = resultado.mensagem;
            
            // Filtra mensagens técnicas e usa mensagens mais amigáveis
            if (mensagemErro && 
                (mensagemErro.toLowerCase().includes('workflow') ||
                 mensagemErro.toLowerCase().includes('started') ||
                 mensagemErro.toLowerCase().includes('n8n'))) {
                mensagemErro = "Ocorreu um problema técnico no servidor.";
            }
            
            switch (resultado.status) {
                case 400:
                    mensagemErro = mensagemErro || "Dados do formulário inválidos.";
                    break;
                case 404:
                    mensagemErro = "Servidor não encontrado. Verifique a URL.";
                    break;
                case 500:
                    mensagemErro = "Erro interno do servidor. Tente novamente mais tarde.";
                    break;
                case 0:
                    mensagemErro = mensagemErro || 'Erro de conexão. Verifique sua internet.';
                    break;
                default:
                    mensagemErro = mensagemErro || "Erro desconhecido. Tente novamente.";
            }
            
            mostrarPopupErro(mensagemErro);
        }
    } else {
        // Foca no primeiro campo inválido
        const primeiroInvalido = document.querySelector('.campo-invalido, input:invalid');
        if (primeiroInvalido) {
            primeiroInvalido.focus();
            primeiroInvalido.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }
});

// ========================================
// ESTILOS CSS
// ========================================

const estilosCompletos = `
    /* Estilos de validação */
    .campo-invalido {
        border-color: #e74c3c !important;
        background-color: #fdf2f2 !important;
    }
    
    .campo-valido {
        border-color: #27ae5fff !important;
    
    }
    
    .mensagem-erro {
        color: #e74c3c;
        font-size: 0.875rem;
        margin-top: 0.25rem;
        display: block;
        font-weight: 500;
    }
    
    .div-form-radio.radio-erro {
        border: 1px solid #e74c3c;
        border-radius: 4px;
        padding: 10px;
        background-color: #fdf2f2;
    }
    
    /* Estilos de popup */
    .popup-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    .popup-overlay.popup-ativo {
        opacity: 1;
    }
    
    .popup-container {
        background: white;
        border-radius: 12px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        max-width: 500px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        transform: scale(0.8) translateY(50px);
        transition: transform 0.3s ease;
    }
    
    .popup-ativo .popup-container {
        transform: scale(1) translateY(0);
    }
    
    .popup-content {
        padding: 0;
    }
    
    .popup-header {
        color: white;
        padding: 20px;
        text-align: center;
        border-radius: 12px 12px 0 0;
    }
    
    .popup-header.sucesso {
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
    }
    
    .popup-header.erro {
        background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%);
    }
    
    .popup-header h2 {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
    }
    
    .popup-icon {
        font-size: 2.5rem;
        display: block;
        margin-bottom: 10px;
    }
    
    .popup-body {
        padding: 30px 20px;
        text-align: center;
        line-height: 1.6;
    }
    
    .popup-body p {
        margin: 0 0 15px 0;
        color: #333;
    }
    
    .popup-body h3 {
        margin: 15px 0 10px 0;
        color: #333;
        font-weight: 600;
    }
    
    .popup-footer {
        padding: 20px;
        border-top: 1px solid #eee;
        display: flex;
        gap: 10px;
        justify-content: center;
    }
    
    .btn-fechar, .btn-tentar-novamente {
        padding: 12px 24px;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        font-size: 0.9rem;
        width: 100%;
    }
    
    .btn-fechar {
        background: #28a745;
        color: white;
    }
    
    .btn-fechar:hover {
        background: #1e7e34;
        transform: translateY(-1px);
    }
    
    .btn-tentar-novamente {
        background: #007bff;
        color: white;
    }
    
    .btn-tentar-novamente:hover {
        background: #0056b3;
        transform: translateY(-1px);
    }
    
    .spinner {
        border: 4px solid #f3f3f3;
        border-top: 4px solid #007bff;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px auto;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .popup-carregando .popup-body {
        padding: 40px 20px;
    }
    
    @media (max-width: 480px) {
        .popup-container {
            margin: 20px;
            width: calc(100% - 40px);
        }
    }
`;

// Injeta os estilos na página
const styleSheet = document.createElement("style");
styleSheet.textContent = estilosCompletos;
document.head.appendChild(styleSheet);

// ========================================
// FALLBACK PARA NAVEGADORES ANTIGOS
// ========================================

if (!window.fetch) {
    window.enviarFormulario = function(formData, url) {
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', url);
            
            xhr.onload = function() {
                let data = {};
                try {
                    data = JSON.parse(xhr.responseText);
                } catch (e) {
                    data = {};
                }
                
                resolve({
                    sucesso: xhr.status >= 200 && xhr.status < 300,
                    status: xhr.status,
                    mensagem: data.message || data.mensagem || '',
                    dados: data
                });
            };
            
            xhr.onerror = function() {
                resolve({
                    sucesso: false,
                    status: 0,
                    mensagem: 'Erro de conexão. Verifique sua internet.',
                    erro: 'Network error'
                });
            };
            
            xhr.send(formData);
        });
    };
}