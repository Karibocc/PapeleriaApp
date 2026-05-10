// ============================================
// register.js - Registro de usuarios
// Papelería App
// ============================================

const API_BASE_URL = 'http://localhost:8085/api';

// ============================================
// Función para mostrar/ocultar contraseña
// ============================================

function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.parentElement.querySelector('.password-toggle');
    const icon = button.querySelector('i');
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

// ============================================
// Función para registrar un nuevo usuario
// ============================================

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
        return { error: 'Error de conexión con el servidor' };
    }
}

// ============================================
// Validaciones del formulario
// ============================================

function validarFormulario(nombreCompleto, username, email, password, confirmPassword) {
    if (!nombreCompleto || !username || !email || !password) {
        return { valid: false, message: 'Por favor complete todos los campos obligatorios' };
    }
    
    if (password !== confirmPassword) {
        return { valid: false, message: 'Las contraseñas no coinciden' };
    }
    
    if (password.length < 8) {
        return { valid: false, message: 'La contraseña debe tener al menos 8 caracteres' };
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return { valid: false, message: 'Ingrese un correo electrónico válido' };
    }
    
    return { valid: true };
}

// ============================================
// Inicialización del formulario
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const alertError = document.getElementById('alertError');
    const alertSuccess = document.getElementById('alertSuccess');
    const btnRegister = document.getElementById('btnRegister');
    
    if (!registerForm) return;
    
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const nombreCompleto = document.getElementById('nombreCompleto').value;
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const telefonoMovil = document.getElementById('telefonoMovil').value;
        
        // Ocultar alertas anteriores
        alertError.style.display = 'none';
        alertSuccess.style.display = 'none';
        
        // Validar formulario
        const validacion = validarFormulario(nombreCompleto, username, email, password, confirmPassword);
        
        if (!validacion.valid) {
            alertError.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i> ' + validacion.message;
            alertError.style.display = 'block';
            return;
        }
        
        const userData = {
            username: username,
            password: password,
            email: email,
            nombreCompleto: nombreCompleto,
            telefonoMovil: telefonoMovil
        };
        
        // Deshabilitar botón durante el registro
        btnRegister.disabled = true;
        btnRegister.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i> Registrando...';
        
        const result = await register(userData);
        
        if (result.success) {
            alertSuccess.innerHTML = '<i class="fas fa-check-circle me-2"></i> ' + result.message;
            alertSuccess.style.display = 'block';
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
        } else {
            alertError.innerHTML = '<i class="fas fa-exclamation-circle me-2"></i> ' + result.error;
            alertError.style.display = 'block';
            btnRegister.disabled = false;
            btnRegister.innerHTML = '<i class="fas fa-user-plus me-2"></i> Crear Cuenta';
        }
    });
});

// Exponer función togglePassword globalmente
window.togglePassword = togglePassword;