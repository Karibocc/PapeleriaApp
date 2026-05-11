// ============================================
// legal.js - Funciones para páginas legales
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

async function cargarInfoEmpresa() {
    try {
        const response = await fetch(API_BASE_URL + '/configuracion/empresa', { headers: getHeaders() });
        if (response.ok) {
            const empresa = await response.json();
            
            const correoContacto = document.getElementById('correoContacto');
            const telefonoContacto = document.getElementById('telefonoContacto');
            
            if (correoContacto && empresa.correo) {
                correoContacto.innerText = empresa.correo;
            }
            if (telefonoContacto && empresa.telefono) {
                telefonoContacto.innerText = empresa.telefono;
            }
        }
    } catch (error) {
        console.error('Error cargando información de la empresa:', error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    cargarInfoEmpresa();
});