// ============================================
// compras.js - Gestión de Compras
// Papelería App
// ============================================

const API_BASE_URL = 'http://localhost:8085/api';
let carritoCompra = [];
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

function calcularTotalCompra(compra) {
    let subtotal = 0;
    if (compra.detalles) {
        compra.detalles.forEach(d => {
            subtotal += d.costoUnitario * d.cantidad;
        });
    }
    return subtotal + (compra.impuesto || 0);
}

function actualizarCarritoCompra() {
    const container = document.getElementById('carritoCompraItems');
    if (!container) return;
    
    container.innerHTML = '';
    let subtotal = 0;
    
    carritoCompra.forEach((item, index) => {
        const totalItem = item.costoUnitario * item.cantidad;
        subtotal += totalItem;
        
        container.innerHTML += `
            <div class="cart-item">
                <div class="row align-items-center">
                    <div class="col-4">${item.nombre}</div>
                    <div class="col-2">
                        <input type="number" class="form-control form-control-sm" value="${item.cantidad}" 
                               onchange="actualizarCantidadCompra(${index}, this.value)">
                    </div>
                    <div class="col-2">
                        <input type="number" class="form-control form-control-sm" value="${item.costoUnitario}" step="0.01"
                               onchange="actualizarCostoCompra(${index}, this.value)">
                    </div>
                    <div class="col-2">$${totalItem.toFixed(2)}</div>
                    <div class="col-2">
                        <button class="btn btn-sm btn-danger" onclick="eliminarDelCarritoCompra(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    const impuesto = subtotal * 0.19;
    const total = subtotal + impuesto;
    
    const subtotalEl = document.getElementById('subtotalCompra');
    const impuestoEl = document.getElementById('impuestoCompra');
    const totalEl = document.getElementById('totalCompra');
    
    if (subtotalEl) subtotalEl.innerText = subtotal.toFixed(2);
    if (impuestoEl) impuestoEl.innerText = impuesto.toFixed(2);
    if (totalEl) totalEl.innerHTML = `<strong>$${total.toFixed(2)}</strong>`;
}

function actualizarCantidadCompra(index, cantidad) {
    carritoCompra[index].cantidad = parseInt(cantidad);
    actualizarCarritoCompra();
}

function actualizarCostoCompra(index, costo) {
    carritoCompra[index].costoUnitario = parseFloat(costo);
    actualizarCarritoCompra();
}

function eliminarDelCarritoCompra(index) {
    carritoCompra.splice(index, 1);
    actualizarCarritoCompra();
}

async function buscarProductoCompra() {
    const busqueda = document.getElementById('buscarProductoCompra').value;
    if (!busqueda) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/productos`, { headers: getHeaders() });
        if (response.ok) {
            const productos = await response.json();
            const producto = productos.find(p => 
                p.codigoBarras === busqueda || 
                p.nombre.toLowerCase().includes(busqueda.toLowerCase())
            );
            
            const resultadoDiv = document.getElementById('resultadoBusquedaCompra');
            if (producto) {
                resultadoDiv.innerHTML = `
                    <div class="alert alert-success">
                        <strong>${producto.nombre}</strong> - Último costo: $${producto.precioCompra}
                        <br>
                        <div class="row mt-2">
                            <div class="col-4">
                                <input type="number" id="cantidadCompra" class="form-control" placeholder="Cantidad" value="1">
                            </div>
                            <div class="col-4">
                                <input type="number" id="costoCompra" class="form-control" placeholder="Costo unitario" step="0.01" value="${producto.precioCompra}">
                            </div>
                            <div class="col-4">
                                <button class="btn btn-sm btn-primary" onclick="agregarAlCarritoCompra(${producto.idProducto}, '${producto.nombre}')">
                                    <i class="fas fa-cart-plus"></i> Agregar
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                resultadoDiv.innerHTML = `<div class="alert alert-danger">Producto no encontrado</div>`;
            }
        }
    } catch (error) {
        console.error('Error buscando producto:', error);
    }
}

function agregarAlCarritoCompra(id, nombre) {
    const cantidad = parseInt(document.getElementById('cantidadCompra')?.value || 1);
    const costoUnitario = parseFloat(document.getElementById('costoCompra')?.value || 0);
    
    const existente = carritoCompra.find(item => item.idProducto === id);
    if (existente) {
        existente.cantidad += cantidad;
        existente.costoUnitario = costoUnitario;
    } else {
        carritoCompra.push({ idProducto: id, nombre: nombre, cantidad: cantidad, costoUnitario: costoUnitario });
    }
    actualizarCarritoCompra();
    const resultadoDiv = document.getElementById('resultadoBusquedaCompra');
    if (resultadoDiv) resultadoDiv.innerHTML = '';
    const inputBusqueda = document.getElementById('buscarProductoCompra');
    if (inputBusqueda) inputBusqueda.value = '';
}

async function cargarProveedoresSelect() {
    try {
        const response = await fetch(`${API_BASE_URL}/proveedores`, { headers: getHeaders() });
        if (response.ok) {
            const proveedores = await response.json();
            const select = document.getElementById('proveedorCompra');
            if (select) {
                select.innerHTML = '<option value="">Seleccione un proveedor</option>';
                proveedores.forEach(p => {
                    select.innerHTML += `<option value="${p.idProveedor}">${p.nombre}</option>`;
                });
            }
        }
    } catch (error) {
        console.error('Error cargando proveedores:', error);
    }
}

async function registrarCompra() {
    if (carritoCompra.length === 0) {
        alert('Agregue productos a la compra');
        return;
    }
    
    const proveedorId = document.getElementById('proveedorCompra')?.value;
    if (!proveedorId) {
        alert('Seleccione un proveedor');
        return;
    }
    
    const subtotal = carritoCompra.reduce((sum, item) => sum + (item.costoUnitario * item.cantidad), 0);
    const impuesto = subtotal * 0.19;
    
    const compra = {
        numeroFactura: document.getElementById('numeroFactura')?.value || '',
        impuesto: impuesto,
        idProveedor: parseInt(proveedorId),
        idUsuario: 1,
        observacion: document.getElementById('observacionCompra')?.value || '',
        detalles: carritoCompra.map(item => ({
            idProducto: item.idProducto,
            cantidad: item.cantidad,
            costoUnitario: item.costoUnitario
        }))
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/compras`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(compra)
        });
        
        if (response.ok) {
            const result = await response.json();
            alert('Compra registrada exitosamente');
            carritoCompra = [];
            actualizarCarritoCompra();
            if (document.getElementById('numeroFactura')) document.getElementById('numeroFactura').value = '';
            if (document.getElementById('observacionCompra')) document.getElementById('observacionCompra').value = '';
            cargarListaCompras();
            // Recargar productos para actualizar stock
            if (typeof cargarProductos === 'function') cargarProductos();
        } else {
            const error = await response.json();
            alert(error.error || 'Error al registrar la compra');
        }
    } catch (error) {
        console.error('Error registrando compra:', error);
        alert('Error de conexión');
    }
}

async function cargarListaCompras() {
    try {
        const response = await fetch(`${API_BASE_URL}/compras`, { headers: getHeaders() });
        if (response.ok) {
            const compras = await response.json();
            
            if (tablaCompras) {
                tablaCompras.destroy();
            }
            
            tablaCompras = $('#tablaCompras').DataTable({
                data: compras,
                columns: [
                    { data: 'idCompra' },
                    { data: 'fechaHora', render: data => new Date(data).toLocaleString() },
                    { data: null, render: (data, type, row) => row.proveedor ? row.proveedor.nombre : '-' },
                    { data: null, render: (data) => calcularTotalCompra(data).toFixed(2) },
                    { data: null, render: (data, type, row) => row.estado ? row.estado.nombre : 'registrada' }
                ],
                language: { url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
                order: [[0, 'desc']]
            });
        }
    } catch (error) {
        console.error('Error cargando compras:', error);
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const formCompra = document.getElementById('formCompra');
    
    if (userData.rol === 'ADMIN' || userData.rol === 'BODEGA') {
        if (formCompra) formCompra.style.display = 'block';
        cargarProveedoresSelect();
        cargarListaCompras();
    } else {
        if (formCompra) formCompra.style.display = 'none';
    }
});

// Exponer funciones globales
window.actualizarCarritoCompra = actualizarCarritoCompra;
window.actualizarCantidadCompra = actualizarCantidadCompra;
window.actualizarCostoCompra = actualizarCostoCompra;
window.eliminarDelCarritoCompra = eliminarDelCarritoCompra;
window.buscarProductoCompra = buscarProductoCompra;
window.agregarAlCarritoCompra = agregarAlCarritoCompra;
window.registrarCompra = registrarCompra;
window.cargarListaCompras = cargarListaCompras;
window.cargarProveedoresSelect = cargarProveedoresSelect;