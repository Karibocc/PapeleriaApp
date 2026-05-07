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
        'Content-Type': application/json,
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// ============================================
// Mostrar información del usuario logueado
// ============================================

function mostrarUsuarioLogueado() {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
        const userData = JSON.parse(userStr);
        document.getElementById('userName').innerText = userData.nombreCompleto || userData.username;
        document.getElementById('userRolBadge').innerText = userData.rol || '';
        document.getElementById('userRolText').innerHTML = `<strong>Rol:</strong> ${userData.rol || ''}`;
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
            document.getElementById('totalProductos').innerText = data.length || 0;
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
            document.getElementById('totalClientes').innerText = data.length || 0;
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
            document.getElementById('ventasMes').innerText = `$${total.toFixed(2)}`;
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
            document.getElementById('stockBajo').innerText = stockBajo.length || 0;
            
            const tbody = document.querySelector('#tablaStockBajo tbody');
            tbody.innerHTML = '';
            stockBajo.slice(0, 5).forEach(p => {
                tbody.innerHTML += `<tr><td>${p.nombre}</td><td>${p.stockActual}</td><td>${p.stockMinimo}</td></tr>`;
            });
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
            
            const ctx = document.getElementById('ventasChart').getContext('2d');
            if (ventasChart) ventasChart.destroy();
            
            ventasChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Ingresos',
                        data: ingresos,
                        borderColor: '#4e73df',
                        backgroundColor: 'rgba(78, 115, 223, 0.1)',
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
            
            const ctx = document.getElementById('topProductosChart').getContext('2d');
            if (topProductosChart) topProductosChart.destroy();
            
            topProductosChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        data: cantidades,
                        backgroundColor: ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b']
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
            
            const lista = document.getElementById('topProductosLista');
            lista.innerHTML = '<ul class="list-group">';
            top5.forEach(p => {
                lista.innerHTML += `<li class="list-group-item d-flex justify-content-between align-items-center">${p.nombre}<span class="badge bg-primary rounded-pill">${p.totalVendido} vendidos</span></li>`;
            });
            lista.innerHTML += '</ul>';
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
            
            const ctx = document.getElementById('utilidadChart').getContext('2d');
            if (utilidadChart) utilidadChart.destroy();
            
            utilidadChart = new Chart(ctx, {
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
    } catch (error) {
        console.error('Error cargando utilidad:', error);
    }
}

// ============================================
// Cargar todo el dashboard
// ============================================

async function cargarDashboard() {
    await cargarProductos();
    await cargarClientes();
    await cargarVentasMes();
    await cargarStockBajo();
    await cargarGraficoVentas();
    await cargarTopProductos();
    await cargarUtilidad();
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
    
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            document.body.classList.toggle('sb-sidenav-toggled');
        });
    }
});