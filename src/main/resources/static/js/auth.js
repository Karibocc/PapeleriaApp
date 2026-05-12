// ============================================
// auth.js - Autenticación Papelería App
// ============================================

const API_BASE_URL = 'http://localhost:8085/api';

// ============================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================

async function login(username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.status === 403 && data.requiresTwoFactor) {
            return { requiresTwoFactor: true, username: data.username };
        }
        
        if (response.ok && data.accessToken) {
            localStorage.setItem('authToken', data.accessToken);
            localStorage.setItem('currentUser', JSON.stringify({
                username: data.username,
                rol: data.rol,
                nombreCompleto: data.nombreCompleto
            }));
            return { success: true, data: data };
        }
        
        return { error: data.error || 'Credenciales invalidas' };
    } catch (error) {
        console.error('Error en login:', error);
        return { error: 'Error de conexion con el servidor' };
    }
}

async function loginWith2FA(username, code) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login/2fa`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, code })
        });
        
        const data = await response.json();
        
        if (response.ok && data.accessToken) {
            localStorage.setItem('authToken', data.accessToken);
            localStorage.setItem('currentUser', JSON.stringify({
                username: data.username,
                rol: data.rol,
                nombreCompleto: data.nombreCompleto
            }));
            return { success: true, data: data };
        }
        
        return { error: data.error || 'Codigo 2FA invalido' };
    } catch (error) {
        console.error('Error en login 2FA:', error);
        return { error: 'Error de conexion' };
    }
}

async function register(userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            return { success: true, message: data.message };
        } else {
            return { error: data.error || 'Error en el registro' };
        }
    } catch (error) {
        console.error('Error en registro:', error);
        return { error: 'Error de conexion con el servidor' };
    }
}

async function forgotPassword(email) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            return { success: true, message: data.message };
        } else {
            return { error: data.error || 'Error al enviar el correo' };
        }
    } catch (error) {
        console.error('Error en forgot password:', error);
        return { error: 'Error de conexion con el servidor' };
    }
}

async function resetPassword(token, newPassword) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            return { success: true, message: data.message };
        } else {
            return { error: data.error || 'Error al restablecer la contrasena' };
        }
    } catch (error) {
        console.error('Error en reset password:', error);
        return { error: 'Error de conexion con el servidor' };
    }
}

async function changePassword(oldPassword, newPassword) {
    const token = localStorage.getItem('authToken');
    if (!token) {
        return { error: 'No hay sesion activa' };
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/cambiar-contrasena`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ oldPassword, newPassword })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            return { success: true, message: data.message };
        } else {
            return { error: data.error || 'Error al cambiar la contrasena' };
        }
    } catch (error) {
        console.error('Error en change password:', error);
        return { error: 'Error de conexion con el servidor' };
    }
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    
    const wrapper = input.parentElement;
    const button = wrapper ? wrapper.querySelector('.password-toggle') : null;
    const icon = button ? button.querySelector('i') : null;
    
    if (input.type === 'password') {
        input.type = 'text';
        if (icon) {
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        }
    } else {
        input.type = 'password';
        if (icon) {
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }
}

// ============================================
// PAGINA DE LOGIN
// ============================================
if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');
    let pendingUsername = null;
    const btnLogin = document.getElementById('btnLogin');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const twoFactorCode = document.getElementById('twoFactorCode')?.value.trim() || '';
        
        const alertError = document.getElementById('alertError');
        const alert2FA = document.getElementById('alert2FA');
        const twoFactorDiv = document.getElementById('twoFactorDiv');
        
        if (alertError) alertError.style.display = 'none';
        if (alert2FA) alert2FA.style.display = 'none';
        
        if (!username || !password) {
            if (alertError) {
                alertError.innerHTML = 'Por favor ingrese usuario y contrasena';
                alertError.style.display = 'block';
            }
            return;
        }
        
        if (twoFactorDiv && twoFactorDiv.style.display === 'block' && pendingUsername) {
            if (!twoFactorCode) {
                if (alertError) {
                    alertError.innerHTML = 'Por favor ingrese el codigo 2FA';
                    alertError.style.display = 'block';
                }
                return;
            }
            
            if (btnLogin) {
                btnLogin.disabled = true;
                btnLogin.innerHTML = 'Verificando...';
            }
            
            const result = await loginWith2FA(pendingUsername, twoFactorCode);
            
            if (result.success) {
                window.location.href = 'index.html';
            } else {
                if (alertError) {
                    alertError.innerHTML = result.error;
                    alertError.style.display = 'block';
                }
                if (btnLogin) {
                    btnLogin.disabled = false;
                    btnLogin.innerHTML = 'Verificar Codigo 2FA';
                }
            }
        } else {
            if (btnLogin) {
                btnLogin.disabled = true;
                btnLogin.innerHTML = 'Ingresando...';
            }
            
            const result = await login(username, password);
            
            if (result.requiresTwoFactor) {
                pendingUsername = result.username;
                if (twoFactorDiv) twoFactorDiv.style.display = 'block';
                if (alert2FA) {
                    alert2FA.innerHTML = 'Se requiere codigo de autenticacion de dos factores';
                    alert2FA.style.display = 'block';
                }
                if (btnLogin) {
                    btnLogin.disabled = false;
                    btnLogin.innerHTML = 'Verificar Codigo 2FA';
                }
            } else if (result.success) {
                window.location.href = 'index.html';
            } else {
                if (alertError) {
                    alertError.innerHTML = result.error;
                    alertError.style.display = 'block';
                }
                if (btnLogin) {
                    btnLogin.disabled = false;
                    btnLogin.innerHTML = 'Iniciar Sesion';
                }
            }
        }
    });
}

// ============================================
// PAGINA DE REGISTRO
// ============================================
if (document.getElementById('registerForm')) {
    const registerForm = document.getElementById('registerForm');
    const alertError = document.getElementById('alertError');
    const alertSuccess = document.getElementById('alertSuccess');
    const btnRegister = document.getElementById('btnRegister');
    
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const email = document.getElementById('email').value.trim();
        const nombreCompleto = document.getElementById('nombreCompleto').value.trim();
        const telefonoMovil = document.getElementById('telefonoMovil')?.value.trim() || '';
        
        if (alertError) alertError.style.display = 'none';
        if (alertSuccess) alertSuccess.style.display = 'none';
        
        if (!username || !password || !email || !nombreCompleto) {
            if (alertError) {
                alertError.innerHTML = 'Por favor complete todos los campos obligatorios';
                alertError.style.display = 'block';
            }
            return;
        }
        
        if (password !== confirmPassword) {
            if (alertError) {
                alertError.innerHTML = 'Las contrasenas no coinciden';
                alertError.style.display = 'block';
            }
            return;
        }
        
        if (password.length < 8) {
            if (alertError) {
                alertError.innerHTML = 'La contrasena debe tener al menos 8 caracteres';
                alertError.style.display = 'block';
            }
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            if (alertError) {
                alertError.innerHTML = 'Ingrese un correo electronico valido';
                alertError.style.display = 'block';
            }
            return;
        }
        
        const userData = {
            username: username,
            password: password,
            email: email,
            nombreCompleto: nombreCompleto,
            telefonoMovil: telefonoMovil
        };
        
        if (btnRegister) {
            btnRegister.disabled = true;
            btnRegister.innerHTML = 'Registrando...';
        }
        
        const result = await register(userData);
        
        if (result.success) {
            if (alertSuccess) {
                alertSuccess.innerHTML = result.message;
                alertSuccess.style.display = 'block';
            }
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
        } else {
            if (alertError) {
                alertError.innerHTML = result.error;
                alertError.style.display = 'block';
            }
            if (btnRegister) {
                btnRegister.disabled = false;
                btnRegister.innerHTML = 'Registrarse';
            }
        }
    });
}

// ============================================
// PAGINA DE RECUPERACION DE CONTRASENA
// ============================================
if (document.getElementById('forgotForm')) {
    const forgotForm = document.getElementById('forgotForm');
    const alertError = document.getElementById('alertError');
    const alertSuccess = document.getElementById('alertSuccess');
    const btnSend = document.getElementById('btnSend');
    
    forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        
        if (alertError) alertError.style.display = 'none';
        if (alertSuccess) alertSuccess.style.display = 'none';
        
        if (!email) {
            if (alertError) {
                alertError.innerHTML = 'Por favor ingrese su correo electronico';
                alertError.style.display = 'block';
            }
            return;
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            if (alertError) {
                alertError.innerHTML = 'Ingrese un correo electronico valido';
                alertError.style.display = 'block';
            }
            return;
        }
        
        if (btnSend) {
            btnSend.disabled = true;
            btnSend.innerHTML = 'Enviando...';
        }
        
        const result = await forgotPassword(email);
        
        if (result.success) {
            if (alertSuccess) {
                alertSuccess.innerHTML = result.message;
                alertSuccess.style.display = 'block';
            }
        } else {
            if (alertError) {
                alertError.innerHTML = result.error;
                alertError.style.display = 'block';
            }
            if (btnSend) {
                btnSend.disabled = false;
                btnSend.innerHTML = 'Enviar Enlace';
            }
        }
    });
}

// ============================================
// PAGINA DE RESTABLECER CONTRASENA
// ============================================
if (document.getElementById('resetForm')) {
    const resetForm = document.getElementById('resetForm');
    const alertError = document.getElementById('alertError');
    const alertSuccess = document.getElementById('alertSuccess');
    const btnReset = document.getElementById('btnReset');
    
    resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (alertError) alertError.style.display = 'none';
        if (alertSuccess) alertSuccess.style.display = 'none';
        
        if (!newPassword || !confirmPassword) {
            if (alertError) {
                alertError.innerHTML = 'Por favor complete ambos campos';
                alertError.style.display = 'block';
            }
            return;
        }
        
        if (newPassword !== confirmPassword) {
            if (alertError) {
                alertError.innerHTML = 'Las contrasenas no coinciden';
                alertError.style.display = 'block';
            }
            return;
        }
        
        if (newPassword.length < 8) {
            if (alertError) {
                alertError.innerHTML = 'La contrasena debe tener al menos 8 caracteres';
                alertError.style.display = 'block';
            }
            return;
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (!token) {
            if (alertError) {
                alertError.innerHTML = 'Token de recuperacion no encontrado';
                alertError.style.display = 'block';
            }
            return;
        }
        
        if (btnReset) {
            btnReset.disabled = true;
            btnReset.innerHTML = 'Restableciendo...';
        }
        
        const result = await resetPassword(token, newPassword);
        
        if (result.success) {
            if (alertSuccess) {
                alertSuccess.innerHTML = result.message;
                alertSuccess.style.display = 'block';
            }
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
        } else {
            if (alertError) {
                alertError.innerHTML = result.error;
                alertError.style.display = 'block';
            }
            if (btnReset) {
                btnReset.disabled = false;
                btnReset.innerHTML = 'Restablecer Contrasena';
            }
        }
    });
}

// ============================================
// CIERRE DE SESION
// ============================================
if (document.getElementById('btnLogout')) {
    document.getElementById('btnLogout').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
}

// ============================================
// FUNCION PARA MOSTRAR/OCULTAR CONTRASENA
// ============================================
window.togglePassword = togglePassword;