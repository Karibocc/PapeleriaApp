// ============================================
// reportes.js - Gestión de Reportes
// Papelería App
// ============================================

const API_BASE_URL = 'http://localhost:8085/api';
let tablaTopProductos = null;
let tablaStockBajo = null;
let tablaVentas = null;
let tablaCompras = null;

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

async function cargarResumen() {
    try {
        const response = await fetch(API_BASE_URL + '/reportes/resumen', { headers: getHeaders() });
        if (response.ok) {
            const data = await response.json();
            const container = document.getElementById('resumenContainer');
            if (container) {
                container.innerHTML = 
                    '<div class="col-md-3">' +
                        '<div class="card resumen-card card-ventas">' +
                            '<div class="card-body">' +
                                '<h6 class="text-muted">Ventas Hoy</h6>' +
                                '<h3>$' + parseFloat(data.ventasHoy || 0).toFixed(2) + '</h3>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="col-md-3">' +
                        '<div class="card resumen-card card-ventas">' +
                            '<div class="card-body">' +
                                '<h6 class="text-muted">Ventas del Mes</h6>' +
                                '<h3>$' + parseFloat(data.ventasMes || 0).toFixed(2) + '</h3>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="col-md-3">' +
                        '<div class="card resumen-card card-compras">' +
                            '<div class="card-body">' +
                                '<h6 class="text-muted">Compras Hoy</h6>' +
                                '<h3>$' + parseFloat(data.comprasHoy || 0).toFixed(2) + '</h3>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                    '<div class="col-md-3">' +
                        '<div class="card resumen-card card-compras">' +
                            '<div class="card-body">' +
                                '<h6 class="text-muted">Compras del Mes</h6>' +
                                '<h3>$' + parseFloat(data.comprasMes || 0).toFixed(2) + '</h3>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
            }
        }
    } catch (error) {
        console.error('Error cargando resumen:', error);
    }
}

async function cargarReporteVentas() {
    const inicio = document.getElementById('fechaInicioVentas').value;
    const fin = document.getElementById('fechaFinVentas').value;
    
    if (!inicio || !fin) {
        mostrarAlerta('Seleccione las fechas de inicio y fin', 'warning');
        return;
    }
    
    try {
        const response = await fetch(API_BASE_URL + '/reportes/ventas?inicio=' + inicio + '&fin=' + fin, { headers: getHeaders() });
        if (response.ok) {
            const ventas = await response.json();
            const container = document.getElementById('tablaVentasContainer');
            
            if (tablaVentas) {
                tablaVentas.destroy();
            }
            
            container.innerHTML = '<table id="tablaVentas" class="table table-striped">' +
                '<thead>' +
                '<tr><th>ID</th><th>Fecha</th><th>Cliente</th><th>Vendedor</th><th>Total</th><th>Método Pago</th>' +
                '</thead><tbody></tbody></table>';
            
            tablaVentas = $('#tablaVentas').DataTable({
                data: ventas,
                columns: [
                    { data: 'fecha' },
                    { data: 'cantidadVentas' },
                    { data: 'totalIngresos', render: function(data) { return '$' + parseFloat(data).toFixed(2); } },
                    { data: 'totalUtilidad', render: function(data) { return '$' + parseFloat(data).toFixed(2); } }
                ],
                language: {
                    "decimal": "",
                    "emptyTable": "No hay datos disponibles",
                    "info": "Mostrando _START_ a _END_ de _TOTAL_ registros",
                    "infoEmpty": "Mostrando 0 a 0 de 0 registros",
                    "infoFiltered": "(filtrado de _MAX_ registros totales)",
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
                    }
                },
                order: [[0, 'desc']]
            });
        }
    } catch (error) {
        console.error('Error cargando reporte de ventas:', error);
    }
}

function generarReporteVentasPDF() {
    const inicio = document.getElementById('fechaInicioVentas').value;
    const fin = document.getElementById('fechaFinVentas').value;
    if (inicio && fin) {
        window.open(API_BASE_URL + '/reportes/ventas/pdf?inicio=' + inicio + '&fin=' + fin, '_blank');
    } else {
        mostrarAlerta('Seleccione las fechas de inicio y fin', 'warning');
    }
}

function generarReporteComprasPDF() {
    const inicio = document.getElementById('fechaInicioCompras').value;
    const fin = document.getElementById('fechaFinCompras').value;
    if (inicio && fin) {
        window.open(API_BASE_URL + '/reportes/compras/pdf?inicio=' + inicio + '&fin=' + fin, '_blank');
    } else {
        mostrarAlerta('Seleccione las fechas de inicio y fin', 'warning');
    }
}

async function cargarTopProductos() {
    const inicio = document.getElementById('topInicio').value;
    const fin = document.getElementById('topFin').value;
    const limit = document.getElementById('topLimit').value || 10;
    
    if (!inicio || !fin) {
        mostrarAlerta('Seleccione las fechas', 'warning');
        return;
    }
    
    try {
        const response = await fetch(API_BASE_URL + '/reportes/productos/mas-vendidos?inicio=' + inicio + '&fin=' + fin + '&limit=' + limit, { headers: getHeaders() });
        if (response.ok) {
            const productos = await response.json();
            
            if (tablaTopProductos) {
                tablaTopProductos.destroy();
            }
            
            tablaTopProductos = $('#tablaTopProductos').DataTable({
                data: productos,
                columns: [
                    { data: 'nombre' },
                    { data: 'categoria', defaultContent: '-' },
                    { data: 'cantidadVendida', defaultContent: '0' },
                    { data: 'totalVendido', render: function(data) { return '$' + parseFloat(data).toFixed(2); } }
                ],
                language: {
                    "decimal": "",
                    "emptyTable": "No hay datos disponibles",
                    "info": "Mostrando _START_ a _END_ de _TOTAL_ registros",
                    "infoEmpty": "Mostrando 0 a 0 de 0 registros",
                    "lengthMenu": "Mostrar _MENU_ registros",
                    "loadingRecords": "Cargando...",
                    "search": "Buscar:",
                    "zeroRecords": "No se encontraron resultados",
                    "paginate": {
                        "first": "Primero",
                        "last": "Último",
                        "next": "Siguiente",
                        "previous": "Anterior"
                    }
                },
                order: [[2, 'desc']]
            });
        }
    } catch (error) {
        console.error('Error cargando top productos:', error);
        mostrarAlerta('Error al cargar productos', 'danger');
    }
}

async function cargarStockBajo() {
    try {
        const response = await fetch(API_BASE_URL + '/reportes/productos/stock-bajo', { headers: getHeaders() });
        if (response.ok) {
            const productos = await response.json();
            
            if (tablaStockBajo) {
                tablaStockBajo.destroy();
            }
            
            tablaStockBajo = $('#tablaStockBajo').DataTable({
                data: productos,
                columns: [
                    { data: 'nombre' },
                    { data: 'categoria', defaultContent: '-' },
                    { data: 'stockActual', render: function(data) { 
                        return '<span class="text-danger fw-bold">' + data + '</span>'; 
                    } },
                    { data: 'stockMinimo' }
                ],
                language: {
                    "decimal": "",
                    "emptyTable": "No hay productos con stock bajo",
                    "info": "Mostrando _START_ a _END_ de _TOTAL_ registros",
                    "infoEmpty": "Mostrando 0 a 0 de 0 registros",
                    "lengthMenu": "Mostrar _MENU_ registros",
                    "loadingRecords": "Cargando...",
                    "search": "Buscar:",
                    "zeroRecords": "No se encontraron resultados",
                    "paginate": {
                        "first": "Primero",
                        "last": "Último",
                        "next": "Siguiente",
                        "previous": "Anterior"
                    }
                },
                order: [[2, 'asc']]
            });
        }
    } catch (error) {
        console.error('Error cargando stock bajo:', error);
    }
}

async function cargarUtilidades() {
    const inicio = document.getElementById('utilidadInicio').value;
    const fin = document.getElementById('utilidadFin').value;
    
    if (!inicio || !fin) {
        mostrarAlerta('Seleccione las fechas de inicio y fin', 'warning');
        return;
    }
    
    try {
        const response = await fetch(API_BASE_URL + '/reportes/ventas?inicio=' + inicio + '&fin=' + fin, { headers: getHeaders() });
        if (response.ok) {
            const utilidades = await response.json();
            const container = document.getElementById('resultadoUtilidades');
            
            let totalIngresos = 0;
            let totalUtilidad = 0;
            
            let html = '<div class="table-responsive">' +
                '<table class="table table-striped">' +
                '<thead>' +
                '<tr><th>Fecha</th><th>Cantidad Ventas</th><th>Total Ingresos</th><th>Utilidad</th>' +
                '</thead><tbody>';
            
            for (var i = 0; i < utilidades.length; i++) {
                const u = utilidades[i];
                totalIngresos = totalIngresos + parseFloat(u.totalIngresos || 0);
                totalUtilidad = totalUtilidad + parseFloat(u.totalUtilidad || 0);
                html = html + '<tr>' +
                    '<td>' + (u.fecha || '') + '</td>' +
                    '<td>' + (u.cantidadVentas || 0) + '</td>' +
                    '<td>$' + parseFloat(u.totalIngresos || 0).toFixed(2) + '</td>' +
                    '<td>$' + parseFloat(u.totalUtilidad || 0).toFixed(2) + '</td>' +
                    '</tr>';
            }
            
            html = html + '</tbody></table></div>';
            html = html + '<div class="alert alert-info mt-3">' +
                '<strong>Resumen del período:</strong><br>' +
                'Total Ingresos: $' + totalIngresos.toFixed(2) + '<br>' +
                'Total Utilidad: $' + totalUtilidad.toFixed(2) + '<br>' +
                'Margen de Utilidad: ' + (totalIngresos > 0 ? ((totalUtilidad / totalIngresos) * 100).toFixed(2) : '0') + '%' +
                '</div>';
            
            container.innerHTML = html;
        }
    } catch (error) {
        console.error('Error cargando utilidades:', error);
        mostrarAlerta('Error al cargar utilidades', 'danger');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    console.log('Usuario logueado en reportes:', userData);
    
    if (!getAuthToken()) {
        window.location.href = 'login.html';
        return;
    }
    
    const rolesPermitidos = ['ADMIN', 'admin', 'VENDEDOR', 'vendedor', 'COMPRAS', 'compras'];
    let tienePermiso = false;
    for (var i = 0; i < rolesPermitidos.length; i++) {
        if (userData.rol === rolesPermitidos[i]) {
            tienePermiso = true;
            break;
        }
    }
    
    if (tienePermiso) {
        cargarResumen();
        cargarTopProductos();
        cargarStockBajo();
    } else {
        console.log('Usuario sin permiso para ver reportes');
    }
});

window.generarReporteVentasPDF = generarReporteVentasPDF;
window.generarReporteComprasPDF = generarReporteComprasPDF;
window.cargarTopProductos = cargarTopProductos;
window.cargarUtilidades = cargarUtilidades;