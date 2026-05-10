// ============================================
// reportes.js - Generación de Reportes
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

function generarReporteVentasPDF() {
    const inicio = document.getElementById('fechaInicio')?.value;
    const fin = document.getElementById('fechaFin')?.value;
    if (inicio && fin) {
        window.open(`${API_BASE_URL}/reportes/ventas/pdf?inicio=${inicio}&fin=${fin}`, '_blank');
    } else {
        alert('Seleccione las fechas de inicio y fin');
    }
}

function generarReporteVentasExcel() {
    const inicio = document.getElementById('fechaInicio')?.value;
    const fin = document.getElementById('fechaFin')?.value;
    if (inicio && fin) {
        window.open(`${API_BASE_URL}/reportes/ventas/excel?inicio=${inicio}&fin=${fin}`, '_blank');
    } else {
        alert('Seleccione las fechas de inicio y fin');
    }
}

function generarReporteInventarioPDF() {
    window.open(`${API_BASE_URL}/reportes/inventario/pdf`, '_blank');
}

function generarReporteInventarioExcel() {
    window.open(`${API_BASE_URL}/reportes/inventario/excel`, '_blank');
}

async function cargarTopProductos() {
    let inicio = document.getElementById('topInicio')?.value;
    let fin = document.getElementById('topFin')?.value;
    
    if (!inicio) {
        const hoy = new Date();
        const hace30Dias = new Date();
        hace30Dias.setDate(hoy.getDate() - 30);
        inicio = hace30Dias.toISOString().split('T')[0];
        fin = hoy.toISOString().split('T')[0];
        if (document.getElementById('topInicio')) document.getElementById('topInicio').value = inicio;
        if (document.getElementById('topFin')) document.getElementById('topFin').value = fin;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/ventas/top-productos?inicio=${inicio}&fin=${fin}`, { headers: getHeaders() });
        if (response.ok) {
            const productos = await response.json();
            const tbody = document.querySelector('#tablaTopProductos tbody');
            if (tbody) {
                tbody.innerHTML = '';
                productos.forEach(p => {
                    tbody.innerHTML += `<tr>
                        <td>${p.nombre || ''}</td>
                        <td>${p.totalVendido || 0}</td>
                    </tr>`;
                });
            }
            
            // También actualizar gráfico si existe
            const ctx = document.getElementById('topProductosChart');
            if (ctx && productos.length > 0) {
                const existingChart = Chart.getChart(ctx);
                if (existingChart) existingChart.destroy();
                
                const top5 = productos.slice(0, 5);
                new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels: top5.map(p => p.nombre),
                        datasets: [{
                            data: top5.map(p => p.totalVendido),
                            backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe']
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: { legend: { position: 'bottom' } }
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error cargando top productos:', error);
    }
}

async function cargarUtilidades() {
    const inicio = document.getElementById('utilidadInicio')?.value;
    const fin = document.getElementById('utilidadFin')?.value;
    
    if (!inicio || !fin) {
        alert('Seleccione las fechas de inicio y fin');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/reportes/utilidades?inicio=${inicio}&fin=${fin}`, { headers: getHeaders() });
        if (response.ok) {
            const utilidades = await response.json();
            const container = document.getElementById('resultadoUtilidades');
            if (container) {
                let html = `
                    <div class="table-responsive">
                        <table class="table table-striped">
                            <thead>
                                <tr><th>Fecha</th><th>Cantidad Ventas</th><th>Total Ingresos</th><th>Utilidad</th>
                            </thead>
                            <tbody>
                `;
                utilidades.forEach(u => {
                    html += `<tr>
                        <td>${u.fecha || ''}</td>
                        <td>${u.cantidadVentas || 0}</td>
                        <td>$${parseFloat(u.totalIngresos || 0).toFixed(2)}</td>
                        <td>$${parseFloat(u.totalUtilidad || 0).toFixed(2)}</td>
                    </tr>`;
                });
                html += '</tbody></table></div>';
                container.innerHTML = html;
            }
        }
    } catch (error) {
        console.error('Error cargando utilidades:', error);
    }
}

let ventasChart = null;

async function cargarGraficoVentas() {
    const hoy = new Date();
    const hace7Dias = new Date();
    hace7Dias.setDate(hoy.getDate() - 7);
    
    const inicio = hace7Dias.toISOString().split('T')[0];
    const fin = hoy.toISOString().split('T')[0];
    
    try {
        const response = await fetch(`${API_BASE_URL}/reportes/utilidades?inicio=${inicio}&fin=${fin}`, { headers: getHeaders() });
        if (response.ok) {
            const data = await response.json();
            
            const ctx = document.getElementById('ventasChart');
            if (ctx) {
                if (ventasChart) ventasChart.destroy();
                
                ventasChart = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: data.map(u => u.fecha),
                        datasets: [
                            {
                                label: 'Ingresos',
                                data: data.map(u => u.totalIngresos || 0),
                                borderColor: '#667eea',
                                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                fill: true,
                                tension: 0.3
                            },
                            {
                                label: 'Utilidad',
                                data: data.map(u => u.totalUtilidad || 0),
                                borderColor: '#1cc88a',
                                backgroundColor: 'rgba(28, 200, 138, 0.1)',
                                fill: true,
                                tension: 0.3
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                            legend: { position: 'top' }
                        }
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error cargando gráfico de ventas:', error);
    }
}

// Exponer funciones globales
window.generarReporteVentasPDF = generarReporteVentasPDF;
window.generarReporteVentasExcel = generarReporteVentasExcel;
window.generarReporteInventarioPDF = generarReporteInventarioPDF;
window.generarReporteInventarioExcel = generarReporteInventarioExcel;
window.cargarTopProductos = cargarTopProductos;
window.cargarUtilidades = cargarUtilidades;
window.cargarGraficoVentas = cargarGraficoVentas;