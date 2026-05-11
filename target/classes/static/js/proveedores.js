// ============================================
// proveedores.js - Gestión de Proveedores
// Papelería App
// ============================================

const API_BASE_URL = 'http://localhost:8085/api';
let tablaProveedores = null;
let proveedoresData = [];
let proveedoresChart = null;

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

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function cargarProveedores() {
    try {
        const response = await fetch(API_BASE_URL + '/proveedores', { headers: getHeaders() });
        
        if (response.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            mostrarAlerta('Sesión expirada', 'warning');
            setTimeout(function() {
                window.location.href = 'login.html';
            }, 1500);
            return;
        }
        
        if (response.ok) {
            proveedoresData = await response.json();
            const totalProveedores = document.getElementById('totalProveedores');
            if (totalProveedores) {
                totalProveedores.innerText = proveedoresData.length;
            }
            actualizarTablaProveedores();
            actualizarGraficaProveedores();
        } else {
            mostrarAlerta('Error al cargar proveedores', 'danger');
        }
    } catch (error) {
        console.error('Error cargando proveedores:', error);
        mostrarAlerta('Error de conexión al servidor', 'danger');
    }
}

function actualizarTablaProveedores() {
    const pageLength = parseInt(document.getElementById('pageLength')?.value || 10);
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const rolesPermitidos = ['ADMIN', 'admin', 'COMPRAS', 'compras'];
    let mostrarAcciones = false;
    for (var i = 0; i < rolesPermitidos.length; i++) {
        if (userData.rol === rolesPermitidos[i]) {
            mostrarAcciones = true;
            break;
        }
    }
    
    if (tablaProveedores) {
        tablaProveedores.destroy();
    }
    
    tablaProveedores = $('#tablaProveedores').DataTable({
        data: proveedoresData,
        pageLength: pageLength,
        lengthMenu: [5, 10, 25, 50, 100],
        language: {
            "decimal": "",
            "emptyTable": "No hay datos disponibles en la tabla",
            "info": "Mostrando _START_ a _END_ de _TOTAL_ registros",
            "infoEmpty": "Mostrando 0 a 0 de 0 registros",
            "infoFiltered": "(filtrado de _MAX_ registros totales)",
            "infoPostFix": "",
            "thousands": ",",
            "lengthMenu": "Mostrar _MENU_ registros",
            "loadingRecords": "Cargando...",
            "processing": "Procesando...",
            "search": "Buscar:",
            "zeroRecords": "No se encontraron resultados",
            "paginate": {
                "first": "Primero",
                "last": "Último",
                "next": "Siguiente",
                "previous": "Anterior"
            },
            "aria": {
                "sortAscending": ": activar para ordenar la columna de manera ascendente",
                "sortDescending": ": activar para ordenar la columna de manera descendente"
            }
        },
        columns: [
            { data: 'idProveedor' },
            { data: 'nombre' },
            { data: 'nit', defaultContent: '-' },
            { data: 'contacto', defaultContent: '-' },
            { data: 'telefono', defaultContent: '-' },
            { 
                data: 'estado', 
                render: function(data) { 
                    if (data === 'activo' || data === true) {
                        return '<span class="badge bg-success">Activo</span>';
                    } else {
                        return '<span class="badge bg-danger">Inactivo</span>';
                    }
                }
            },
            { 
                data: null, 
                orderable: false, 
                visible: mostrarAcciones,
                render: function(data) {
                    return '<button class="btn btn-sm btn-warning me-1" onclick="editarProveedor(' + data.idProveedor + ')" title="Editar">' +
                               '<i class="fas fa-edit"></i>' +
                           '</button>' +
                           '<button class="btn btn-sm btn-danger" onclick="eliminarProveedor(' + data.idProveedor + ')" title="Eliminar">' +
                               '<i class="fas fa-trash"></i>' +
                           '</button>';
                }
            }
        ]
    });
    
    const pageLengthSelect = document.getElementById('pageLength');
    if (pageLengthSelect) {
        pageLengthSelect.addEventListener('change', function() {
            if (tablaProveedores) {
                tablaProveedores.page.len(parseInt(pageLengthSelect.value)).draw();
            }
        });
    }
}

function actualizarGraficaProveedores() {
    let activos = 0;
    let inactivos = 0;
    for (var i = 0; i < proveedoresData.length; i++) {
        const p = proveedoresData[i];
        if (p.estado === 'activo' || p.estado === true) {
            activos++;
        } else {
            inactivos++;
        }
    }
    
    const ctx = document.getElementById('proveedoresChart');
    if (ctx) {
        const existingChart = Chart.getChart(ctx);
        if (existingChart) existingChart.destroy();
        
        new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Activos', 'Inactivos'],
                datasets: [{
                    data: [activos, inactivos],
                    backgroundColor: ['#28a745', '#dc3545'],
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
}

function limpiarFormularioProveedor() {
    document.getElementById('proveedorId').value = '';
    document.getElementById('nombre').value = '';
    document.getElementById('nit').value = '';
    document.getElementById('contacto').value = '';
    document.getElementById('telefono').value = '';
    document.getElementById('correo').value = '';
    document.getElementById('direccion').value = '';
    document.getElementById('estado').value = 'activo';
    document.getElementById('proveedorModalLabel').innerText = 'Nuevo Proveedor';
}

async function editarProveedor(id) {
    try {
        const response = await fetch(API_BASE_URL + '/proveedores/' + id, { headers: getHeaders() });
        
        if (response.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            mostrarAlerta('Sesión expirada', 'warning');
            setTimeout(function() {
                window.location.href = 'login.html';
            }, 1500);
            return;
        }
        
        if (response.ok) {
            const proveedor = await response.json();
            document.getElementById('proveedorId').value = proveedor.idProveedor;
            document.getElementById('nombre').value = proveedor.nombre || '';
            document.getElementById('nit').value = proveedor.nit || '';
            document.getElementById('contacto').value = proveedor.contacto || '';
            document.getElementById('telefono').value = proveedor.telefono || '';
            document.getElementById('correo').value = proveedor.correo || '';
            document.getElementById('direccion').value = proveedor.direccion || '';
            document.getElementById('estado').value = proveedor.estado === 'activo' ? 'activo' : 'inactivo';
            document.getElementById('proveedorModalLabel').innerText = 'Editar Proveedor';
            new bootstrap.Modal(document.getElementById('proveedorModal')).show();
        } else {
            mostrarAlerta('Error al cargar el proveedor', 'danger');
        }
    } catch (error) {
        console.error('Error editar proveedor:', error);
        mostrarAlerta('Error de conexión al servidor', 'danger');
    }
}

async function guardarProveedor() {
    const proveedorId = document.getElementById('proveedorId').value;
    const nombre = document.getElementById('nombre').value;
    
    if (!nombre || nombre.trim() === '') {
        mostrarAlerta('El nombre del proveedor es obligatorio', 'warning');
        return;
    }
    
    const proveedor = {
        nombre: nombre.trim(),
        nit: document.getElementById('nit').value || null,
        contacto: document.getElementById('contacto').value || null,
        telefono: document.getElementById('telefono').value || null,
        correo: document.getElementById('correo').value || null,
        direccion: document.getElementById('direccion').value || null,
        estado: document.getElementById('estado').value
    };
    
    const btnGuardar = document.getElementById('btnGuardarProveedor');
    const textoOriginal = btnGuardar.innerHTML;
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    
    try {
        const url = proveedorId ? API_BASE_URL + '/proveedores/' + proveedorId : API_BASE_URL + '/proveedores';
        const method = proveedorId ? 'PUT' : 'POST';
        const response = await fetch(url, { 
            method: method, 
            headers: getHeaders(), 
            body: JSON.stringify(proveedor) 
        });
        
        if (response.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            mostrarAlerta('Sesión expirada', 'warning');
            setTimeout(function() {
                window.location.href = 'login.html';
            }, 1500);
            return;
        }
        
        if (response.ok) {
            const modal = bootstrap.Modal.getInstance(document.getElementById('proveedorModal'));
            if (modal) modal.hide();
            
            await cargarProveedores();
            mostrarAlerta(proveedorId ? 'Proveedor actualizado exitosamente' : 'Proveedor creado exitosamente', 'success');
            limpiarFormularioProveedor();
        } else {
            let mensajeError = 'Error al guardar el proveedor';
            try {
                const error = await response.json();
                mensajeError = error.error || mensajeError;
            } catch(e) {
                const textError = await response.text();
                if (textError.includes('duplicate')) {
                    mensajeError = 'Ya existe un proveedor con este NIT';
                }
            }
            mostrarAlerta(mensajeError, 'danger');
        }
    } catch (error) {
        console.error('Error guardando proveedor:', error);
        mostrarAlerta('Error de conexión al servidor', 'danger');
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.innerHTML = textoOriginal;
    }
}

async function eliminarProveedor(id) {
    if (confirm('¿Está seguro de eliminar este proveedor? Esta acción no se puede deshacer.')) {
        try {
            const response = await fetch(API_BASE_URL + '/proveedores/' + id, { method: 'DELETE', headers: getHeaders() });
            
            if (response.status === 401) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('currentUser');
                mostrarAlerta('Sesión expirada', 'warning');
                setTimeout(function() {
                    window.location.href = 'login.html';
                }, 1500);
                return;
            }
            
            if (response.ok) {
                await cargarProveedores();
                mostrarAlerta('Proveedor eliminado exitosamente', 'success');
            } else {
                const error = await response.json();
                mostrarAlerta(error.error || 'Error al eliminar el proveedor', 'danger');
            }
        } catch (error) {
            console.error('Error eliminando proveedor:', error);
            mostrarAlerta('Error de conexión al servidor', 'danger');
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const btnNuevoProveedor = document.getElementById('btnNuevoProveedor');
    
    console.log('Usuario logueado en proveedores:', userData);
    
    if (!getAuthToken()) {
        window.location.href = 'login.html';
        return;
    }
    
    document.getElementById('userName').innerText = userData.nombreCompleto || userData.username || 'Usuario';
    document.getElementById('userRolBadge').innerText = userData.rol || '';
    document.getElementById('userRolText').innerHTML = '<strong>Rol:</strong> ' + (userData.rol || '');
    
    const rolesPermitidos = ['ADMIN', 'admin', 'COMPRAS', 'compras'];
    let tienePermiso = false;
    for (var i = 0; i < rolesPermitidos.length; i++) {
        if (userData.rol === rolesPermitidos[i]) {
            tienePermiso = true;
            break;
        }
    }
    
    if (tienePermiso) {
        if (btnNuevoProveedor) {
            btnNuevoProveedor.style.display = 'block';
            console.log('Botón Nuevo Proveedor visible');
        }
        cargarProveedores();
    } else {
        if (btnNuevoProveedor) {
            btnNuevoProveedor.style.display = 'none';
            console.log('Botón Nuevo Proveedor oculto');
        }
    }
    
    if (btnNuevoProveedor) {
        btnNuevoProveedor.removeEventListener('click', limpiarFormularioProveedor);
        btnNuevoProveedor.addEventListener('click', function() {
            limpiarFormularioProveedor();
            const modal = new bootstrap.Modal(document.getElementById('proveedorModal'));
            modal.show();
        });
    }
    
    const btnGuardar = document.getElementById('btnGuardarProveedor');
    if (btnGuardar) {
        btnGuardar.removeEventListener('click', guardarProveedor);
        btnGuardar.addEventListener('click', guardarProveedor);
    }
});

window.cargarListaProveedores = cargarProveedores;
window.limpiarFormularioProveedor = limpiarFormularioProveedor;
window.editarProveedor = editarProveedor;
window.guardarProveedor = guardarProveedor;
window.eliminarProveedor = eliminarProveedor;