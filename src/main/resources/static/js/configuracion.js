// ============================================
// configuracion.js - Configuración del Sistema
// Papelería App
// ============================================

const API_BASE_URL = 'http://localhost:8085/api';

function getAuthToken() {
    return localStorage.getItem('authToken');
}

function getHeaders() {
    const token = getAuthToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? 'Bearer ' + token : ''
    };
}

function mostrarAlerta(mensaje, tipo) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-' + tipo + ' alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.minWidth = '300px';
    alertDiv.style.textAlign = 'center';
    alertDiv.innerHTML = mensaje + '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>';
    document.body.appendChild(alertDiv);
    
    setTimeout(function() {
        if (alertDiv) alertDiv.remove();
    }, 3000);
}

async function cargarConfiguraciones() {
    try {
        const response = await fetch(API_BASE_URL + '/configuracion', { headers: getHeaders() });
        if (response.ok) {
            const configs = await response.json();
            
            for (let i = 0; i < configs.length; i++) {
                const config = configs[i];
                const input = document.getElementById(config.clave);
                if (input) {
                    input.value = config.valor;
                }
            }
        }
    } catch (error) {
        console.error('Error cargando configuraciones:', error);
        mostrarAlerta('Error de conexión al servidor', 'danger');
    }
}

async function guardarConfig(clave) {
    const input = document.getElementById(clave);
    const nuevoValor = input.value;
    
    try {
        const response = await fetch(API_BASE_URL + '/configuracion/' + clave, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify({ valor: nuevoValor })
        });
        
        if (response.ok) {
            mostrarAlerta('Configuración actualizada exitosamente', 'success');
        } else {
            const error = await response.json();
            mostrarAlerta(error.error || 'Error al actualizar', 'danger');
        }
    } catch (error) {
        console.error('Error actualizando configuración:', error);
        mostrarAlerta('Error de conexión al servidor', 'danger');
    }
}

async function inicializarConfiguraciones() {
    if (confirm('¿Está seguro de inicializar las configuraciones? Esto restaurará los valores por defecto.')) {
        try {
            const response = await fetch(API_BASE_URL + '/configuracion/inicializar', {
                method: 'POST',
                headers: getHeaders()
            });
            
            if (response.ok) {
                mostrarAlerta('Configuraciones inicializadas exitosamente', 'success');
                await cargarConfiguraciones();
            } else {
                const error = await response.json();
                mostrarAlerta(error.error || 'Error al inicializar', 'danger');
            }
        } catch (error) {
            console.error('Error inicializando configuraciones:', error);
            mostrarAlerta('Error de conexión al servidor', 'danger');
        }
    }
}

async function cambiarContrasena() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmNewPassword').value;
    
    if (!currentPassword || !newPassword) {
        mostrarAlerta('Complete todos los campos', 'warning');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        mostrarAlerta('Las contraseñas nuevas no coinciden', 'warning');
        return;
    }
    
    if (newPassword.length < 6) {
        mostrarAlerta('La nueva contraseña debe tener al menos 6 caracteres', 'warning');
        return;
    }
    
    const token = getAuthToken();
    if (!token) {
        mostrarAlerta('No hay sesión activa', 'warning');
        return;
    }
    
    try {
        const response = await fetch(API_BASE_URL + '/auth/cambiar-contrasena', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ 
                oldPassword: currentPassword, 
                newPassword: newPassword 
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            mostrarAlerta('Contraseña cambiada exitosamente', 'success');
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmNewPassword').value = '';
        } else {
            mostrarAlerta(data.error || 'Error al cambiar la contraseña', 'danger');
        }
    } catch (error) {
        console.error('Error cambiando contraseña:', error);
        mostrarAlerta('Error de conexión al servidor', 'danger');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    if (!getAuthToken()) {
        window.location.href = 'login.html';
        return;
    }
    
    if (userData.rol === 'ADMIN') {
        cargarConfiguraciones();
    }
});

window.guardarConfig = guardarConfig;
window.inicializarConfiguraciones = inicializarConfiguraciones;
window.cambiarContrasena = cambiarContrasena;