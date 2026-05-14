// ============================================
// Dashboard - Papelería App
// Funciones para el panel de control principal
// ============================================

const API_BASE_URL = '/api';  // Usamos ruta relativa, el proxy de Spring Boot resuelve

// Variables globales para los gráficos
let ventasChart = null;
let topProductosChart = null;
let utilidadChart = null;

// ============================================
// Funciones de utilidad
// ============================================

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

// ============================================
// Mostrar información del usuario logueado
// ============================================

function mostrarUsuarioLogueado() {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
        try {
            const userData = JSON.parse(userStr);
            const userNameElement = document.getElementById('userName');
            const userRolBadgeElement = document.getElementById('userRolBadge');
            const userRolTextElement = document.getElementById('userRolText');
            
            if (userNameElement) {
                userNameElement.innerText = userData.nombreCompleto || userData.username;
            }
            if (userRolBadgeElement) {
                userRolBadgeElement.innerText = userData.rol || '';
            }
            if (userRolTextElement) {
                userRolTextElement.innerHTML = `<strong>Rol:</strong> ${userData.rol || ''}`;
            }
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    }
}

function cerrarSesion() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// ============================================
// Carga de datos para las tarjetas
// ============================================

async function cargarProductos() {
    try {
        const response = await fetch(`${API_BASE_URL}/productos/total`, { headers: getHeaders() });
        if (response.ok) {
            const data = await response.json();
            const total = data.total || 0;
            const totalProductosElement = document.getElementById('totalProductos');
            if (totalProductosElement) {
                totalProductosElement.innerText = total;
            }
        }
    } catch (error) {
        console.error('Error cargando productos:', error);
        document.getElementById('totalProductos').innerText = 'Error';
    }
}

async function cargarClientes() {
    try {
        const response = await fetch(`${API_BASE_URL}/clientes/total`, { headers: getHeaders() });
        if (response.ok) {
            const data = await response.json();
            const total = data.total || 0;
            const totalClientesElement = document.getElementById('totalClientes');
            if (totalClientesElement) {
                totalClientesElement.innerText = total;
            }
        }
    } catch (error) {
        console.error('Error cargando clientes:', error);
        document.getElementById('totalClientes').innerText = 'Error';
    }
}

async function cargarVentasMes() {
    try {
        const response = await fetch(`${API_BASE_URL}/ventas/totales-mes`, { headers: getHeaders() });
        if (response.ok) {
            const data = await response.json();
            const totalVentas = data.totalVentas || 0;
            const ventasMesElement = document.getElementById('ventasMes');
            if (ventasMesElement) {
                ventasMesElement.innerText = new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    minimumFractionDigits: 0
                }).format(totalVentas);
            }
        }
    } catch (error) {
        console.error('Error cargando ventas del mes:', error);
        document.getElementById('ventasMes').innerText = '$0';
    }
}

async function cargarStockBajo() {
    try {
        const response = await fetch(`${API_BASE_URL}/productos/stock-bajo`, { headers: getHeaders() });
        if (response.ok) {
            const productos = await response.json();
            const stockBajoElement = document.getElementById('stockBajo');
            if (stockBajoElement) {
                stockBajoElement.innerText = productos.length || 0;
            }
            
            const tbody = document.getElementById('tablaStockBajoBody');
            if (tbody) {
                tbody.innerHTML = '';
                if (productos.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="3" class="text-center">No hay productos con stock bajo</td></tr>';
                } else {
                    productos.slice(0, 10).forEach(p => {
                        tbody.innerHTML += `<tr>
                            <td>${p.nombre || ''}</td>
                            <td>${p.stockActual || 0}</td>
                            <td>${p.stockMinimo || 0}</td>
                        </tr>`;
                    });
                }
            }
        }
    } catch (error) {
        console.error('Error cargando stock bajo:', error);
        document.getElementById('stockBajo').innerText = 'Error';
    }
}

// ============================================
// Gráficas
// ============================================

async function cargarGraficoVentas() {
    try {
        const response = await fetch(`${API_BASE_URL}/ventas/ultimos-7-dias`, { headers: getHeaders() });
        if (response.ok) {
            const data = await response.json();  // [{fecha, total}, ...]
            const labels = data.map(item => item.fecha);
            const ingresos = data.map(item => item.total);
            
            const ctx = document.getElementById('ventasChart');
            if (ctx) {
                const context = ctx.getContext('2d');
                if (ventasChart) ventasChart.destroy();
                
                ventasChart = new Chart(context, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Ventas (COP)',
                            data: ingresos,
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
                            tooltip: {
                                callbacks: {
                                    label: context => `Total: ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(context.raw)}`
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: value => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value)
                                }
                            }
                        }
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error cargando gráfico de ventas:', error);
    }
}

async function cargarTopProductos() {
    try {
        const response = await fetch(`${API_BASE_URL}/productos/top`, { headers: getHeaders() });
        if (response.ok) {
            const data = await response.json();  // [{nombre, cantidad}, ...]
            const top5 = data.slice(0, 5);
            
            const labels = top5.map(item => item.nombre);
            const cantidades = top5.map(item => item.cantidad);
            
            const ctx = document.getElementById('topProductosChart');
            if (ctx) {
                const context = ctx.getContext('2d');
                if (topProductosChart) topProductosChart.destroy();
                
                topProductosChart = new Chart(context, {
                    type: 'pie',
                    data: {
                        labels: labels,
                        datasets: [{
                            data: cantidades,
                            backgroundColor: ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe']
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
            
            const lista = document.getElementById('topProductosLista');
            if (lista) {
                if (top5.length === 0) {
                    lista.innerHTML = '<p class="text-muted">No hay datos de productos más vendidos.</p>';
                } else {
                    lista.innerHTML = '<ul class="list-group">';
                    top5.forEach(p => {
                        lista.innerHTML += `<li class="list-group-item d-flex justify-content-between align-items-center">
                            ${p.nombre || ''}
                            <span class="badge bg-primary rounded-pill">${p.cantidad || 0} vendidos</span>
                        </li>`;
                    });
                    lista.innerHTML += '</ul>';
                }
            }
        }
    } catch (error) {
        console.error('Error cargando top productos:', error);
    }
}

async function cargarUtilidad() {
    try {
        const response = await fetch(`${API_BASE_URL}/utilidad/por-dia`, { headers: getHeaders() });
        if (response.ok) {
            const data = await response.json();  // [{fecha, utilidad}, ...]
            const labels = data.map(item => item.fecha);
            const utilidades = data.map(item => item.utilidad);
            
            const ctx = document.getElementById('utilidadChart');
            if (ctx) {
                const context = ctx.getContext('2d');
                if (utilidadChart) utilidadChart.destroy();
                
                utilidadChart = new Chart(context, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Utilidad (COP)',
                            data: utilidades,
                            backgroundColor: '#1cc88a',
                            borderColor: '#1cc88a',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: true,
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    label: context => `Utilidad: ${new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(context.raw)}`
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: value => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value)
                                }
                            }
                        }
                    }
                });
            }
        }
    } catch (error) {
        console.error('Error cargando utilidad:', error);
    }
}

// ============================================
// Cargar todo el dashboard
// ============================================

async function cargarDashboard() {
    try {
        await cargarProductos();
        await cargarClientes();
        await cargarVentasMes();
        await cargarStockBajo();
        await cargarGraficoVentas();
        await cargarTopProductos();
        await cargarUtilidad();
    } catch (error) {
        console.error('Error cargando dashboard:', error);
    }
}

// ============================================
// Inicialización al cargar la página
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('currentUser');
    
    if (!token || !user) {
        window.location.href = 'login.html';
        return;
    }
    
    mostrarUsuarioLogueado();
    cargarDashboard();
    
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', function(e) {
            e.preventDefault();
            cerrarSesion();
        });
    }
});