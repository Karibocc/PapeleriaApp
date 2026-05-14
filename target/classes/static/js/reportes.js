// ============================================
// reportes.js - Gestión de Reportes (CORREGIDO)
// Papelería App
// ============================================

const API_BASE_URL = '/api';
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
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

function mostrarAlerta(mensaje, tipo) {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${tipo} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    alertDiv.style.zIndex = '9999';
    alertDiv.style.minWidth = '300px';
    alertDiv.style.textAlign = 'center';
    alertDiv.innerHTML = `${mensaje}<button type="button" class="btn-close" data-bs-dismiss="alert"></button>`;
    document.body.appendChild(alertDiv);
    setTimeout(() => alertDiv.remove(), 3000);
}

// ==================== RESÚMENES ====================

async function cargarResumen() {
    try {
        const response = await fetch(`${API_BASE_URL}/reportes/resumen`, { headers: getHeaders() });
        if (response.ok) {
            const data = await response.json();
            const container = document.getElementById('resumenContainer');
            if (container) {
                container.innerHTML = `
                    <div class="col-md-3">
                        <div class="card resumen-card card-ventas">
                            <div class="card-body">
                                <h6 class="text-muted">Ventas Hoy</h6>
                                <h3>$${parseFloat(data.ventasHoy || 0).toFixed(2)}</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card resumen-card card-ventas">
                            <div class="card-body">
                                <h6 class="text-muted">Ventas del Mes</h6>
                                <h3>$${parseFloat(data.ventasMes || 0).toFixed(2)}</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card resumen-card card-compras">
                            <div class="card-body">
                                <h6 class="text-muted">Compras Hoy</h6>
                                <h3>$${parseFloat(data.comprasHoy || 0).toFixed(2)}</h3>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-3">
                        <div class="card resumen-card card-compras">
                            <div class="card-body">
                                <h6 class="text-muted">Compras del Mes</h6>
                                <h3>$${parseFloat(data.comprasMes || 0).toFixed(2)}</h3>
                            </div>
                        </div>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Error cargando resumen:', error);
    }
}

// ==================== VENTAS POR PERÍODO ====================

async function cargarReporteVentas() {
    const inicio = document.getElementById('fechaInicioVentas').value;
    const fin = document.getElementById('fechaFinVentas').value;
    if (!inicio || !fin) {
        mostrarAlerta('Seleccione las fechas de inicio y fin', 'warning');
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/reportes/ventas?inicio=${inicio}&fin=${fin}`, { headers: getHeaders() });
        if (!response.ok) throw new Error('Error en la petición');
        const datos = await response.json();
        const container = document.getElementById('tablaVentasContainer');
        if (!container) {
            console.warn('No se encontró el contenedor tablaVentasContainer');
            return;
        }
        if (tablaVentas) tablaVentas.destroy();
        container.innerHTML = `<table id="tablaVentas" class="table table-striped" style="width:100%">
            <thead><tr><th>Fecha</th><th>Cantidad Ventas</th><th>Total Ingresos</th><th>Utilidad</th></tr></thead>
            <tbody></tbody>
        </table>`;
        tablaVentas = $('#tablaVentas').DataTable({
            data: datos,
            columns: [
                { data: 'fecha' },
                { data: 'cantidadVentas', defaultContent: 0 },
                { data: 'totalIngresos', render: data => `$${parseFloat(data || 0).toFixed(2)}` },
                { data: 'totalUtilidad', render: data => `$${parseFloat(data || 0).toFixed(2)}` }
            ],
            language: { url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
            order: [[0, 'desc']]
        });
    } catch (error) {
        console.error('Error cargando reporte de ventas:', error);
        mostrarAlerta('Error al cargar ventas', 'danger');
    }
}

// ==================== COMPRAS POR PERÍODO ====================

async function cargarReporteCompras() {
    const inicio = document.getElementById('fechaInicioCompras').value;
    const fin = document.getElementById('fechaFinCompras').value;
    if (!inicio || !fin) {
        mostrarAlerta('Seleccione las fechas de inicio y fin', 'warning');
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/reportes/compras?inicio=${inicio}&fin=${fin}`, { headers: getHeaders() });
        if (!response.ok) throw new Error('Error en la petición');
        const datos = await response.json();
        const container = document.getElementById('tablaComprasContainer');
        if (!container) return;
        if (tablaCompras) tablaCompras.destroy();
        container.innerHTML = `<table id="tablaCompras" class="table table-striped" style="width:100%">
            <thead><tr><th>ID</th><th>Fecha</th><th>Proveedor</th><th>Usuario</th><th>Factura</th><th>Subtotal</th><th>Impuesto</th><th>Descuento</th><th>Total</th></tr></thead>
            <tbody></tbody>
        </table>`;
        tablaCompras = $('#tablaCompras').DataTable({
            data: datos,
            columns: [
                { data: 'idCompra' },
                { data: 'fechaHora' },
                { data: 'proveedor' },
                { data: 'comprador' },
                { data: 'numeroFactura' },
                { data: 'subtotal', render: data => `$${parseFloat(data || 0).toFixed(2)}` },
                { data: 'impuesto', render: data => `$${parseFloat(data || 0).toFixed(2)}` },
                { data: 'descuento', render: data => `$${parseFloat(data || 0).toFixed(2)}` },
                { data: 'total', render: data => `$${parseFloat(data || 0).toFixed(2)}` }
            ],
            language: { url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
            order: [[1, 'desc']]
        });
    } catch (error) {
        console.error('Error cargando reporte de compras:', error);
        mostrarAlerta('Error al cargar compras', 'danger');
    }
}

// ==================== TOP PRODUCTOS (carga automática con fechas por defecto) ====================

async function cargarTopProductos() {
    let inicio = document.getElementById('topInicio').value;
    let fin = document.getElementById('topFin').value;
    const limit = document.getElementById('topLimit').value || 10;
    
    // Si no hay fechas seleccionadas, usar últimos 30 días por defecto
    if (!inicio) {
        const hoy = new Date();
        const hace30 = new Date();
        hace30.setDate(hoy.getDate() - 30);
        inicio = hace30.toISOString().split('T')[0];
        fin = hoy.toISOString().split('T')[0];
        // También establecer los valores en los campos para que el usuario lo vea
        if (document.getElementById('topInicio')) document.getElementById('topInicio').value = inicio;
        if (document.getElementById('topFin')) document.getElementById('topFin').value = fin;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/reportes/productos/mas-vendidos?inicio=${inicio}&fin=${fin}&limit=${limit}`, { headers: getHeaders() });
        if (!response.ok) throw new Error('Error en la petición');
        const productos = await response.json();
        const container = document.getElementById('tablaTopProductosContainer');
        if (!container) {
            console.warn('No se encontró el contenedor tablaTopProductosContainer');
            return;
        }
        if (tablaTopProductos) tablaTopProductos.destroy();
        container.innerHTML = `<table id="tablaTopProductos" class="table table-striped" style="width:100%">
            <thead><tr><th>Producto</th><th>Categoría</th><th>Cantidad Vendida</th><th>Total Vendido</th></tr></thead>
            <tbody></tbody>
        </table>`;
        tablaTopProductos = $('#tablaTopProductos').DataTable({
            data: productos,
            columns: [
                { data: 'nombre' },
                { data: 'categoria', defaultContent: '-' },
                { data: 'cantidadVendida', defaultContent: 0 },
                { data: 'totalVendido', render: data => `$${parseFloat(data || 0).toFixed(2)}` }
            ],
            language: { url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
            order: [[2, 'desc']]
        });
    } catch (error) {
        console.error('Error cargando top productos:', error);
        mostrarAlerta('Error al cargar top productos', 'danger');
    }
}

// ==================== STOCK BAJO (carga automática) ====================

async function cargarStockBajo() {
    try {
        const response = await fetch(`${API_BASE_URL}/reportes/productos/stock-bajo`, { headers: getHeaders() });
        if (!response.ok) throw new Error('Error en la petición');
        const productos = await response.json();
        const container = document.getElementById('tablaStockBajoContainer');
        if (!container) {
            console.warn('No se encontró el contenedor tablaStockBajoContainer');
            return;
        }
        if (tablaStockBajo) tablaStockBajo.destroy();
        container.innerHTML = `<table id="tablaStockBajo" class="table table-striped" style="width:100%">
            <thead><tr><th>Producto</th><th>Categoría</th><th>Stock Actual</th><th>Stock Mínimo</th></tr></thead>
            <tbody></tbody>
        </table>`;
        tablaStockBajo = $('#tablaStockBajo').DataTable({
            data: productos,
            columns: [
                { data: 'nombre' },
                { data: 'categoria', defaultContent: '-' },
                { data: 'stockActual', render: data => `<span class="text-danger fw-bold">${data}</span>` },
                { data: 'stockMinimo' }
            ],
            language: { url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
            order: [[2, 'asc']]
        });
    } catch (error) {
        console.error('Error cargando stock bajo:', error);
        mostrarAlerta('Error al cargar stock bajo', 'danger');
    }
}

// ==================== UTILIDAD POR PERÍODO ====================

async function cargarUtilidades() {
    const inicio = document.getElementById('utilidadInicio').value;
    const fin = document.getElementById('utilidadFin').value;
    if (!inicio || !fin) {
        mostrarAlerta('Seleccione las fechas de inicio y fin', 'warning');
        return;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/reportes/utilidad/rango?inicio=${inicio}&fin=${fin}`, { headers: getHeaders() });
        if (!response.ok) throw new Error('Error en la petición');
        const data = await response.json();
        const container = document.getElementById('resultadoUtilidades');
        if (container) {
            container.innerHTML = `
                <div class="alert alert-info mt-3">
                    <strong>Resumen del período (${data.periodo}):</strong><br>
                    Total Ingresos: $${parseFloat(data.ingresos || 0).toFixed(2)}<br>
                    Total Costos: $${parseFloat(data.costos || 0).toFixed(2)}<br>
                    Total Utilidad: $${parseFloat(data.utilidad || 0).toFixed(2)}<br>
                    Margen de Utilidad: ${parseFloat(data.margen || 0).toFixed(2)}%
                </div>
            `;
        }
    } catch (error) {
        console.error('Error cargando utilidades:', error);
        mostrarAlerta('Error al cargar utilidades', 'danger');
    }
}

// ==================== DESCARGA DE REPORTES ====================

async function descargarReporte(tipo, formato, inicio = null, fin = null) {
    let url = '';
    if (tipo === 'ventas') {
        if (!inicio || !fin) {
            mostrarAlerta('Seleccione las fechas', 'warning');
            return;
        }
        url = `${API_BASE_URL}/reportes/ventas/${formato}?inicio=${inicio}&fin=${fin}`;
    } else if (tipo === 'inventario') {
        url = `${API_BASE_URL}/reportes/inventario/${formato}`;
    } else {
        mostrarAlerta('Tipo de reporte no soportado', 'danger');
        return;
    }
    try {
        const response = await fetch(url, { headers: getHeaders() });
        if (!response.ok) throw new Error('Error al generar el archivo');
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `reporte_${tipo}.${formato}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error('Error descargando reporte:', error);
        mostrarAlerta('Error al generar el reporte', 'danger');
    }
}

function generarReporteVentasPDF() {
    const inicio = document.getElementById('fechaInicioVentas').value;
    const fin = document.getElementById('fechaFinVentas').value;
    descargarReporte('ventas', 'pdf', inicio, fin);
}

function generarReporteVentasExcel() {
    const inicio = document.getElementById('fechaInicioVentas').value;
    const fin = document.getElementById('fechaFinVentas').value;
    descargarReporte('ventas', 'excel', inicio, fin);
}

function generarReporteInventarioPDF() {
    descargarReporte('inventario', 'pdf');
}

function generarReporteInventarioExcel() {
    descargarReporte('inventario', 'excel');
}

// ==================== INICIALIZACIÓN ====================

document.addEventListener('DOMContentLoaded', function() {
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    if (!getAuthToken()) {
        window.location.href = 'login.html';
        return;
    }
    const rolesPermitidos = ['ADMIN', 'admin', 'VENDEDOR', 'vendedor', 'COMPRAS', 'compras'];
    const tienePermiso = rolesPermitidos.includes(userData.rol);
    if (tienePermiso) {
        cargarResumen();
        cargarStockBajo();          // Carga automática al entrar
        cargarTopProductos();       // Carga automática con fechas por defecto
        // Opcional: también puedes cargar ventas/compras si deseas, pero lo dejaré para los botones.
    } else {
        console.log('Usuario sin permiso para ver reportes');
    }
});

// Exponer funciones globales para los botones HTML
window.cargarReporteVentas = cargarReporteVentas;
window.cargarReporteCompras = cargarReporteCompras;
window.cargarTopProductos = cargarTopProductos;
window.cargarStockBajo = cargarStockBajo;
window.cargarUtilidades = cargarUtilidades;
window.generarReporteVentasPDF = generarReporteVentasPDF;
window.generarReporteVentasExcel = generarReporteVentasExcel;
window.generarReporteInventarioPDF = generarReporteInventarioPDF;
window.generarReporteInventarioExcel = generarReporteInventarioExcel;