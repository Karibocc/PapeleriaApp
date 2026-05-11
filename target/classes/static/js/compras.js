// ============================================
// compras.js - Gestión de Compras
// Papelería App
// ============================================

const API_BASE_URL = 'http://localhost:8085/api';
let carrito = [];
let tablaCompras = null;
let proveedoresLista = [];

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

function calcularTotales() {
    let subtotal = 0;
    for (let i = 0; i < carrito.length; i++) {
        const item = carrito[i];
        subtotal = subtotal + (item.precioUnitario * item.cantidad - (item.descuento || 0));
    }
    
    const ivaPorcentaje = 0.19;
    const impuesto = subtotal * ivaPorcentaje;
    const descuentoGlobal = parseFloat(document.getElementById('descuentoGlobalInput').value || 0);
    let total = subtotal + impuesto - descuentoGlobal;
    
    if (total < 0) {
        total = 0;
    }
    
    document.getElementById('subtotal').innerText = subtotal.toFixed(2);
    document.getElementById('impuesto').innerText = impuesto.toFixed(2);
    document.getElementById('descuentoGlobal').innerText = descuentoGlobal.toFixed(2);
    document.getElementById('total').innerText = total.toFixed(2);
    
    return {
        subtotal: subtotal,
        impuesto: impuesto,
        descuento: descuentoGlobal,
        total: total
    };
}

function actualizarCarrito() {
    const container = document.getElementById('carritoItems');
    if (!container) return;
    
    if (carrito.length === 0) {
        container.innerHTML = '<p class="text-center text-muted">No hay productos en el carrito</p>';
        calcularTotales();
        return;
    }
    
    container.innerHTML = '';
    for (let i = 0; i < carrito.length; i++) {
        const item = carrito[i];
        const html = '<div class="cart-item">' +
                '<div class="row align-items-center">' +
                    '<div class="col-5">' + escapeHtml(item.nombre) + '</div>' +
                    '<div class="col-3">' +
                        '<input type="number" class="form-control form-control-sm" value="' + item.cantidad + '" onchange="actualizarCantidad(' + i + ', this.value)">' +
                    '</div>' +
                    '<div class="col-2">$' + (item.precioUnitario * item.cantidad).toFixed(2) + '</div>' +
                    '<div class="col-2">' +
                        '<button class="btn btn-sm btn-danger" onclick="eliminarDelCarrito(' + i + ')">' +
                            '<i class="fas fa-trash"></i>' +
                        '</button>' +
                    '</div>' +
                '</div>' +
            '</div>';
        container.innerHTML = container.innerHTML + html;
    }
    calcularTotales();
}

function actualizarCantidad(index, cantidad) {
    const nuevaCantidad = parseInt(cantidad);
    if (isNaN(nuevaCantidad) || nuevaCantidad <= 0) {
        eliminarDelCarrito(index);
    } else {
        carrito[index].cantidad = nuevaCantidad;
        actualizarCarrito();
    }
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarCarrito();
}

async function buscarProductoCompra() {
    const busqueda = document.getElementById('buscarProducto').value;
    if (!busqueda) {
        mostrarAlerta('Ingrese un código de barras o nombre', 'warning');
        return;
    }
    
    try {
        const response = await fetch(API_BASE_URL + '/productos', { headers: getHeaders() });
        if (response.ok) {
            const productos = await response.json();
            const productosActivos = [];
            for (let i = 0; i < productos.length; i++) {
                if (productos[i].activo === true) {
                    productosActivos.push(productos[i]);
                }
            }
            
            const producto = productosActivos.find(p => 
                (p.codigoBarras && p.codigoBarras === busqueda) || 
                p.nombre.toLowerCase().includes(busqueda.toLowerCase())
            );
            
            const resultadoDiv = document.getElementById('resultadoBusqueda');
            if (producto) {
                resultadoDiv.innerHTML = '<div class="alert alert-info">' +
                        '<strong>' + escapeHtml(producto.nombre) + '</strong><br>' +
                        'Stock actual: ' + producto.stockActual + '<br>' +
                        '<button class="btn btn-sm btn-primary mt-2" onclick="abrirModalAgregarProducto(' + producto.idProducto + ', \'' + escapeHtml(producto.nombre) + '\')">' +
                            '<i class="fas fa-cart-plus"></i> Agregar al Carrito' +
                        '</button>' +
                    '</div>';
            } else {
                resultadoDiv.innerHTML = '<div class="alert alert-danger">Producto no encontrado</div>';
            }
        }
    } catch (error) {
        console.error('Error buscando producto:', error);
        mostrarAlerta('Error de conexión al servidor', 'danger');
    }
}

function abrirModalAgregarProducto(id, nombre) {
    document.getElementById('productoIdTemp').value = id;
    document.getElementById('productoNombreTemp').value = nombre;
    document.getElementById('productoCantidad').value = '1';
    document.getElementById('productoPrecio').value = '';
    document.getElementById('productoDescuento').value = '0';
    new bootstrap.Modal(document.getElementById('productoModal')).show();
}

function agregarProductoAlCarrito() {
    const id = parseInt(document.getElementById('productoIdTemp').value);
    const nombre = document.getElementById('productoNombreTemp').value;
    const cantidad = parseInt(document.getElementById('productoCantidad').value);
    const precioUnitario = parseFloat(document.getElementById('productoPrecio').value);
    const descuento = parseFloat(document.getElementById('productoDescuento').value) || 0;
    
    if (!precioUnitario || precioUnitario <= 0) {
        mostrarAlerta('Ingrese un precio unitario válido', 'warning');
        return;
    }
    
    if (cantidad <= 0) {
        mostrarAlerta('Ingrese una cantidad válida', 'warning');
        return;
    }
    
    carrito.push({
        idProducto: id,
        nombre: nombre,
        cantidad: cantidad,
        precioUnitario: precioUnitario,
        descuento: descuento
    });
    
    actualizarCarrito();
    const modal = bootstrap.Modal.getInstance(document.getElementById('productoModal'));
    if (modal) modal.hide();
    document.getElementById('resultadoBusqueda').innerHTML = '';
    document.getElementById('buscarProducto').value = '';
    mostrarAlerta('Producto agregado al carrito', 'success');
}

async function cargarProveedoresSelect() {
    try {
        const response = await fetch(API_BASE_URL + '/proveedores', { headers: getHeaders() });
        if (response.ok) {
            proveedoresLista = await response.json();
            const select = document.getElementById('proveedorCompra');
            if (select) {
                select.innerHTML = '<option value="">Seleccione proveedor...</option>';
                for (let i = 0; i < proveedoresLista.length; i++) {
                    const p = proveedoresLista[i];
                    if (p.estado === 'activo' || p.estado === true) {
                        select.innerHTML = select.innerHTML + '<option value="' + p.idProveedor + '">' + escapeHtml(p.nombre) + '</option>';
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error cargando proveedores:', error);
    }
}

async function registrarCompra() {
    if (carrito.length === 0) {
        mostrarAlerta('Agregue productos al carrito', 'warning');
        return;
    }
    
    const idProveedor = document.getElementById('proveedorCompra').value;
    if (!idProveedor) {
        mostrarAlerta('Seleccione un proveedor', 'warning');
        return;
    }
    
    const totales = calcularTotales();
    
    const currentUserData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    let idUsuario = null;
    
    try {
        const usuariosResponse = await fetch(API_BASE_URL + '/usuarios', { headers: getHeaders() });
        if (usuariosResponse.ok) {
            const usuarios = await usuariosResponse.json();
            for (let i = 0; i < usuarios.length; i++) {
                if (usuarios[i].nombreUsuario === currentUserData.username) {
                    idUsuario = usuarios[i].idUsuario;
                    break;
                }
            }
        }
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
    }
    
    if (!idUsuario) {
        idUsuario = 1;
    }
    
    const detalles = [];
    for (let i = 0; i < carrito.length; i++) {
        detalles.push({
            idProducto: carrito[i].idProducto,
            cantidad: carrito[i].cantidad,
            precioUnitario: carrito[i].precioUnitario,
            descuento: carrito[i].descuento
        });
    }
    
    const compra = {
        idProveedor: parseInt(idProveedor),
        idUsuario: idUsuario,
        numeroFactura: document.getElementById('numeroFactura').value || null,
        descuento: totales.descuento,
        impuesto: totales.impuesto,
        observacion: document.getElementById('observacionCompra').value || '',
        detalles: detalles
    };
    
    const btnRegistrar = document.getElementById('btnRegistrarCompra');
    const textoOriginal = btnRegistrar.innerHTML;
    btnRegistrar.disabled = true;
    btnRegistrar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';
    
    try {
        const response = await fetch(API_BASE_URL + '/compras', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(compra)
        });
        
        if (response.ok) {
            mostrarAlerta('Compra registrada exitosamente', 'success');
            carrito = [];
            actualizarCarrito();
            document.getElementById('numeroFactura').value = '';
            document.getElementById('descuentoGlobalInput').value = '0';
            document.getElementById('observacionCompra').value = '';
            await cargarListaCompras();
            if (typeof cargarProductos === 'function') {
                cargarProductos();
            }
        } else {
            let mensajeError = 'Error al registrar la compra';
            try {
                const error = await response.json();
                mensajeError = error.error || mensajeError;
            } catch(e) {
                const textError = await response.text();
                if (textError) mensajeError = textError;
            }
            mostrarAlerta(mensajeError, 'danger');
        }
    } catch (error) {
        console.error('Error registrando compra:', error);
        mostrarAlerta('Error de conexión al servidor', 'danger');
    } finally {
        btnRegistrar.disabled = false;
        btnRegistrar.innerHTML = textoOriginal;
    }
}

async function cargarListaCompras() {
    try {
        console.log('Cargando lista de compras...');
        const response = await fetch(API_BASE_URL + '/compras', { headers: getHeaders() });
        console.log('Status respuesta:', response.status);
        
        if (response.ok) {
            const compras = await response.json();
            console.log('Compras recibidas:', compras);
            console.log('Cantidad de compras:', compras.length);
            
            if (tablaCompras) {
                tablaCompras.destroy();
            }
            
            tablaCompras = $('#tablaCompras').DataTable({
                data: compras,
                columns: [
                    { data: 'idCompra' },
                    { data: 'fechaHora', render: function(data) { 
                        return data ? new Date(data).toLocaleString() : '-'; 
                    } },
                    { data: 'proveedor', render: function(data) { 
                        return data && data.nombre ? data.nombre : 'N/A'; 
                    } },
                    { data: 'total', render: function(data) { 
                        return data ? '$' + parseFloat(data).toFixed(2) : '$0.00'; 
                    } },
                    { 
                        data: 'idCompra',
                        render: function(id) {
                            return '<button class="btn btn-sm btn-danger" onclick="anularCompra(' + id + ')" title="Anular Compra">' +
                                       '<i class="fas fa-ban"></i> Anular' +
                                   '</button>';
                        }
                    }
                ],
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
                order: [[0, 'desc']]
            });
            
            console.log('Tabla de compras inicializada correctamente');
        } else {
            console.error('Error en respuesta:', response.status);
        }
    } catch (error) {
        console.error('Error cargando compras:', error);
        mostrarAlerta('Error al cargar las compras', 'danger');
    }
}

async function anularCompra(id) {
    if (confirm('¿Está seguro de anular esta compra? Esto revertirá el stock de los productos.')) {
        try {
            const response = await fetch(API_BASE_URL + '/compras/' + id, { method: 'DELETE', headers: getHeaders() });
            
            if (response.ok) {
                mostrarAlerta('Compra anulada exitosamente', 'success');
                await cargarListaCompras();
                if (typeof cargarProductos === 'function') {
                    cargarProductos();
                }
            } else {
                let mensajeError = 'Error al anular la compra';
                try {
                    const error = await response.json();
                    mensajeError = error.error || mensajeError;
                } catch(e) {
                    const textError = await response.text();
                    if (textError) mensajeError = textError;
                }
                mostrarAlerta(mensajeError, 'danger');
            }
        } catch (error) {
            console.error('Error anulando compra:', error);
            mostrarAlerta('Error de conexión al servidor', 'danger');
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    
    console.log('Usuario logueado en compras:', userData);
    
    if (!getAuthToken()) {
        window.location.href = 'login.html';
        return;
    }
    
    const rolesPermitidos = ['ADMIN', 'admin', 'COMPRAS', 'compras'];
    let tienePermiso = false;
    for (let i = 0; i < rolesPermitidos.length; i++) {
        if (userData.rol === rolesPermitidos[i]) {
            tienePermiso = true;
            break;
        }
    }
    
    if (tienePermiso) {
        cargarProveedoresSelect();
        cargarListaCompras();
    } else {
        console.log('Usuario sin permiso para ver compras');
        const formCompra = document.getElementById('formCompra');
        if (formCompra) formCompra.style.display = 'none';
    }
    
    const btnBuscar = document.getElementById('btnBuscarProducto');
    if (btnBuscar) {
        btnBuscar.addEventListener('click', buscarProductoCompra);
    }
    
    const btnRegistrar = document.getElementById('btnRegistrarCompra');
    if (btnRegistrar) {
        btnRegistrar.addEventListener('click', registrarCompra);
    }
    
    const btnAgregarModal = document.getElementById('btnAgregarProductoModal');
    if (btnAgregarModal) {
        btnAgregarModal.addEventListener('click', agregarProductoAlCarrito);
    }
    
    const descuentoInput = document.getElementById('descuentoGlobalInput');
    if (descuentoInput) {
        descuentoInput.addEventListener('input', function() {
            calcularTotales();
        });
    }
});

window.actualizarCantidad = actualizarCantidad;
window.eliminarDelCarrito = eliminarDelCarrito;
window.abrirModalAgregarProducto = abrirModalAgregarProducto;
window.anularCompra = anularCompra;