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
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

async function cargarProveedores() {
    try {
        const response = await fetch(`${API_BASE_URL}/proveedores`, { headers: getHeaders() });
        if (response.ok) {
            proveedoresData = await response.json();
            const totalProveedores = document.getElementById('totalProveedores');
            if (totalProveedores) {
                totalProveedores.innerText = proveedoresData.length;
            }
            actualizarTablaProveedores();
            actualizarGraficaProveedores();
        }
    } catch (error) {
        console.error('Error cargando proveedores:', error);
    }
}

function actualizarTablaProveedores() {
    const pageLength = parseInt(document.getElementById('pageLength')?.value || 10);
    const thAcciones = document.getElementById('thAccionesProveedores');
    const mostrarAcciones = thAcciones && thAcciones.style.display !== 'none';
    
    if (tablaProveedores) {
        tablaProveedores.destroy();
    }
    
    tablaProveedores = $('#tablaProveedores').DataTable({
        data: proveedoresData,
        pageLength: pageLength,
        lengthMenu: [5, 10, 25, 50, 100],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json'
        },
        columns: [
            { data: 'idProveedor' },
            { data: 'nombre' },
            { data: 'nit', defaultContent: '-' },
            { data: 'contacto', defaultContent: '-' },
            { data: 'telefono', defaultContent: '-' },
            { data: 'estado', render: data => data === 'activo' ? 'Activo' : 'Inactivo' },
            { 
                data: null, 
                orderable: false, 
                visible: mostrarAcciones,
                render: (data) => `
                    <button class="btn btn-sm btn-warning me-1" onclick="editarProveedor(${data.idProveedor})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarProveedor(${data.idProveedor})">
                        <i class="fas fa-trash"></i>
                    </button>
                `
            }
        ]
    });
    
    document.getElementById('pageLength')?.addEventListener('change', () => actualizarTablaProveedores());
}

function actualizarGraficaProveedores() {
    const activos = proveedoresData.filter(p => p.estado === 'activo').length;
    const inactivos = proveedoresData.length - activos;
    
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
                    backgroundColor: ['#1cc88a', '#e74a3b']
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
    document.getElementById('proveedorNombre').value = '';
    document.getElementById('proveedorNit').value = '';
    document.getElementById('proveedorContacto').value = '';
    document.getElementById('proveedorTelefono').value = '';
    document.getElementById('proveedorCorreo').value = '';
    document.getElementById('proveedorDireccion').value = '';
    document.getElementById('proveedorEstado').value = 'activo';
}

async function editarProveedor(id) {
    const proveedor = proveedoresData.find(p => p.idProveedor === id);
    if (proveedor) {
        document.getElementById('proveedorId').value = proveedor.idProveedor;
        document.getElementById('proveedorNombre').value = proveedor.nombre;
        document.getElementById('proveedorNit').value = proveedor.nit || '';
        document.getElementById('proveedorContacto').value = proveedor.contacto || '';
        document.getElementById('proveedorTelefono').value = proveedor.telefono || '';
        document.getElementById('proveedorCorreo').value = proveedor.correo || '';
        document.getElementById('proveedorDireccion').value = proveedor.direccion || '';
        document.getElementById('proveedorEstado').value = proveedor.estado || 'activo';
        new bootstrap.Modal(document.getElementById('proveedorModal')).show();
    }
}

async function guardarProveedor() {
    const proveedor = {
        idProveedor: document.getElementById('proveedorId').value || null,
        nombre: document.getElementById('proveedorNombre').value,
        nit: document.getElementById('proveedorNit').value,
        contacto: document.getElementById('proveedorContacto').value,
        telefono: document.getElementById('proveedorTelefono').value,
        correo: document.getElementById('proveedorCorreo').value,
        direccion: document.getElementById('proveedorDireccion').value,
        estado: document.getElementById('proveedorEstado').value
    };
    
    try {
        const url = proveedor.idProveedor ? `${API_BASE_URL}/proveedores/${proveedor.idProveedor}` : `${API_BASE_URL}/proveedores`;
        const method = proveedor.idProveedor ? 'PUT' : 'POST';
        const response = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(proveedor) });
        
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('proveedorModal')).hide();
            cargarProveedores();
        } else {
            const error = await response.json();
            alert(error.error || 'Error al guardar el proveedor');
        }
    } catch (error) {
        console.error('Error guardando proveedor:', error);
        alert('Error de conexión');
    }
}

async function eliminarProveedor(id) {
    if (confirm('¿Está seguro de eliminar este proveedor? Esta acción no se puede deshacer.')) {
        try {
            const response = await fetch(`${API_BASE_URL}/proveedores/${id}`, { method: 'DELETE', headers: getHeaders() });
            if (response.ok) {
                cargarProveedores();
            } else {
                const error = await response.json();
                alert(error.error || 'Error al eliminar el proveedor');
            }
        } catch (error) {
            console.error('Error eliminando proveedor:', error);
            alert('Error de conexión');
        }
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const btnNuevoProveedor = document.getElementById('btnNuevoProveedor');
    const thAcciones = document.getElementById('thAccionesProveedores');
    
    if (userData.rol === 'ADMIN') {
        if (btnNuevoProveedor) btnNuevoProveedor.style.display = 'block';
        if (thAcciones) thAcciones.style.display = 'table-cell';
    } else {
        if (btnNuevoProveedor) btnNuevoProveedor.style.display = 'none';
        if (thAcciones) thAcciones.style.display = 'none';
    }
    
    cargarProveedores();
});

// Exponer funciones globales
window.cargarListaProveedores = cargarProveedores;
window.limpiarFormularioProveedor = limpiarFormularioProveedor;
window.editarProveedor = editarProveedor;
window.guardarProveedor = guardarProveedor;
window.eliminarProveedor = eliminarProveedor;