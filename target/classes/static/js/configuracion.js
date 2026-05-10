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
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

async function cargarConfiguracionesForm() {
    try {
        const response = await fetch(`${API_BASE_URL}/configuraciones`, { headers: getHeaders() });
        if (response.ok) {
            const configs = await response.json();
            const configMap = {};
            configs.forEach(c => { configMap[c.clave] = c.valor; });
            
            const nombreNegocio = document.getElementById('nombre_negocio');
            const nitNegocio = document.getElementById('nit_negocio');
            const telefono = document.getElementById('telefono');
            const correoNegocio = document.getElementById('correo_negocio');
            const direccionNegocio = document.getElementById('direccion_negocio');
            const ivaPorcentaje = document.getElementById('iva_porcentaje');
            const ivaIncluido = document.getElementById('iva_incluido');
            
            if (nombreNegocio) nombreNegocio.value = configMap.nombre_negocio || '';
            if (nitNegocio) nitNegocio.value = configMap.nit_negocio || '';
            if (telefono) telefono.value = configMap.telefono || '';
            if (correoNegocio) correoNegocio.value = configMap.correo_negocio || '';
            if (direccionNegocio) direccionNegocio.value = configMap.direccion_negocio || '';
            if (ivaPorcentaje) ivaPorcentaje.value = configMap.iva_porcentaje || '19';
            if (ivaIncluido) ivaIncluido.value = configMap.iva_incluido === 'true' ? 'true' : 'false';
        }
    } catch (error) {
        console.error('Error cargando configuraciones:', error);
    }
}

async function guardarConfiguraciones(e) {
    e.preventDefault();
    
    const configs = [
        { clave: 'nombre_negocio', valor: document.getElementById('nombre_negocio')?.value || '' },
        { clave: 'nit_negocio', valor: document.getElementById('nit_negocio')?.value || '' },
        { clave: 'telefono', valor: document.getElementById('telefono')?.value || '' },
        { clave: 'correo_negocio', valor: document.getElementById('correo_negocio')?.value || '' },
        { clave: 'direccion_negocio', valor: document.getElementById('direccion_negocio')?.value || '' },
        { clave: 'iva_porcentaje', valor: document.getElementById('iva_porcentaje')?.value || '19' },
        { clave: 'iva_incluido', valor: document.getElementById('iva_incluido')?.value || 'false' }
    ];
    
    try {
        for (const config of configs) {
            await fetch(`${API_BASE_URL}/configuraciones`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(config)
            });
        }
        alert('Configuración guardada exitosamente');
    } catch (error) {
        console.error('Error guardando configuración:', error);
        alert('Error al guardar la configuración');
    }
}

async function cambiarContrasena() {
    const currentPassword = document.getElementById('currentPassword')?.value;
    const newPassword = document.getElementById('newPassword')?.value;
    const confirmPassword = document.getElementById('confirmNewPassword')?.value;
    
    if (!currentPassword || !newPassword) {
        alert('Complete todos los campos');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('Las contraseñas nuevas no coinciden');
        return;
    }
    
    if (newPassword.length < 8) {
        alert('La nueva contraseña debe tener al menos 8 caracteres');
        return;
    }
    
    const token = getAuthToken();
    if (!token) {
        alert('No hay sesión activa');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/cambiar-contrasena`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ oldPassword: currentPassword, newPassword: newPassword })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Contraseña cambiada exitosamente');
            if (document.getElementById('currentPassword')) document.getElementById('currentPassword').value = '';
            if (document.getElementById('newPassword')) document.getElementById('newPassword').value = '';
            if (document.getElementById('confirmNewPassword')) document.getElementById('confirmNewPassword').value = '';
        } else {
            alert(data.error || 'Error al cambiar la contraseña');
        }
    } catch (error) {
        console.error('Error cambiando contraseña:', error);
        alert('Error de conexión');
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    const configForm = document.getElementById('configForm');
    if (configForm) {
        configForm.addEventListener('submit', guardarConfiguraciones);
    }
    cargarConfiguracionesForm();
});

// Exponer funciones globales
window.cargarConfiguracionesForm = cargarConfiguracionesForm;
window.guardarConfiguraciones = guardarConfiguraciones;
window.cambiarContrasena = cambiarContrasena;