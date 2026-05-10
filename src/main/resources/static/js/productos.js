// ============================================
// productos.js - Gestión de Productos
// Papelería App
// ============================================

const API_BASE_URL = 'http://localhost:8085/api';
let tablaProductos = null;
let productosData = [];
let categoriasData = [];

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

async function cargarProductos() {
    try {
        const response = await fetch(`${API_BASE_URL}/productos`, { headers: getHeaders() });
        if (response.ok) {
            productosData = await response.json();
            const totalProductos = document.getElementById('totalProductos');
            if (totalProductos) {
                totalProductos.innerText = productosData.length;
            }
            actualizarTablaProductos();
            actualizarGraficaStock();
            cargarStockBajoProductos();
        }
    } catch (error) {
        console.error('Error cargando productos:', error);
    }
}

async function cargarCategorias() {
    try {
        const response = await fetch(`${API_BASE_URL}/categorias`, { headers: getHeaders() });
        if (response.ok) {
            categoriasData = await response.json();
            cargarCategoriasSelect();
        }
    } catch (error) {
        console.error('Error cargando categorías:', error);
    }
}

function cargarCategoriasSelect() {
    const select = document.getElementById('categoriaId');
    if (select) {
        select.innerHTML = '<option value="">Seleccione...</option>';
        categoriasData.forEach(cat => {
            select.innerHTML += `<option value="${cat.idCategoria}">${cat.nombre}</option>`;
        });
    }
}

function actualizarTablaProductos() {
    const pageLength = parseInt(document.getElementById('pageLength')?.value || 10);
    const thAcciones = document.getElementById('thAcciones');
    const mostrarAcciones = thAcciones && thAcciones.style.display !== 'none';
    
    if (tablaProductos) {
        tablaProductos.destroy();
    }
    
    tablaProductos = $('#tablaProductos').DataTable({
        data: productosData,
        pageLength: pageLength,
        lengthMenu: [5, 10, 25, 50, 100],
        language: {
            url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json'
        },
        columns: [
            { data: 'idProducto' },
            { data: 'codigoBarras', defaultContent: '-' },
            { data: 'nombre' },
            { data: 'stockActual' },
            { data: 'precioVenta', render: data => `$${parseFloat(data).toFixed(2)}` },
            { data: 'activo', render: data => data ? 'Activo' : 'Inactivo' },
            { 
                data: null, 
                orderable: false, 
                visible: mostrarAcciones,
                render: (data) => `
                    <button class="btn btn-sm btn-warning me-1" onclick="editarProducto(${data.idProducto})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${data.idProducto})">
                        <i class="fas fa-trash"></i>
                    </button>
                `
            }
        ]
    });
    
    document.getElementById('pageLength')?.addEventListener('change', () => actualizarTablaProductos());
}

function actualizarGraficaStock() {
    const stockPorCategoria = {};
    productosData.forEach(p => {
        if (p.categoria && p.categoria.nombre) {
            stockPorCategoria[p.categoria.nombre] = (stockPorCategoria[p.categoria.nombre] || 0) + (p.stockActual || 0);
        }
    });
    
    const ctx = document.getElementById('stockChart');
    if (ctx) {
        const existingChart = Chart.getChart(ctx);
        if (existingChart) existingChart.destroy();
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(stockPorCategoria),
                datasets: [{
                    label: 'Stock por categoría',
                    data: Object.values(stockPorCategoria),
                    backgroundColor: '#667eea',
                    borderRadius: 10
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

function cargarStockBajoProductos() {
    const stockBajo = productosData.filter(p => p.stockActual <= p.stockMinimo);
    const tbody = document.getElementById('tablaStockBajoBody');
    if (tbody) {
        tbody.innerHTML = '';
        stockBajo.slice(0, 10).forEach(p => {
            tbody.innerHTML += `
                <tr>
                    <td>${p.nombre || ''}</td>
                    <td>${p.stockActual || 0}</td>
                    <td>${p.stockMinimo || 0}</td>
                </tr>
            `;
        });
    }
}

function limpiarFormularioProducto() {
    document.getElementById('productoId').value = '';
    document.getElementById('codigoBarras').value = '';
    document.getElementById('nombre').value = '';
    document.getElementById('descripcion').value = '';
    document.getElementById('precioCompra').value = '';
    document.getElementById('precioVenta').value = '';
    document.getElementById('stockActual').value = '';
    document.getElementById('stockMinimo').value = '';
    document.getElementById('unidadMedida').value = 'unidad';
    document.getElementById('activo').value = 'true';
    if (document.getElementById('categoriaId')) {
        document.getElementById('categoriaId').value = '';
    }
}

async function editarProducto(id) {
    const producto = productosData.find(p => p.idProducto === id);
    if (producto) {
        document.getElementById('productoId').value = producto.idProducto;
        document.getElementById('codigoBarras').value = producto.codigoBarras || '';
        document.getElementById('nombre').value = producto.nombre;
        document.getElementById('descripcion').value = producto.descripcion || '';
        document.getElementById('precioCompra').value = producto.precioCompra;
        document.getElementById('precioVenta').value = producto.precioVenta;
        document.getElementById('stockActual').value = producto.stockActual;
        document.getElementById('stockMinimo').value = producto.stockMinimo;
        document.getElementById('unidadMedida').value = producto.unidadMedida || 'unidad';
        document.getElementById('activo').value = producto.activo ? 'true' : 'false';
        if (producto.categoria) {
            document.getElementById('categoriaId').value = producto.categoria.idCategoria;
        }
        new bootstrap.Modal(document.getElementById('productoModal')).show();
    }
}

async function guardarProducto() {
    const producto = {
        idProducto: document.getElementById('productoId').value || null,
        codigoBarras: document.getElementById('codigoBarras').value,
        nombre: document.getElementById('nombre').value,
        descripcion: document.getElementById('descripcion').value,
        idCategoria: document.getElementById('categoriaId')?.value || null,
        precioCompra: parseFloat(document.getElementById('precioCompra').value),
        precioVenta: parseFloat(document.getElementById('precioVenta').value),
        stockActual: parseInt(document.getElementById('stockActual').value),
        stockMinimo: parseInt(document.getElementById('stockMinimo').value),
        unidadMedida: document.getElementById('unidadMedida').value,
        activo: document.getElementById('activo').value === 'true'
    };
    
    try {
        const url = producto.idProducto ? `${API_BASE_URL}/productos/${producto.idProducto}` : `${API_BASE_URL}/productos`;
        const method = producto.idProducto ? 'PUT' : 'POST';
        const response = await fetch(url, { method, headers: getHeaders(), body: JSON.stringify(producto) });
        
        if (response.ok) {
            bootstrap.Modal.getInstance(document.getElementById('productoModal')).hide();
            cargarProductos();
        } else {
            const error = await response.json();
            alert(error.error || 'Error al guardar el producto');
        }
    } catch (error) {
        console.error('Error guardando producto:', error);
        alert('Error de conexión');
    }
}

async function eliminarProducto(id) {
    if (confirm('¿Está seguro de eliminar este producto? Esta acción no se puede deshacer.')) {
        try {
            const response = await fetch(`${API_BASE_URL}/productos/${id}`, { method: 'DELETE', headers: getHeaders() });
            if (response.ok) {
                cargarProductos();
            } else {
                const error = await response.json();
                alert(error.error || 'Error al eliminar el producto');
            }
        } catch (error) {
            console.error('Error eliminando producto:', error);
            alert('Error de conexión');
        }
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const btnNuevoProducto = document.getElementById('btnNuevoProducto');
    const thAcciones = document.getElementById('thAcciones');
    
    if (userData.rol === 'ADMIN' || userData.rol === 'BODEGA') {
        if (btnNuevoProducto) btnNuevoProducto.style.display = 'block';
        if (thAcciones) thAcciones.style.display = 'table-cell';
    } else {
        if (btnNuevoProducto) btnNuevoProducto.style.display = 'none';
        if (thAcciones) thAcciones.style.display = 'none';
    }
    
    cargarCategorias();
    cargarProductos();
});

// Exponer funciones globales
window.cargarListaProductos = cargarProductos;
window.cargarCategoriasSelect = cargarCategoriasSelect;
window.limpiarFormularioProducto = limpiarFormularioProducto;
window.editarProducto = editarProducto;
window.guardarProducto = guardarProducto;
window.eliminarProducto = eliminarProducto;