// ============================================
// Dashboard - Papelería App
// Funciones para el panel de control principal
// ============================================

const API_BASE_URL = 'http://localhost:8085/api';

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
        const response = await fetch(`${API_BASE_URL}/productos`, { headers: getHeaders() });
        if (response.ok) {
            const data = await response.json();
            const totalProductosElement = document.getElementById('totalProductos');
            if (totalProductosElement) {
                totalProductosElement.innerText = data.length || 0;
            }
        }
    } catch (error) {
        console.error('Error cargando productos:', error);
    }
}

async function cargarClientes() {
    try {
        const response = await fetch(`${API_BASE_URL}/clientes`, { headers: getHeaders() });
        if (response.ok) {
            const data = await response.json();
            const totalClientesElement = document.getElementById('totalClientes');
            if (totalClientesElement) {
                totalClientesElement.innerText = data.length || 0;
            }
        }
    } catch (error) {
        console.error('Error cargando clientes:', error);
    }
}

async function cargarVentasMes() {
    try {
        const hoy = new Date();
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
        
        const response = await fetch(`${API_BASE_URL}/reportes/utilidades?inicio=${inicioMes.toISOString().split('T')[0]}&fin=${finMes.toISOString().split('T')[0]}`, { headers: getHeaders() });
        if (response.ok) {
            const data = await response.json();
            const total = data.reduce((sum, item) => sum + (item.totalIngresos || 0), 0);
            const ventasMesElement = document.getElementById('ventasMes');
            if (ventasMesElement) {
                ventasMesElement.innerText = `$${total.toFixed(2)}`;
            }
        }
    } catch (error) {
        console.error('Error cargando ventas del mes:', error);
    }
}

async function cargarStockBajo() {
    try {
        const response = await fetch(`${API_BASE_URL}/productos`, { headers: getHeaders() });
        if (response.ok) {
            const productos = await response.json();
            const stockBajo = productos.filter(p => p.stockActual <= p.stockMinimo);
            const stockBajoElement = document.getElementById('stockBajo');
            if (stockBajoElement) {
                stockBajoElement.innerText = stockBajo.length || 0;
            }
            
            const tbody = document.getElementById('tablaStockBajoBody');
            if (tbody) {
                tbody.innerHTML = '';
                stockBajo.slice(0, 10).forEach(p => {
                    tbody.innerHTML += `</tr>
                        <td>${p.nombre || ''}</td>
                        <td>${p.stockActual || 0}</td>
                        <td>${p.stockMinimo || 0}</td>
                      表`;
                });
            }
        }
    } catch (error) {
        console.error('Error cargando stock bajo:', error);
    }
}

// ============================================
// Gráficas
// ============================================

async function cargarGraficoVentas() {
    try {
        const hoy = new Date();
        const hace7Dias = new Date();
        hace7Dias.setDate(hoy.getDate() - 7);
        
        const response = await fetch(`${API_BASE_URL}/reportes/utilidades?inicio=${hace7Dias.toISOString().split('T')[0]}&fin=${hoy.toISOString().split('T')[0]}`, { headers: getHeaders() });
        if (response.ok) {
            const data = await response.json();
            
            const labels = data.map(item => item.fecha);
            const ingresos = data.map(item => item.totalIngresos || 0);
            
            const ctx = document.getElementById('ventasChart');
            if (ctx) {
                const context = ctx.getContext('2d');
                if (ventasChart) ventasChart.destroy();
                
                ventasChart = new Chart(context, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Ingresos',
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

async function cargarTopProductos() {
    try {
        const hoy = new Date();
        const hace30Dias = new Date();
        hace30Dias.setDate(hoy.getDate() - 30);
        
        const response = await fetch(`${API_BASE_URL}/ventas/top-productos?inicio=${hace30Dias.toISOString().split('T')[0]}&fin=${hoy.toISOString().split('T')[0]}`, { headers: getHeaders() });
        if (response.ok) {
            const data = await response.json();
            const top5 = data.slice(0, 5);
            
            const labels = top5.map(item => item.nombre);
            const cantidades = top5.map(item => item.totalVendido);
            
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
                lista.innerHTML = '<ul class="list-group">';
                top5.forEach(p => {
                    lista.innerHTML += `<li class="list-group-item d-flex justify-content-between align-items-center">
                        ${p.nombre || ''}
                        <span class="badge bg-primary rounded-pill">${p.totalVendido || 0} vendidos</span>
                    </li>`;
                });
                lista.innerHTML += '</ul>';
            }
        }
    } catch (error) {
        console.error('Error cargando top productos:', error);
    }
}

async function cargarUtilidad() {
    try {
        const hoy = new Date();
        const hace7Dias = new Date();
        hace7Dias.setDate(hoy.getDate() - 7);
        
        const response = await fetch(`${API_BASE_URL}/reportes/utilidades?inicio=${hace7Dias.toISOString().split('T')[0]}&fin=${hoy.toISOString().split('T')[0]}`, { headers: getHeaders() });
        if (response.ok) {
            const data = await response.json();
            
            const labels = data.map(item => item.fecha);
            const utilidades = data.map(item => item.totalUtilidad || 0);
            
            const ctx = document.getElementById('utilidadChart');
            if (ctx) {
                const context = ctx.getContext('2d');
                if (utilidadChart) utilidadChart.destroy();
                
                utilidadChart = new Chart(context, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Utilidad',
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
                            legend: { position: 'top' }
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