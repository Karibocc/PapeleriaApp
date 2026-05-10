// ============================================
// ventas.js - Gestión de Ventas
// Papelería App
// ============================================

const API_BASE_URL = 'http://localhost:8085/api';
let carrito = [];
let tablaVentas = null;
let clientesLista = [];

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

function calcularTotalVenta(venta) {
    let subtotal = 0;
    if (venta.detalles) {
        venta.detalles.forEach(d => {
            subtotal += d.precioUnitario * d.cantidad - (d.descuento || 0);
        });
    }
    return subtotal + (venta.impuesto || 0) - (venta.descuento || 0);
}

function calcularTotales() {
    const subtotal = carrito.reduce((sum, item) => sum + (item.precioVenta * item.cantidad - (item.descuento || 0)), 0);
    const impuesto = subtotal * 0.19;
    const descuentoGlobal = parseFloat(document.getElementById('descuentoGlobalInput')?.value || 0);
    const total = subtotal + impuesto - descuentoGlobal;
    
    const subtotalEl = document.getElementById('subtotal');
    const impuestoEl = document.getElementById('impuesto');
    const descuentoGlobalEl = document.getElementById('descuentoGlobal');
    const totalEl = document.getElementById('total');
    
    if (subtotalEl) subtotalEl.innerText = subtotal.toFixed(2);
    if (impuestoEl) impuestoEl.innerText = impuesto.toFixed(2);
    if (descuentoGlobalEl) descuentoGlobalEl.innerText = descuentoGlobal.toFixed(2);
    if (totalEl) totalEl.innerText = total.toFixed(2);
    
    const montoPagado = parseFloat(document.getElementById('montoPagado')?.value || 0);
    const cambio = montoPagado - total;
    const cambioEl = document.getElementById('cambio');
    if (cambioEl) cambioEl.value = cambio >= 0 ? cambio.toFixed(2) : '0.00';
}

function actualizarCarrito() {
    const container = document.getElementById('carritoItems');
    if (!container) return;
    
    container.innerHTML = '';
    carrito.forEach((item, index) => {
        container.innerHTML += `
            <div class="cart-item">
                <div class="row align-items-center">
                    <div class="col-5">${item.nombre}</div>
                    <div class="col-2">
                        <input type="number" class="form-control form-control-sm" value="${item.cantidad}" 
                               onchange="actualizarCantidad(${index}, this.value)">
                    </div>
                    <div class="col-3">$${(item.precioVenta * item.cantidad).toFixed(2)}</div>
                    <div class="col-2">
                        <button class="btn btn-sm btn-danger" onclick="eliminarDelCarrito(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    calcularTotales();
}

function actualizarCantidad(index, cantidad) {
    carrito[index].cantidad = parseInt(cantidad);
    actualizarCarrito();
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarCarrito();
}

async function buscarProductoVenta() {
    const busqueda = document.getElementById('buscarProducto').value;
    if (!busqueda) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/productos`, { headers: getHeaders() });
        if (response.ok) {
            const productos = await response.json();
            const producto = productos.find(p => 
                p.codigoBarras === busqueda || 
                p.nombre.toLowerCase().includes(busqueda.toLowerCase())
            );
            
            const resultadoDiv = document.getElementById('resultadoBusqueda');
            if (producto && producto.stockActual > 0) {
                resultadoDiv.innerHTML = `
                    <div class="alert alert-success">
                        <strong>${producto.nombre}</strong> - Stock: ${producto.stockActual} - Precio: $${producto.precioVenta}
                        <br>
                        <button class="btn btn-sm btn-primary mt-2" onclick="agregarAlCarrito(${producto.idProducto}, '${producto.nombre}', ${producto.precioVenta})">
                            <i class="fas fa-cart-plus"></i> Agregar al Carrito
                        </button>
                    </div>
                `;
            } else if (producto && producto.stockActual <= 0) {
                resultadoDiv.innerHTML = `<div class="alert alert-warning">Producto sin stock disponible</div>`;
            } else {
                resultadoDiv.innerHTML = `<div class="alert alert-danger">Producto no encontrado</div>`;
            }
        }
    } catch (error) {
        console.error('Error buscando producto:', error);
    }
}

function agregarAlCarrito(id, nombre, precio) {
    const existente = carrito.find(item => item.idProducto === id);
    if (existente) {
        existente.cantidad++;
    } else {
        carrito.push({ idProducto: id, nombre: nombre, precioVenta: precio, cantidad: 1, descuento: 0 });
    }
    actualizarCarrito();
    document.getElementById('resultadoBusqueda').innerHTML = '';
    document.getElementById('buscarProducto').value = '';
}

async function cargarClientesSelect() {
    try {
        const response = await fetch(`${API_BASE_URL}/clientes`, { headers: getHeaders() });
        if (response.ok) {
            clientesLista = await response.json();
            const select = document.getElementById('clienteVenta');
            if (select) {
                select.innerHTML = '<option value="">Cliente Mostrador</option>';
                clientesLista.forEach(c => {
                    select.innerHTML += `<option value="${c.idCliente}">${c.nombre}</option>`;
                });
            }
        }
    } catch (error) {
        console.error('Error cargando clientes:', error);
    }
}

async function registrarVenta() {
    if (carrito.length === 0) {
        alert('Agregue productos al carrito');
        return;
    }
    
    const subtotal = carrito.reduce((sum, item) => sum + (item.precioVenta * item.cantidad), 0);
    const impuesto = subtotal * 0.19;
    const descuentoGlobal = parseFloat(document.getElementById('descuentoGlobalInput')?.value || 0);
    const total = subtotal + impuesto - descuentoGlobal;
    const montoPagado = parseFloat(document.getElementById('montoPagado')?.value || 0);
    
    if (montoPagado < total) {
        alert('El monto pagado es insuficiente');
        return;
    }
    
    const currentUserData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    const venta = {
        detalles: carrito.map(item => ({
            idProducto: item.idProducto,
            cantidad: item.cantidad,
            descuento: 0
        })),
        descuento: descuentoGlobal,
        impuesto: impuesto,
        montoPagado: montoPagado,
        metodoPago: document.getElementById('metodoPago')?.value || 'efectivo',
        idCliente: document.getElementById('clienteVenta')?.value || null,
        idUsuario: 1,
        observacion: document.getElementById('observacionVenta')?.value || ''
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/ventas`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(venta)
        });
        
        if (response.ok) {
            const result = await response.json();
            alert('Venta registrada exitosamente');
            carrito = [];
            actualizarCarrito();
            if (document.getElementById('descuentoGlobalInput')) document.getElementById('descuentoGlobalInput').value = '0';
            if (document.getElementById('montoPagado')) document.getElementById('montoPagado').value = '0';
            if (document.getElementById('observacionVenta')) document.getElementById('observacionVenta').value = '';
            cargarListaVentas();
        } else {
            const error = await response.json();
            alert(error.error || 'Error al registrar la venta');
        }
    } catch (error) {
        console.error('Error registrando venta:', error);
        alert('Error de conexión');
    }
}

async function cargarListaVentas() {
    try {
        const response = await fetch(`${API_BASE_URL}/ventas`, { headers: getHeaders() });
        if (response.ok) {
            const ventas = await response.json();
            
            if (tablaVentas) {
                tablaVentas.destroy();
            }
            
            tablaVentas = $('#tablaVentas').DataTable({
                data: ventas,
                columns: [
                    { data: 'idVenta' },
                    { data: 'fechaHora', render: data => new Date(data).toLocaleString() },
                    { data: null, render: (data, type, row) => row.cliente ? row.cliente.nombre : 'Mostrador' },
                    { data: null, render: (data) => calcularTotalVenta(data).toFixed(2) },
                    { data: null, render: (data, type, row) => row.estado ? row.estado.nombre : 'registrada' }
                ],
                language: { url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' },
                order: [[0, 'desc']]
            });
        }
    } catch (error) {
        console.error('Error cargando ventas:', error);
    }
}

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const formVenta = document.getElementById('formVenta');
    
    if (userData.rol === 'ADMIN' || userData.rol === 'VENDEDOR') {
        if (formVenta) formVenta.style.display = 'block';
        cargarClientesSelect();
        cargarListaVentas();
    } else {
        if (formVenta) formVenta.style.display = 'none';
    }
});

// Exponer funciones globales
window.calcularTotales = calcularTotales;
window.actualizarCantidad = actualizarCantidad;
window.eliminarDelCarrito = eliminarDelCarrito;
window.buscarProductoVenta = buscarProductoVenta;
window.agregarAlCarrito = agregarAlCarrito;
window.registrarVenta = registrarVenta;
window.cargarListaVentas = cargarListaVentas;
window.cargarClientesSelect = cargarClientesSelect;