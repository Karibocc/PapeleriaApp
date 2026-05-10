// ============================================
// clientes.js - Gestión de Clientes
// Papelería App
// ============================================

const API_BASE_URL = 'http://localhost:8085/api';
let tablaClientes = null;
let clientesData = [];
let clientesPieChart = null;
let clientesLineChart = null;

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

async function cargarClientes() {
    try {
        const response = await fetch(`${API_BASE_URL}/clientes`, { headers: getHeaders() });
        if (response.ok) {
            clientesData = await response.json();
            const totalClientes = document.getElementById('totalClientes');
            if (totalClientes) {
                totalClientes.innerText = clientesData.length;
            }
            actualizarTablaClientes();
            actualizarGraficasClientes();
        }
    } catch (error) {
        console.error('Error cargando clientes:', error);
    }
}

function actualizarTablaClientes() {
    const pageLength = parseInt(document.getElementById('pageLength')?.value || 10);
    const thAcciones = document.getElementById('thAccionesClientes');
    const mostrarAcciones = thAcciones && thAcciones.style.display !== 'none';
    
    if (tablaClientes) {
        tablaClientes.destroy();
    }
    
    tablaClientes = $('#tablaClientes').DataTable({
        data: clientesData,
        pageLength: pageLength,
        lengthMenu: [5, 10, 25, 50, 100],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json'
        },
        columns: [
            { data: 'idCliente' },
            { data: 'nombre' },
            { data: 'correo', defaultContent: '-' },
            { data: 'telefono', defaultContent: '-' },
            { data: 'direccion', defaultContent: '-' },
            { data: 'fechaCreacion', render: data => data ? new Date(data).toLocaleDateString() : '-' },
            { 
                data: null, 
                orderable: false, 
                visible: mostrarAcciones,
                render: (data) => `
                    <button class="btn btn-sm btn-warning me-1" onclick="editarCliente(${data.idCliente})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarCliente(${data.idCliente})">
                        <i class="fas fa-trash"></i>
                    </button>
                `
            }
        ]
    });
    
    document.getElementById('pageLength')?.addEventListener('change', () => actualizarTablaClientes());
}

function actualizarGraficasClientes() {
    // Gráfico de distribución (solo muestra total)
    const ctxPie = document.getElementById('clientesChart');
    if (ctxPie) {
        const existingChart = Chart.getChart(ctxPie);
        if (existingChart) existingChart.destroy();
        
        new Chart(ctxPie, {
            type: 'pie',
            data: {
                labels: ['Clientes registrados'],
                datasets: [{ data: [clientesData.length], backgroundColor: ['#667eea'] }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: { legend: { position: 'bottom' } }
            }
        });
    }
    
    // Gráfico de líneas por mes
    const clientesPorMes = {};
    clientesData.forEach(cliente => {
        if (cliente.fechaCreacion) {
            const fecha = new Date(cliente.fechaCreacion);
            const mesKey = `${fecha.getFullYear()}-${fecha.getMonth() + 1}`;
            clientesPorMes[mesKey] = (clientesPorMes[mesKey] || 0) + 1;
        }
    });
    
    const meses = Object.keys(clientesPorMes).sort();
    const cantidades = meses.map(m => clientesPorMes[m]);
    
    const ctxLine = document.getElementById('clientesLineChart');
    if (ctxLine) {
        const existingChart = Chart.getChart(ctxLine);
        if (existingChart) existingChart.destroy();
        
        new Chart(ctxLine, {
            type: 'line',
            data: {
                labels: meses,
                datasets: [{
                    label: 'Clientes registrados',
                    data: cantidades,
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    fill: true,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true
            }
        });
    }
}

function limpiarFormularioCliente() {
    document.getElementById('clienteId').value = '';
    document.getElementById('clienteNombre').value = '';
    document.getElementById('clienteCorreo').value = '';
    document.getElementById('clienteTelefono').value = '';
    document.getElementById('clienteDireccion').value = '';
}

async function editarCliente(id) {
    const cliente = clientesData.find(c => c.idCliente === id);
    if (cliente) {
        document.getElementById('clienteId').value = cliente.idCliente;
        document.getElementById('clienteNombre').value = cliente.nombre;
        document.getElementById('clienteCorreo').value = cliente.correo || '';
        document.getElementById('clienteTelefono').value = cliente.telefono || '';
        document.getElementById('clienteDireccion').value = cliente.direccion || '';
        new bootstrap.Modal(document.getElementById('clienteModal')).show();
    }
}

async function guardarCliente() {
    const cliente = {
        idCliente: document.getElementById('clienteId').value || null,
        nombre: document.getElementById('clienteNombre').value,
        correo: document.getElementById('clienteCorreo').value,
        telefono: document.getElementById('clienteTelefono').value,
        direccion: document.getElementById('clienteDireccion').value
    };
    
    try {
        const url = cliente.idCliente ? `${API_BASE_URL}/clientes/${cliente.idCliente}` : `${API_BASE_URL}/clientes`;
        const method = cliente.idCliente ? 'PUT' : 'POST';
        const response = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(cliente) });
        
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('clienteModal')).hide();
            cargarClientes();
        } else {
            const error = await response.json();
            alert(error.error || 'Error al guardar el cliente');
        }
    } catch (error) {
        console.error('Error guardando cliente:', error);
        alert('Error de conexión');
    }
}

async function eliminarCliente(id) {
    if (confirm('¿Está seguro de eliminar este cliente? Esta acción no se puede deshacer.')) {
        try {
            const response = await fetch(`${API_BASE_URL}/clientes/${id}`, { method: 'DELETE', headers: getHeaders() });
            if (response.ok) {
                cargarClientes();
            } else {
                const error = await response.json();
                alert(error.error || 'Error al eliminar el cliente');
            }
        } catch (error) {
            console.error('Error eliminando cliente:', error);
            alert('Error de conexión');
        }
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const btnNuevoCliente = document.getElementById('btnNuevoCliente');
    const thAcciones = document.getElementById('thAccionesClientes');
    
    if (userData.rol === 'ADMIN' || userData.rol === 'VENDEDOR') {
        if (btnNuevoCliente) btnNuevoCliente.style.display = 'block';
        if (thAcciones) thAcciones.style.display = 'table-cell';
    } else {
        if (btnNuevoCliente) btnNuevoCliente.style.display = 'none';
        if (thAcciones) thAcciones.style.display = 'none';
    }
    
    cargarClientes();
});

// Exponer funciones globales
window.cargarListaClientes = cargarClientes;
window.limpiarFormularioCliente = limpiarFormularioCliente;
window.editarCliente = editarCliente;
window.guardarCliente = guardarCliente;
window.eliminarCliente = eliminarCliente;