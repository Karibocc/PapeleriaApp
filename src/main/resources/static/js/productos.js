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

async function cargarProductos() {
    try {
        const response = await fetch(API_BASE_URL + '/productos', { headers: getHeaders() });
        
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
            productosData = await response.json();
            const totalProductos = document.getElementById('totalProductos');
            if (totalProductos) {
                totalProductos.innerText = productosData.length;
            }
            actualizarTablaProductos();
            actualizarGraficaStock();
            cargarStockBajoProductos();
        } else {
            mostrarAlerta('Error al cargar productos', 'danger');
        }
    } catch (error) {
        console.error('Error cargando productos:', error);
        mostrarAlerta('Error de conexión al servidor', 'danger');
    }
}

async function cargarCategorias() {
    try {
        const response = await fetch(API_BASE_URL + '/categorias', { headers: getHeaders() });
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
        select.innerHTML = '<option value="">Seleccione categoría...</option>';
        for (var i = 0; i < categoriasData.length; i++) {
            const cat = categoriasData[i];
            select.innerHTML = select.innerHTML + '<option value="' + cat.idCategoria + '">' + escapeHtml(cat.nombre) + '</option>';
        }
    }
}

function actualizarTablaProductos() {
    const pageLength = parseInt(document.getElementById('pageLength')?.value || 10);
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const rolesPermitidos = ['ADMIN', 'admin', 'ADMINISTRADOR', 'Administrador', 'BODEGA', 'bodega'];
    let mostrarAcciones = false;
    for (var i = 0; i < rolesPermitidos.length; i++) {
        if (userData.rol === rolesPermitidos[i]) {
            mostrarAcciones = true;
            break;
        }
    }
    
    if (tablaProductos) {
        tablaProductos.destroy();
    }
    
    tablaProductos = $('#tablaProductos').DataTable({
        data: productosData,
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
            { data: 'idProducto' },
            { data: 'codigoBarras', defaultContent: '-' },
            { data: 'nombre' },
            { data: 'stockActual', defaultContent: '0' },
            { 
                data: 'precioVenta', 
                render: function(data) { return data ? '$' + parseFloat(data).toFixed(2) : '$0.00'; }
            },
            { 
                data: 'activo', 
                render: function(data) { return data ? '<span class="badge bg-success">Activo</span>' : '<span class="badge bg-danger">Inactivo</span>'; }
            },
            { 
                data: null, 
                orderable: false, 
                visible: mostrarAcciones,
                render: function(data) {
                    return '<button class="btn btn-sm btn-warning me-1" onclick="editarProducto(' + data.idProducto + ')" title="Editar">' +
                               '<i class="fas fa-edit"></i>' +
                           '</button>' +
                           '<button class="btn btn-sm btn-danger" onclick="eliminarProducto(' + data.idProducto + ')" title="Eliminar">' +
                               '<i class="fas fa-trash"></i>' +
                           '</button>';
                }
            }
        ]
    });
    
    const pageLengthSelect = document.getElementById('pageLength');
    if (pageLengthSelect) {
        pageLengthSelect.addEventListener('change', function() {
            if (tablaProductos) {
                tablaProductos.page.len(parseInt(pageLengthSelect.value)).draw();
            }
        });
    }
}

function actualizarGraficaStock() {
    const stockPorCategoria = {};
    for (var i = 0; i < productosData.length; i++) {
        const p = productosData[i];
        if (p.categoria && p.categoria.nombre) {
            const nombreCategoria = p.categoria.nombre;
            if (stockPorCategoria[nombreCategoria] === undefined) {
                stockPorCategoria[nombreCategoria] = 0;
            }
            stockPorCategoria[nombreCategoria] = stockPorCategoria[nombreCategoria] + (p.stockActual || 0);
        }
    }
    
    const ctx = document.getElementById('stockChart');
    if (ctx) {
        const existingChart = Chart.getChart(ctx);
        if (existingChart) existingChart.destroy();
        
        const labels = Object.keys(stockPorCategoria);
        const dataValues = [];
        for (var i = 0; i < labels.length; i++) {
            dataValues.push(stockPorCategoria[labels[i]]);
        }
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels.length > 0 ? labels : ['Sin categorías'],
                datasets: [{
                    label: 'Stock por categoría',
                    data: labels.length > 0 ? dataValues : [0],
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
    const stockBajo = [];
    for (var i = 0; i < productosData.length; i++) {
        const p = productosData[i];
        if ((p.stockActual || 0) <= (p.stockMinimo || 0)) {
            stockBajo.push(p);
        }
    }
    
    const tbody = document.getElementById('tablaStockBajoBody');
    if (tbody) {
        tbody.innerHTML = '';
        if (stockBajo.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">No hay productos con stock bajo</td></tr>';
        } else {
            const maxItems = stockBajo.length > 10 ? 10 : stockBajo.length;
            for (var i = 0; i < maxItems; i++) {
                const p = stockBajo[i];
                tbody.innerHTML = tbody.innerHTML + 
                    '<tr>' +
                        '<td>' + escapeHtml(p.nombre || '') + '</td>' +
                        '<td class="text-danger fw-bold">' + (p.stockActual || 0) + '</td>' +
                        '<td>' + (p.stockMinimo || 0) + '</td>' +
                    '</tr>';
            }
        }
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
    document.getElementById('productoModalLabel').innerText = 'Nuevo Producto';
}

async function editarProducto(id) {
    try {
        const response = await fetch(API_BASE_URL + '/productos/' + id, { headers: getHeaders() });
        
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
            const producto = await response.json();
            document.getElementById('productoId').value = producto.idProducto;
            document.getElementById('codigoBarras').value = producto.codigoBarras || '';
            document.getElementById('nombre').value = producto.nombre || '';
            document.getElementById('descripcion').value = producto.descripcion || '';
            document.getElementById('precioCompra').value = producto.precioCompra || '';
            document.getElementById('precioVenta').value = producto.precioVenta || '';
            document.getElementById('stockActual').value = producto.stockActual || 0;
            document.getElementById('stockMinimo').value = producto.stockMinimo || 0;
            document.getElementById('unidadMedida').value = producto.unidadMedida || 'unidad';
            document.getElementById('activo').value = producto.activo ? 'true' : 'false';
            if (producto.categoria && producto.categoria.idCategoria) {
                document.getElementById('categoriaId').value = producto.categoria.idCategoria;
            }
            document.getElementById('productoModalLabel').innerText = 'Editar Producto';
            new bootstrap.Modal(document.getElementById('productoModal')).show();
        } else {
            mostrarAlerta('Error al cargar el producto', 'danger');
        }
    } catch (error) {
        console.error('Error editar producto:', error);
        mostrarAlerta('Error de conexión al servidor', 'danger');
    }
}

async function guardarProducto() {
    const productoId = document.getElementById('productoId').value;
    const nombre = document.getElementById('nombre').value;
    const precioVenta = parseFloat(document.getElementById('precioVenta').value);
    
    if (!nombre || nombre.trim() === '') {
        mostrarAlerta('El nombre del producto es obligatorio', 'warning');
        return;
    }
    
    if (isNaN(precioVenta) || precioVenta <= 0) {
        mostrarAlerta('El precio de venta debe ser mayor a 0', 'warning');
        return;
    }
    
    const producto = {
        nombre: nombre.trim(),
        codigoBarras: document.getElementById('codigoBarras').value || null,
        descripcion: document.getElementById('descripcion').value || null,
        precioCompra: parseFloat(document.getElementById('precioCompra').value) || 0,
        precioVenta: precioVenta,
        stockActual: parseInt(document.getElementById('stockActual').value) || 0,
        stockMinimo: parseInt(document.getElementById('stockMinimo').value) || 0,
        unidadMedida: document.getElementById('unidadMedida').value || 'unidad',
        activo: document.getElementById('activo').value === 'true'
    };
    
    const categoriaId = document.getElementById('categoriaId')?.value;
    if (categoriaId && categoriaId !== '') {
        producto.categoria = { idCategoria: parseInt(categoriaId) };
    }
    
    const btnGuardar = document.getElementById('btnGuardarProducto');
    const textoOriginal = btnGuardar.innerHTML;
    btnGuardar.disabled = true;
    btnGuardar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Guardando...';
    
    try {
        const url = productoId ? API_BASE_URL + '/productos/' + productoId : API_BASE_URL + '/productos';
        const method = productoId ? 'PUT' : 'POST';
        const response = await fetch(url, { 
            method: method, 
            headers: getHeaders(), 
            body: JSON.stringify(producto) 
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
            const modal = bootstrap.Modal.getInstance(document.getElementById('productoModal'));
            if (modal) modal.hide();
            
            await cargarProductos();
            mostrarAlerta(productoId ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente', 'success');
            limpiarFormularioProducto();
        } else {
            let mensajeError = 'Error al guardar el producto';
            try {
                const error = await response.json();
                mensajeError = error.error || error.message || mensajeError;
            } catch(e) {
                const textError = await response.text();
                if (textError.includes('duplicate') || textError.includes('Duplicate')) {
                    mensajeError = 'Ya existe un producto con este nombre o código de barras';
                }
            }
            mostrarAlerta(mensajeError, 'danger');
        }
    } catch (error) {
        console.error('Error guardando producto:', error);
        mostrarAlerta('Error de conexión al servidor', 'danger');
    } finally {
        btnGuardar.disabled = false;
        btnGuardar.innerHTML = textoOriginal;
    }
}

async function eliminarProducto(id) {
    if (confirm('¿Está seguro de eliminar este producto? Esta acción no se puede deshacer.')) {
        try {
            const response = await fetch(API_BASE_URL + '/productos/' + id, { method: 'DELETE', headers: getHeaders() });
            
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
                await cargarProductos();
                mostrarAlerta('Producto eliminado exitosamente', 'success');
            } else {
                const error = await response.json();
                mostrarAlerta(error.error || 'Error al eliminar el producto', 'danger');
            }
        } catch (error) {
            console.error('Error eliminando producto:', error);
            mostrarAlerta('Error de conexión al servidor', 'danger');
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const btnNuevoProducto = document.getElementById('btnNuevoProducto');
    
    console.log('Usuario logueado:', userData);
    console.log('Rol del usuario:', userData.rol);
    
    if (!getAuthToken()) {
        window.location.href = 'login.html';
        return;
    }
    
    document.getElementById('userName').innerText = userData.nombreCompleto || userData.username || 'Usuario';
    document.getElementById('userRolBadge').innerText = userData.rol || '';
    document.getElementById('userRolText').innerHTML = '<strong>Rol:</strong> ' + (userData.rol || '');
    
    const rolesPermitidos = ['ADMIN', 'admin', 'ADMINISTRADOR', 'Administrador', 'BODEGA', 'bodega'];
    let tienePermiso = false;
    for (var i = 0; i < rolesPermitidos.length; i++) {
        if (userData.rol === rolesPermitidos[i]) {
            tienePermiso = true;
            break;
        }
    }
    
    console.log('Tiene permiso para agregar productos:', tienePermiso);
    
    if (tienePermiso) {
        if (btnNuevoProducto) {
            btnNuevoProducto.style.display = 'block';
            console.log('Botón Nuevo Producto visible');
        }
    } else {
        if (btnNuevoProducto) {
            btnNuevoProducto.style.display = 'none';
            console.log('Botón Nuevo Producto oculto');
        }
    }
    
    if (btnNuevoProducto) {
        btnNuevoProducto.removeEventListener('click', limpiarFormularioProducto);
        btnNuevoProducto.addEventListener('click', function() {
            limpiarFormularioProducto();
            const modal = new bootstrap.Modal(document.getElementById('productoModal'));
            modal.show();
        });
    }
    
    const btnGuardar = document.getElementById('btnGuardarProducto');
    if (btnGuardar) {
        btnGuardar.removeEventListener('click', guardarProducto);
        btnGuardar.addEventListener('click', guardarProducto);
    }
    
    cargarCategorias();
    cargarProductos();
});

window.cargarListaProductos = cargarProductos;
window.cargarCategoriasSelect = cargarCategoriasSelect;
window.limpiarFormularioProducto = limpiarFormularioProducto;
window.editarProducto = editarProducto;
window.guardarProducto = guardarProducto;
window.eliminarProducto = eliminarProducto;