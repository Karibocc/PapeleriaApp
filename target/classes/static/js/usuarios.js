// ============================================
// usuarios.js - Gestión de Usuarios (Solo Admin)
// Papelería App
// ============================================

const API_BASE_URL = 'http://localhost:8085/api';

// ============================================
// Funciones de utilidad
// ============================================

function getAuthToken() {
    const token = localStorage.getItem('authToken');
    console.log('Token obtenido:', token ? 'Token existe' : 'NO HAY TOKEN');
    return token;
}

function getHeaders() {
    const token = getAuthToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function mostrarAlerta(mensaje, tipo) {
    console.log(`ALERTA [${tipo}]:`, mensaje);
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${tipo} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alertDiv.style.zIndex = '9999';
    alertDiv.style.minWidth = '300px';
    alertDiv.style.textAlign = 'center';
    alertDiv.innerHTML = `${mensaje}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
}

// ============================================
// Mostrar información del usuario logueado
// ============================================

function mostrarInfoUsuario() {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
        try {
            const userData = JSON.parse(userStr);
            const userName = document.getElementById('userName');
            const userRolBadge = document.getElementById('userRolBadge');
            const userRolText = document.getElementById('userRolText');
            if (userName) userName.innerText = userData.nombreCompleto || userData.username;
            if (userRolBadge) userRolBadge.innerText = userData.rol || '';
            if (userRolText) userRolText.innerHTML = `<strong>Rol:</strong> ${userData.rol || ''}`;
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    }
}

// ============================================
// Verificar autenticación y permisos
// ============================================

function verificarAcceso() {
    const token = getAuthToken();
    const userStr = localStorage.getItem('currentUser');
    if (!token || !userStr) {
        window.location.href = 'login.html';
        return false;
    }
    try {
        const userData = JSON.parse(userStr);
        if (userData.rol !== 'ADMIN') {
            mostrarAlerta('No tienes permisos para acceder a esta pagina', 'danger');
            setTimeout(() => window.location.href = 'index.html', 1500);
            return false;
        }
        return true;
    } catch (error) {
        window.location.href = 'login.html';
        return false;
    }
}

// ============================================
// CRUD de Usuarios
// ============================================

async function cargarUsuarios() {
    const tbody = document.getElementById('tablaUsuariosBody');
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="6" class="text-center">Cargando usuarios...</td></tr>';
    try {
        console.log('Cargando usuarios desde:', `${API_BASE_URL}/usuarios`);
        const response = await fetch(`${API_BASE_URL}/usuarios`, {
            method: 'GET',
            headers: getHeaders()
        });
        console.log('Respuesta del servidor - Status:', response.status);
        if (response.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            mostrarAlerta('Sesion expirada. Por favor inicia sesion nuevamente.', 'warning');
            setTimeout(() => window.location.href = 'login.html', 2000);
            return;
        }
        if (response.status === 403) {
            mostrarAlerta('No tienes permisos para ver usuarios', 'danger');
            return;
        }
        if (response.ok) {
            const usuarios = await response.json();
            console.log('Usuarios cargados:', usuarios.length);
            actualizarTablaUsuarios(usuarios);
        } else {
            const error = await response.json();
            console.error('Error del servidor:', error);
            tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error: ${error.error || 'Error al cargar usuarios'}</td></tr>`;
            mostrarAlerta(error.error || 'Error al cargar usuarios', 'danger');
        }
    } catch (error) {
        console.error('Error en la peticion:', error);
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error de conexion al servidor</td></tr>';
        mostrarAlerta('Error de conexion al servidor', 'danger');
    }
}

function actualizarTablaUsuarios(usuarios) {
    const tbody = document.getElementById('tablaUsuariosBody');
    if (!tbody) return;
    if (!usuarios || usuarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay usuarios registrados</td></tr>';
        return;
    }
    tbody.innerHTML = '';
    usuarios.forEach(usuario => {
        const rolNombre = usuario.rol ? usuario.rol.nombre : 'Sin rol';
        const estadoNombre = usuario.estado ? usuario.estado.nombre : 'Sin estado';
        const estadoClass = (estadoNombre === 'activo' || estadoNombre === 'Activo') ? 'badge bg-success' : 'badge bg-danger';
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${escapeHtml(String(usuario.idUsuario || ''))}</td>
            <td>${escapeHtml(usuario.nombreUsuario || '')}</td>
            <td>${escapeHtml(usuario.nombreCompleto || '')}</td>
            <td>${escapeHtml(rolNombre)}</td>
            <td><span class="${estadoClass}">${escapeHtml(estadoNombre)}</span></td>
            <td class="table-actions">
                <button class="btn btn-sm btn-warning me-1" onclick="editarUsuario(${usuario.idUsuario})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="eliminarUsuario(${usuario.idUsuario})" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
    });
}

function limpiarFormularioUsuario() {
    document.getElementById('usuarioId').value = '';
    document.getElementById('usuarioUsername').value = '';
    document.getElementById('usuarioPassword').value = '';
    document.getElementById('usuarioNombreCompleto').value = '';
    document.getElementById('usuarioEmail').value = '';
    document.getElementById('usuarioRol').value = '2';
    document.getElementById('usuarioEstado').value = '1';
    document.getElementById('usuarioModalLabel').innerText = 'Nuevo Usuario';
}

async function editarUsuario(id) {
    try {
        // Primero obtener la lista completa de usuarios (alternativa más confiable)
        const response = await fetch(`${API_BASE_URL}/usuarios`, {
            method: 'GET',
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Error al cargar usuarios');
        const usuarios = await response.json();
        const usuario = usuarios.find(u => u.idUsuario === id);
        if (!usuario) {
            mostrarAlerta('Usuario no encontrado', 'danger');
            return;
        }
        // Llenar el formulario
        document.getElementById('usuarioId').value = usuario.idUsuario;
        document.getElementById('usuarioUsername').value = usuario.nombreUsuario || '';
        document.getElementById('usuarioPassword').value = '';
        document.getElementById('usuarioNombreCompleto').value = usuario.nombreCompleto || '';
        document.getElementById('usuarioEmail').value = usuario.email || '';
        document.getElementById('usuarioRol').value = usuario.rol?.idRol || 2;
        document.getElementById('usuarioEstado').value = usuario.estado?.idEstadoUsuario || 1;
        document.getElementById('usuarioModalLabel').innerText = 'Editar Usuario';
        // Abrir el modal
        const modalElement = document.getElementById('usuarioModal');
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    } catch (error) {
        console.error('Error al editar usuario:', error);
        mostrarAlerta('Error al cargar los datos del usuario: ' + error.message, 'danger');
    }
}

async function guardarUsuario() {
    const usuarioId = document.getElementById('usuarioId').value;
    const username = document.getElementById('usuarioUsername').value.trim();
    const nombreCompleto = document.getElementById('usuarioNombreCompleto').value.trim();
    const email = document.getElementById('usuarioEmail').value.trim();
    const password = document.getElementById('usuarioPassword').value;
    const rolId = parseInt(document.getElementById('usuarioRol').value);
    const estadoId = parseInt(document.getElementById('usuarioEstado').value);
    
    if (!username) {
        mostrarAlerta('El nombre de usuario es obligatorio', 'warning');
        return;
    }
    if (!nombreCompleto) {
        mostrarAlerta('El nombre completo es obligatorio', 'warning');
        return;
    }
    if (!email) {
        mostrarAlerta('El correo electronico es obligatorio', 'warning');
        return;
    }
    if (!usuarioId && (!password || password.length < 4)) {
        mostrarAlerta('La contrasena debe tener al menos 4 caracteres para nuevos usuarios', 'warning');
        return;
    }
    
    const btnGuardar = document.getElementById('btnGuardarUsuario');
    const textoOriginal = btnGuardar.innerHTML;
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = 'Guardando...';
    
    const datosEnvio = {
        nombreUsuario: username,
        nombreCompleto: nombreCompleto,
        email: email,
        idRol: rolId,
        idEstadoUsuario: estadoId
    };
    if (password && password.trim() !== '') {
        datosEnvio.contrasenaHash = password;
    }
    
    console.log('Datos a enviar:', datosEnvio);
    
    try {
        const url = usuarioId ? `${API_BASE_URL}/usuarios/${usuarioId}` : `${API_BASE_URL}/usuarios`;
        const method = usuarioId ? 'PUT' : 'POST';
        const response = await fetch(url, {
            method: method,
            headers: getHeaders(),
            body: JSON.stringify(datosEnvio)
        });
        
        if (response.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            mostrarAlerta('Sesion expirada', 'warning');
            setTimeout(() => window.location.href = 'login.html', 1500);
            return;
        }
        
        if (response.ok) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('usuarioModal'));
            if (modal) modal.hide();
            await cargarUsuarios();
            mostrarAlerta(usuarioId ? 'Usuario actualizado exitosamente' : 'Usuario creado exitosamente', 'success');
            limpiarFormularioUsuario();
        } else {
            let mensajeError = 'Error al guardar el usuario';
            try {
                const error = await response.json();
                mensajeError = error.error || error.message || mensajeError;
                if (mensajeError.toLowerCase().includes('duplicate') || mensajeError.toLowerCase().includes('unique')) {
                    mensajeError = 'El nombre de usuario o correo electronico ya existe';
                }
            } catch(e) {
                const textError = await response.text();
                if (textError.includes('duplicate') || textError.includes('Duplicate')) {
                    mensajeError = 'El nombre de usuario o correo electronico ya existe';
                }
            }
            mostrarAlerta(mensajeError, 'danger');
        }
    } catch (error) {
        console.error('Error al guardar usuario:', error);
        mostrarAlerta('Error de conexion al servidor: ' + error.message, 'danger');
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.innerHTML = textoOriginal;
    }
}

async function eliminarUsuario(id) {
    if (!confirm('¿Esta seguro de eliminar este usuario? Esta accion no se puede deshacer.')) return;
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (response.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            mostrarAlerta('Sesion expirada', 'warning');
            setTimeout(() => window.location.href = 'login.html', 1500);
            return;
        }
        if (response.ok) {
            await cargarUsuarios();
            mostrarAlerta('Usuario eliminado exitosamente', 'success');
        } else {
            const error = await response.json();
            mostrarAlerta(error.error || 'Error al eliminar el usuario', 'danger');
        }
    } catch (error) {
        console.error('Error al eliminar usuario:', error);
        mostrarAlerta('Error de conexion al servidor', 'danger');
    }
}

function cerrarSesion() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// ============================================
// Inicializacion
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    console.log('=== INICIANDO MODULO DE USUARIOS ===');
    console.log('API_BASE_URL:', API_BASE_URL);
    if (!verificarAcceso()) return;
    mostrarInfoUsuario();
    cargarUsuarios();
    
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) btnLogout.addEventListener('click', (e) => { e.preventDefault(); cerrarSesion(); });
    
    const btnGuardar = document.getElementById('btnGuardarUsuario');
    if (btnGuardar) {
        btnGuardar.removeEventListener('click', guardarUsuario);
        btnGuardar.addEventListener('click', guardarUsuario);
    }
    
    const btnNuevo = document.getElementById('btnNuevoUsuario');
    if (btnNuevo) {
        btnNuevo.removeEventListener('click', limpiarFormularioUsuario);
        btnNuevo.addEventListener('click', () => {
            limpiarFormularioUsuario();
            const modal = new bootstrap.Modal(document.getElementById('usuarioModal'));
            modal.show();
        });
    }
});

window.editarUsuario = editarUsuario;
window.eliminarUsuario = eliminarUsuario;
window.limpiarFormularioUsuario = limpiarFormularioUsuario;
window.guardarUsuario = guardarUsuario;