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

async function cargarClientes() {
    try {
        const response = await fetch(API_BASE_URL + '/clientes', { headers: getHeaders() });
        
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
            clientesData = await response.json();
            const totalClientes = document.getElementById('totalClientes');
            if (totalClientes) {
                totalClientes.innerText = clientesData.length;
            }
            actualizarTablaClientes();
            actualizarGraficasClientes();
        } else {
            mostrarAlerta('Error al cargar clientes', 'danger');
        }
    } catch (error) {
        console.error('Error cargando clientes:', error);
        mostrarAlerta('Error de conexión al servidor', 'danger');
    }
}

function actualizarTablaClientes() {
    const pageLength = parseInt(document.getElementById('pageLength')?.value || 10);
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const mostrarAcciones = (userData.rol === 'ADMIN' || userData.rol === 'admin' || userData.rol === 'VENDEDOR' || userData.rol === 'vendedor');
    
    if (tablaClientes) {
        tablaClientes.destroy();
    }
    
    tablaClientes = $('#tablaClientes').DataTable({
        data: clientesData,
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
            { data: 'idCliente' },
            { data: 'nombre' },
            { data: 'documento', defaultContent: '-' },
            { data: 'email', defaultContent: '-' },
            { data: 'telefono', defaultContent: '-' },
            { 
                data: 'activo', 
                render: function(data) { 
                    return data ? '<span class="badge bg-success">Activo</span>' : '<span class="badge bg-danger">Inactivo</span>'; 
                }
            },
            { 
                data: null, 
                orderable: false, 
                visible: mostrarAcciones,
                render: function(data) {
                    return '<button class="btn btn-sm btn-warning me-1" onclick="editarCliente(' + data.idCliente + ')" title="Editar">' +
                               '<i class="fas fa-edit"></i>' +
                           '</button>' +
                           '<button class="btn btn-sm btn-danger" onclick="eliminarCliente(' + data.idCliente + ')" title="Eliminar">' +
                               '<i class="fas fa-trash"></i>' +
                           '</button>';
                }
            }
        ]
    });
    
    const pageLengthSelect = document.getElementById('pageLength');
    if (pageLengthSelect) {
        pageLengthSelect.addEventListener('change', function() {
            if (tablaClientes) {
                tablaClientes.page.len(parseInt(pageLengthSelect.value)).draw();
            }
        });
    }
}

function actualizarGraficasClientes() {
    let activos = 0;
    let inactivos = 0;
    for (var i = 0; i < clientesData.length; i++) {
        if (clientesData[i].activo === true) {
            activos++;
        } else {
            inactivos++;
        }
    }
    
    const ctxPie = document.getElementById('clientesChart');
    if (ctxPie) {
        const existingChart = Chart.getChart(ctxPie);
        if (existingChart) existingChart.destroy();
        
        new Chart(ctxPie, {
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
    
    const clientesPorMes = {};
    for (var i = 0; i < clientesData.length; i++) {
        const cliente = clientesData[i];
        if (cliente.fechaCreacion) {
            const fecha = new Date(cliente.fechaCreacion);
            const mesKey = fecha.getFullYear() + '-' + (fecha.getMonth() + 1);
            if (clientesPorMes[mesKey] === undefined) {
                clientesPorMes[mesKey] = 0;
            }
            clientesPorMes[mesKey] = clientesPorMes[mesKey] + 1;
        }
    }
    
    const meses = Object.keys(clientesPorMes).sort();
    const cantidades = [];
    for (var i = 0; i < meses.length; i++) {
        cantidades.push(clientesPorMes[meses[i]]);
    }
    
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
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }
}

function limpiarFormularioCliente() {
    document.getElementById('clienteId').value = '';
    document.getElementById('nombre').value = '';
    document.getElementById('documento').value = '';
    document.getElementById('email').value = '';
    document.getElementById('telefono').value = '';
    document.getElementById('direccion').value = '';
    document.getElementById('activo').value = 'true';
    document.getElementById('clienteModalLabel').innerText = 'Nuevo Cliente';
}

async function editarCliente(id) {
    try {
        const response = await fetch(API_BASE_URL + '/clientes/' + id, { headers: getHeaders() });
        
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
            const cliente = await response.json();
            document.getElementById('clienteId').value = cliente.idCliente;
            document.getElementById('nombre').value = cliente.nombre || '';
            document.getElementById('documento').value = cliente.documento || '';
            document.getElementById('email').value = cliente.email || '';
            document.getElementById('telefono').value = cliente.telefono || '';
            document.getElementById('direccion').value = cliente.direccion || '';
            document.getElementById('activo').value = cliente.activo ? 'true' : 'false';
            document.getElementById('clienteModalLabel').innerText = 'Editar Cliente';
            new bootstrap.Modal(document.getElementById('clienteModal')).show();
        } else {
            mostrarAlerta('Error al cargar el cliente', 'danger');
        }
    } catch (error) {
        console.error('Error editar cliente:', error);
        mostrarAlerta('Error de conexión al servidor', 'danger');
    }
}

async function guardarCliente() {
    const clienteId = document.getElementById('clienteId').value;
    const nombre = document.getElementById('nombre').value;
    
    if (!nombre || nombre.trim() === '') {
        mostrarAlerta('El nombre del cliente es obligatorio', 'warning');
        return;
    }
    
    const cliente = {
        nombre: nombre.trim(),
        documento: document.getElementById('documento').value || null,
        email: document.getElementById('email').value || null,
        telefono: document.getElementById('telefono').value || null,
        direccion: document.getElementById('direccion').value || null,
        activo: document.getElementById('activo').value === 'true'
    };
    
    const btnGuardar = document.getElementById('btnGuardarCliente');
    const textoOriginal = btnGuardar.innerHTML;
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    
    try {
        const url = clienteId ? API_BASE_URL + '/clientes/' + clienteId : API_BASE_URL + '/clientes';
        const method = clienteId ? 'PUT' : 'POST';
        const response = await fetch(url, { 
            method: method, 
            headers: getHeaders(), 
            body: JSON.stringify(cliente) 
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
            const modal = bootstrap.Modal.getInstance(document.getElementById('clienteModal'));
            if (modal) modal.hide();
            
            await cargarClientes();
            mostrarAlerta(clienteId ? 'Cliente actualizado exitosamente' : 'Cliente creado exitosamente', 'success');
            limpiarFormularioCliente();
        } else {
            let mensajeError = 'Error al guardar el cliente';
            try {
                const error = await response.json();
                mensajeError = error.error || mensajeError;
            } catch(e) {
                const textError = await response.text();
                if (textError.includes('duplicate')) {
                    mensajeError = 'Ya existe un cliente con este documento';
                }
            }
            mostrarAlerta(mensajeError, 'danger');
        }
    } catch (error) {
        console.error('Error guardando cliente:', error);
        mostrarAlerta('Error de conexión al servidor', 'danger');
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.innerHTML = textoOriginal;
    }
}

async function eliminarCliente(id) {
    if (confirm('¿Está seguro de eliminar este cliente? Esta acción no se puede deshacer.')) {
        try {
            const response = await fetch(API_BASE_URL + '/clientes/' + id, { method: 'DELETE', headers: getHeaders() });
            
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
                await cargarClientes();
                mostrarAlerta('Cliente eliminado exitosamente', 'success');
            } else {
                const error = await response.json();
                mostrarAlerta(error.error || 'Error al eliminar el cliente', 'danger');
            }
        } catch (error) {
            console.error('Error eliminando cliente:', error);
            mostrarAlerta('Error de conexión al servidor', 'danger');
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const btnNuevoCliente = document.getElementById('btnNuevoCliente');
    
    console.log('Usuario logueado en clientes:', userData);
    
    if (!getAuthToken()) {
        window.location.href = 'login.html';
        return;
    }
    
    document.getElementById('userName').innerText = userData.nombreCompleto || userData.username || 'Usuario';
    document.getElementById('userRolBadge').innerText = userData.rol || '';
    document.getElementById('userRolText').innerHTML = '<strong>Rol:</strong> ' + (userData.rol || '');
    
    const rolesPermitidos = ['ADMIN', 'admin', 'ADMINISTRADOR', 'Administrador', 'VENDEDOR', 'vendedor'];
    let tienePermiso = false;
    for (var i = 0; i < rolesPermitidos.length; i++) {
        if (userData.rol === rolesPermitidos[i]) {
            tienePermiso = true;
            break;
        }
    }
    
    if (tienePermiso) {
        if (btnNuevoCliente) {
            btnNuevoCliente.style.display = 'block';
            console.log('Botón Nuevo Cliente visible');
        }
        cargarClientes();
    } else {
        if (btnNuevoCliente) {
            btnNuevoCliente.style.display = 'none';
            console.log('Botón Nuevo Cliente oculto');
        }
    }
    
    if (btnNuevoCliente) {
        btnNuevoCliente.removeEventListener('click', limpiarFormularioCliente);
        btnNuevoCliente.addEventListener('click', function() {
            limpiarFormularioCliente();
            const modal = new bootstrap.Modal(document.getElementById('clienteModal'));
            modal.show();
        });
    }
    
    const btnGuardar = document.getElementById('btnGuardarCliente');
    if (btnGuardar) {
        btnGuardar.removeEventListener('click', guardarCliente);
        btnGuardar.addEventListener('click', guardarCliente);
    }
});

window.cargarListaClientes = cargarClientes;
window.limpiarFormularioCliente = limpiarFormularioCliente;
window.editarCliente = editarCliente;
window.guardarCliente = guardarCliente;
window.eliminarCliente = eliminarCliente;