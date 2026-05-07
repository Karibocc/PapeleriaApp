// Inicialización común
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    // Toggle sidebar
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            const sidebar = document.querySelector('.sidebar');
            const content = document.getElementById('page-content-wrapper');
            if (sidebar.style.width === '250px') {
                sidebar.style.width = '70px';
                content.style.marginLeft = '70px';
                document.querySelectorAll('.sidebar .nav-link span').forEach(span => {
                    span.style.display = 'none';
                });
            } else {
                sidebar.style.width = '250px';
                content.style.marginLeft = '250px';
                document.querySelectorAll('.sidebar .nav-link span').forEach(span => {
                    span.style.display = 'inline';
                });
            }
        });
    }
    
    // Cargar datos según la página actual
    const page = window.location.pathname.split('/').pop();
    
    if (page === 'index.html') {
        cargarDashboard();
    } else if (page === 'productos.html') {
        cargarListaProductos();
        cargarCategoriasSelect();
    } else if (page === 'clientes.html') {
        cargarListaClientes();
    } else if (page === 'proveedores.html') {
        cargarListaProveedores();
    } else if (page === 'ventas.html') {
        cargarListaVentas();
        cargarClientesSelect();
    } else if (page === 'compras.html') {
        cargarListaCompras();
        cargarProveedoresSelect();
    } else if (page === 'reportes.html') {
        cargarTopProductos();
        cargarUtilidades();
        cargarGraficoVentas();
    } else if (page === 'configuracion.html') {
        cargarConfiguracionesForm();
        document.getElementById('configForm').addEventListener('submit', guardarConfiguraciones);
    } else if (page === 'usuarios.html') {
        if (currentUser && currentUser.rol === 'ADMIN') {
            cargarListaUsuarios();
        } else {
            window.location.href = 'index.html';
        }
    }
});

// Dashboard
async function cargarDashboard() {
    try {
        const productos = await cargarProductos();
        document.getElementById('totalProductos').innerText = productos.length || 0;
        
        const clientes = await cargarClientes();
        document.getElementById('totalClientes').innerText = clientes.length || 0;
        
        const stockBajo = productos.filter(p => p.stockActual <= p.stockMinimo);
        document.getElementById('stockBajo').innerText = stockBajo.length || 0;
        
        const ventas = await apiRequest('/ventas');
        const ventasMes = ventas.filter(v => {
            const fecha = new Date(v.fechaHora);
            const ahora = new Date();
            return fecha.getMonth() === ahora.getMonth() && fecha.getFullYear() === ahora.getFullYear();
        });
        const totalVentasMes = ventasMes.reduce((sum, v) => sum + calcularTotalVenta(v), 0);
        document.getElementById('ventasMes').innerText = `$${totalVentasMes.toFixed(2)}`;
    } catch (error) {
        console.error('Error cargando dashboard:', error);
    }
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

// Productos
let tablaProductos = null;

async function cargarListaProductos() {
    const productos = await cargarProductos();
    
    if (tablaProductos) {
        tablaProductos.destroy();
    }
    
    tablaProductos = $('#tablaProductos').DataTable({
        data: productos,
        columns: [
            { data: 'idProducto' },
            { data: 'codigoBarras' },
            { data: 'nombre' },
            { data: 'categoria' ? 'categoria.nombre' : '-', 
              render: (data, type, row) => row.categoria ? row.categoria.nombre : '-' },
            { data: 'stockActual' },
            { data: 'precioVenta', render: data => `$${data}` },
            { data: 'activo', render: data => data ? 'Activo' : 'Inactivo' },
            { data: null, orderable: false, render: (data) => `
                <button class="btn btn-sm btn-warning" onclick="editarProducto(${data.idProducto})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="eliminarProducto(${data.idProducto})"><i class="fas fa-trash"></i></button>
            ` }
        ],
        language: { url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' }
    });
}

async function cargarCategoriasSelect() {
    const categorias = await cargarCategorias();
    const select = document.getElementById('categoriaId');
    select.innerHTML = '<option value="">Seleccione...</option>';
    categorias.forEach(cat => {
        select.innerHTML += `<option value="${cat.idCategoria}">${cat.nombre}</option>`;
    });
}

function limpiarFormularioProducto() {
    document.getElementById('productoId').value = '';
    document.getElementById('codigoBarras').value = '';
    document.getElementById('nombre').value = '';
    document.getElementById('descripcion').value = '';
    document.getElementById('categoriaId').value = '';
    document.getElementById('precioCompra').value = '';
    document.getElementById('precioVenta').value = '';
    document.getElementById('stockActual').value = '';
    document.getElementById('stockMinimo').value = '';
    document.getElementById('unidadMedida').value = 'unidad';
    document.getElementById('activo').value = 'true';
}

async function editarProducto(id) {
    const productos = await cargarProductos();
    const producto = productos.find(p => p.idProducto === id);
    if (producto) {
        document.getElementById('productoId').value = producto.idProducto;
        document.getElementById('codigoBarras').value = producto.codigoBarras || '';
        document.getElementById('nombre').value = producto.nombre;
        document.getElementById('descripcion').value = producto.descripcion || '';
        document.getElementById('categoriaId').value = producto.categoria?.idCategoria || '';
        document.getElementById('precioCompra').value = producto.precioCompra;
        document.getElementById('precioVenta').value = producto.precioVenta;
        document.getElementById('stockActual').value = producto.stockActual;
        document.getElementById('stockMinimo').value = producto.stockMinimo;
        document.getElementById('unidadMedida').value = producto.unidadMedida || 'unidad';
        document.getElementById('activo').value = producto.activo ? 'true' : 'false';
        
        new bootstrap.Modal(document.getElementById('productoModal')).show();
    }
}

async function guardarProducto() {
    const producto = {
        idProducto: document.getElementById('productoId').value || null,
        codigoBarras: document.getElementById('codigoBarras').value,
        nombre: document.getElementById('nombre').value,
        descripcion: document.getElementById('descripcion').value,
        idCategoria: document.getElementById('categoriaId').value || null,
        precioCompra: parseFloat(document.getElementById('precioCompra').value),
        precioVenta: parseFloat(document.getElementById('precioVenta').value),
        stockActual: parseInt(document.getElementById('stockActual').value),
        stockMinimo: parseInt(document.getElementById('stockMinimo').value),
        unidadMedida: document.getElementById('unidadMedida').value,
        activo: document.getElementById('activo').value === 'true'
    };
    
    await guardarProductoAPI(producto);
    bootstrap.Modal.getInstance(document.getElementById('productoModal')).hide();
    cargarListaProductos();
}

async function eliminarProducto(id) {
    if (confirm('¿Está seguro de eliminar este producto?')) {
        await eliminarProductoAPI(id);
        cargarListaProductos();
    }
}

// Clientes
let tablaClientes = null;

async function cargarListaClientes() {
    const clientes = await cargarClientes();
    
    if (tablaClientes) {
        tablaClientes.destroy();
    }
    
    tablaClientes = $('#tablaClientes').DataTable({
        data: clientes,
        columns: [
            { data: 'idCliente' },
            { data: 'nombre' },
            { data: 'correo', defaultContent: '-' },
            { data: 'telefono', defaultContent: '-' },
            { data: 'direccion', defaultContent: '-' },
            { data: null, orderable: false, render: (data) => `
                <button class="btn btn-sm btn-warning" onclick="editarCliente(${data.idCliente})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="eliminarCliente(${data.idCliente})"><i class="fas fa-trash"></i></button>
            ` }
        ],
        language: { url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' }
    });
}

function limpiarFormularioCliente() {
    document.getElementById('clienteId').value = '';
    document.getElementById('clienteNombre').value = '';
    document.getElementById('clienteCorreo').value = '';
    document.getElementById('clienteTelefono').value = '';
    document.getElementById('clienteDireccion').value = '';
}

async function editarCliente(id) {
    const clientes = await cargarClientes();
    const cliente = clientes.find(c => c.idCliente === id);
    if (cliente) {
        document.getElementById('clienteId').value = cliente.idCliente;
        document.getElementById('clienteNombre').value = cliente.nombre;
        document.getElementById('clienteCorreo').value = cliente.correo || '';
        document.getElementById('clienteTelefono').value = cliente.telefono || '';
        document.getElementById('clienteDireccion').value = cliente.direccion || '';
        new bootstrap.Modal(document.getElementById('clienteModal')).show();
    }
}

async function guardarCliente() {
    const cliente = {
        idCliente: document.getElementById('clienteId').value || null,
        nombre: document.getElementById('clienteNombre').value,
        correo: document.getElementById('clienteCorreo').value,
        telefono: document.getElementById('clienteTelefono').value,
        direccion: document.getElementById('clienteDireccion').value
    };
    
    await guardarClienteAPI(cliente);
    bootstrap.Modal.getInstance(document.getElementById('clienteModal')).hide();
    cargarListaClientes();
}

async function eliminarCliente(id) {
    if (confirm('¿Está seguro de eliminar este cliente?')) {
        await eliminarClienteAPI(id);
        cargarListaClientes();
    }
}

// Proveedores
let tablaProveedores = null;

async function cargarListaProveedores() {
    const proveedores = await cargarProveedores();
    
    if (tablaProveedores) {
        tablaProveedores.destroy();
    }
    
    tablaProveedores = $('#tablaProveedores').DataTable({
        data: proveedores,
        columns: [
            { data: 'idProveedor' },
            { data: 'nombre' },
            { data: 'nit', defaultContent: '-' },
            { data: 'contacto', defaultContent: '-' },
            { data: 'telefono', defaultContent: '-' },
            { data: 'estado', render: data => data === 'activo' ? 'Activo' : 'Inactivo' },
            { data: null, orderable: false, render: (data) => `
                <button class="btn btn-sm btn-warning" onclick="editarProveedor(${data.idProveedor})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="eliminarProveedor(${data.idProveedor})"><i class="fas fa-trash"></i></button>
            ` }
        ],
        language: { url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' }
    });
}

function limpiarFormularioProveedor() {
    document.getElementById('proveedorId').value = '';
    document.getElementById('proveedorNombre').value = '';
    document.getElementById('proveedorNit').value = '';
    document.getElementById('proveedorContacto').value = '';
    document.getElementById('proveedorTelefono').value = '';
    document.getElementById('proveedorCorreo').value = '';
    document.getElementById('proveedorDireccion').value = '';
    document.getElementById('proveedorEstado').value = 'activo';
}

async function editarProveedor(id) {
    const proveedores = await cargarProveedores();
    const proveedor = proveedores.find(p => p.idProveedor === id);
    if (proveedor) {
        document.getElementById('proveedorId').value = proveedor.idProveedor;
        document.getElementById('proveedorNombre').value = proveedor.nombre;
        document.getElementById('proveedorNit').value = proveedor.nit || '';
        document.getElementById('proveedorContacto').value = proveedor.contacto || '';
        document.getElementById('proveedorTelefono').value = proveedor.telefono || '';
        document.getElementById('proveedorCorreo').value = proveedor.correo || '';
        document.getElementById('proveedorDireccion').value = proveedor.direccion || '';
        document.getElementById('proveedorEstado').value = proveedor.estado || 'activo';
        new bootstrap.Modal(document.getElementById('proveedorModal')).show();
    }
}

async function guardarProveedor() {
    const proveedor = {
        idProveedor: document.getElementById('proveedorId').value || null,
        nombre: document.getElementById('proveedorNombre').value,
        nit: document.getElementById('proveedorNit').value,
        contacto: document.getElementById('proveedorContacto').value,
        telefono: document.getElementById('proveedorTelefono').value,
        correo: document.getElementById('proveedorCorreo').value,
        direccion: document.getElementById('proveedorDireccion').value,
        estado: document.getElementById('proveedorEstado').value
    };
    
    await guardarProveedorAPI(proveedor);
    bootstrap.Modal.getInstance(document.getElementById('proveedorModal')).hide();
    cargarListaProveedores();
}

async function eliminarProveedor(id) {
    if (confirm('¿Está seguro de eliminar este proveedor?')) {
        await eliminarProveedorAPI(id);
        cargarListaProveedores();
    }
}

// Ventas
let carrito = [];

function calcularTotales() {
    const subtotal = carrito.reduce((sum, item) => sum + (item.precioVenta * item.cantidad - (item.descuento || 0)), 0);
    const impuesto = subtotal * 0.19;
    const descuentoGlobal = parseFloat(document.getElementById('descuentoGlobalInput').value) || 0;
    const total = subtotal + impuesto - descuentoGlobal;
    
    document.getElementById('subtotal').innerText = subtotal.toFixed(2);
    document.getElementById('impuesto').innerText = impuesto.toFixed(2);
    document.getElementById('descuentoGlobal').innerText = descuentoGlobal.toFixed(2);
    document.getElementById('total').innerText = total.toFixed(2);
    
    const montoPagado = parseFloat(document.getElementById('montoPagado').value) || 0;
    const cambio = montoPagado - total;
    document.getElementById('cambio').value = cambio >= 0 ? cambio.toFixed(2) : '0.00';
}

function actualizarCarrito() {
    const container = document.getElementById('carritoItems');
    if (!container) return;
    
    container.innerHTML = '';
    carrito.forEach((item, index) => {
        container.innerHTML += `
            <div class="cart-item">
                <div class="row">
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
    
    const productos = await cargarProductos();
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
                    Agregar al Carrito
                </button>
            </div>
        `;
    } else if (producto && producto.stockActual <= 0) {
        resultadoDiv.innerHTML = `<div class="alert alert-warning">Producto sin stock disponible</div>`;
    } else {
        resultadoDiv.innerHTML = `<div class="alert alert-danger">Producto no encontrado</div>`;
    }
}

function agregarAlCarrito(id, nombre, precio) {
    const existente = carrito.find(item => item.idProducto === id);
    if (existente) {
        existente.cantidad++;
    } else {
        carrito.push({ idProducto: id, nombre: nombre, precioVenta: precio, cantidad: 1 });
    }
    actualizarCarrito();
    document.getElementById('resultadoBusqueda').innerHTML = '';
    document.getElementById('buscarProducto').value = '';
}

async function cargarClientesSelect() {
    const clientes = await cargarClientes();
    const select = document.getElementById('clienteVenta');
    if (select) {
        select.innerHTML = '<option value="">Cliente Mostrador</option>';
        clientes.forEach(c => {
            select.innerHTML += `<option value="${c.idCliente}">${c.nombre}</option>`;
        });
    }
}

async function registrarVenta() {
    if (carrito.length === 0) {
        alert('Agregue productos al carrito');
        return;
    }
    
    const subtotal = carrito.reduce((sum, item) => sum + (item.precioVenta * item.cantidad), 0);
    const impuesto = subtotal * 0.19;
    const descuentoGlobal = parseFloat(document.getElementById('descuentoGlobalInput').value) || 0;
    const total = subtotal + impuesto - descuentoGlobal;
    const montoPagado = parseFloat(document.getElementById('montoPagado').value) || 0;
    
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
        metodoPago: document.getElementById('metodoPago').value,
        idCliente: document.getElementById('clienteVenta').value || null,
        idUsuario: 1,
        observacion: document.getElementById('observacionVenta').value
    };
    
    const result = await registrarVentaAPI(venta);
    if (result && result.idVenta) {
        alert('Venta registrada exitosamente');
        carrito = [];
        actualizarCarrito();
        document.getElementById('descuentoGlobalInput').value = '0';
        document.getElementById('montoPagado').value = '0';
        document.getElementById('observacionVenta').value = '';
        cargarListaVentas();
    } else {
        alert('Error al registrar la venta');
    }
}

let tablaVentas = null;

async function cargarListaVentas() {
    const ventas = await apiRequest('/ventas');
    
    if (tablaVentas) {
        tablaVentas.destroy();
    }
    
    tablaVentas = $('#tablaVentas').DataTable({
        data: ventas,
        columns: [
            { data: 'idVenta' },
            { data: 'fechaHora', render: data => new Date(data).toLocaleString() },
            { data: 'cliente' ? 'cliente.nombre' : '-', render: (data, type, row) => row.cliente ? row.cliente.nombre : 'Mostrador' },
            { data: null, render: (data) => calcularTotalVenta(data).toFixed(2) },
            { data: 'estado' ? 'estado.nombre' : '-', render: (data, type, row) => row.estado ? row.estado.nombre : 'registrada' }
        ],
        language: { url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' }
    });
}

// Compras
let carritoCompra = [];

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
                <div class="row">
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
    
    document.getElementById('subtotalCompra').innerText = subtotal.toFixed(2);
    document.getElementById('impuestoCompra').innerText = impuesto.toFixed(2);
    document.getElementById('totalCompra').innerHTML = `<strong>$${total.toFixed(2)}</strong>`;
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
    
    const productos = await cargarProductos();
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
                            Agregar
                        </button>
                    </div>
                </div>
            </div>
        `;
    } else {
        resultadoDiv.innerHTML = `<div class="alert alert-danger">Producto no encontrado</div>`;
    }
}

function agregarAlCarritoCompra(id, nombre) {
    const cantidad = parseInt(document.getElementById('cantidadCompra').value) || 1;
    const costoUnitario = parseFloat(document.getElementById('costoCompra').value) || 0;
    
    const existente = carritoCompra.find(item => item.idProducto === id);
    if (existente) {
        existente.cantidad += cantidad;
        existente.costoUnitario = costoUnitario;
    } else {
        carritoCompra.push({ idProducto: id, nombre: nombre, cantidad: cantidad, costoUnitario: costoUnitario });
    }
    actualizarCarritoCompra();
    document.getElementById('resultadoBusquedaCompra').innerHTML = '';
    document.getElementById('buscarProductoCompra').value = '';
}

async function cargarProveedoresSelect() {
    const proveedores = await cargarProveedores();
    const select = document.getElementById('proveedorCompra');
    if (select) {
        select.innerHTML = '<option value="">Seleccione un proveedor</option>';
        proveedores.forEach(p => {
            select.innerHTML += `<option value="${p.idProveedor}">${p.nombre}</option>`;
        });
    }
}

async function registrarCompra() {
    if (carritoCompra.length === 0) {
        alert('Agregue productos a la compra');
        return;
    }
    
    const proveedorId = document.getElementById('proveedorCompra').value;
    if (!proveedorId) {
        alert('Seleccione un proveedor');
        return;
    }
    
    const subtotal = carritoCompra.reduce((sum, item) => sum + (item.costoUnitario * item.cantidad), 0);
    const impuesto = subtotal * 0.19;
    
    const compra = {
        numeroFactura: document.getElementById('numeroFactura').value,
        impuesto: impuesto,
        idProveedor: parseInt(proveedorId),
        idUsuario: 1,
        observacion: document.getElementById('observacionCompra').value,
        detalles: carritoCompra.map(item => ({
            idProducto: item.idProducto,
            cantidad: item.cantidad,
            costoUnitario: item.costoUnitario
        }))
    };
    
    const result = await registrarCompraAPI(compra);
    if (result && result.idCompra) {
        alert('Compra registrada exitosamente');
        carritoCompra = [];
        actualizarCarritoCompra();
        document.getElementById('numeroFactura').value = '';
        document.getElementById('observacionCompra').value = '';
        cargarListaCompras();
        cargarListaProductos();
    } else {
        alert('Error al registrar la compra');
    }
}

let tablaCompras = null;

async function cargarListaCompras() {
    const compras = await cargarCompras();
    
    if (tablaCompras) {
        tablaCompras.destroy();
    }
    
    tablaCompras = $('#tablaCompras').DataTable({
        data: compras,
        columns: [
            { data: 'idCompra' },
            { data: 'fechaHora', render: data => new Date(data).toLocaleString() },
            { data: 'proveedor' ? 'proveedor.nombre' : '-', render: (data, type, row) => row.proveedor ? row.proveedor.nombre : '-' },
            { data: null, render: (data) => calcularTotalCompra(data).toFixed(2) },
            { data: 'estado' ? 'estado.nombre' : '-', render: (data, type, row) => row.estado ? row.estado.nombre : 'registrada' }
        ],
        language: { url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' }
    });
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

// Reportes
function generarReporteVentasPDF() {
    const inicio = document.getElementById('fechaInicio').value;
    const fin = document.getElementById('fechaFin').value;
    if (inicio && fin) {
        window.open(`${API_BASE_URL}/reportes/ventas/pdf?inicio=${inicio}&fin=${fin}`, '_blank');
    } else {
        alert('Seleccione las fechas de inicio y fin');
    }
}

function generarReporteVentasExcel() {
    const inicio = document.getElementById('fechaInicio').value;
    const fin = document.getElementById('fechaFin').value;
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
    const inicio = document.getElementById('topInicio').value;
    const fin = document.getElementById('topFin').value;
    
    if (!inicio || !fin) {
        const hoy = new Date();
        const hace30Dias = new Date();
        hace30Dias.setDate(hoy.getDate() - 30);
        document.getElementById('topInicio').value = hace30Dias.toISOString().split('T')[0];
        document.getElementById('topFin').value = hoy.toISOString().split('T')[0];
    }
    
    const productos = await obtenerTopProductos(
        document.getElementById('topInicio').value || new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0],
        document.getElementById('topFin').value || new Date().toISOString().split('T')[0]
    );
    
    const tbody = document.querySelector('#tablaTopProductos tbody');
    tbody.innerHTML = '';
    productos.forEach(p => {
        tbody.innerHTML += `<tr><td>${p.nombre}</td><td>${p.totalVendido}</td></tr>`;
    });
}

async function cargarUtilidades() {
    const inicio = document.getElementById('utilidadInicio').value;
    const fin = document.getElementById('utilidadFin').value;
    
    if (!inicio || !fin) {
        alert('Seleccione las fechas de inicio y fin');
        return;
    }
    
    const utilidades = await apiRequest(`/reportes/utilidades?inicio=${inicio}&fin=${fin}`);
    const container = document.getElementById('resultadoUtilidades');
    
    let html = '<table class="table"><thead><tr><th>Fecha</th><th>Cantidad Ventas</th><th>Total Ingresos</th><th>Utilidad</th></tr></thead><tbody>';
    utilidades.forEach(u => {
        html += `<tr>
            <td>${u.fecha}</td>
            <td>${u.cantidadVentas}</td>
            <td>$${u.totalIngresos}</td>
            <td>$${u.totalUtilidad}</td>
        </tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

let ventasChart = null;

async function cargarGraficoVentas() {
    const hoy = new Date();
    const hace7Dias = new Date();
    hace7Dias.setDate(hoy.getDate() - 7);
    
    const fechaInicio = hace7Dias.toISOString().split('T')[0];
    const fechaFin = hoy.toISOString().split('T')[0];
    
    const utilidades = await apiRequest(`/reportes/utilidades?inicio=${fechaInicio}&fin=${fechaFin}`);
    
    const ctx = document.getElementById('ventasChart').getContext('2d');
    
    if (ventasChart) {
        ventasChart.destroy();
    }
    
    ventasChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: utilidades.map(u => u.fecha),
            datasets: [
                {
                    label: 'Ingresos',
                    data: utilidades.map(u => u.totalIngresos),
                    borderColor: '#4e73df',
                    backgroundColor: 'rgba(78, 115, 223, 0.1)',
                    fill: true
                },
                {
                    label: 'Utilidad',
                    data: utilidades.map(u => u.totalUtilidad),
                    borderColor: '#1cc88a',
                    backgroundColor: 'rgba(28, 200, 138, 0.1)',
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Configuración
async function cargarConfiguracionesForm() {
    const configs = await cargarConfiguraciones();
    document.getElementById('nombre_negocio').value = configs.nombre_negocio || '';
    document.getElementById('nit_negocio').value = configs.nit_negocio || '';
    document.getElementById('telefono').value = configs.telefono || '';
    document.getElementById('correo_negocio').value = configs.correo_negocio || '';
    document.getElementById('direccion_negocio').value = configs.direccion_negocio || '';
    document.getElementById('iva_porcentaje').value = configs.iva_porcentaje || '19';
    document.getElementById('iva_incluido').value = configs.iva_incluido === 'true' ? 'true' : 'false';
}

async function guardarConfiguraciones(e) {
    e.preventDefault();
    
    await guardarConfiguracionAPI('nombre_negocio', document.getElementById('nombre_negocio').value);
    await guardarConfiguracionAPI('nit_negocio', document.getElementById('nit_negocio').value);
    await guardarConfiguracionAPI('telefono', document.getElementById('telefono').value);
    await guardarConfiguracionAPI('correo_negocio', document.getElementById('correo_negocio').value);
    await guardarConfiguracionAPI('direccion_negocio', document.getElementById('direccion_negocio').value);
    await guardarConfiguracionAPI('iva_porcentaje', document.getElementById('iva_porcentaje').value);
    await guardarConfiguracionAPI('iva_incluido', document.getElementById('iva_incluido').value);
    
    alert('Configuración guardada exitosamente');
}

async function cambiarContrasena() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!currentPassword || !newPassword) {
        alert('Complete todos los campos');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        alert('Las contraseñas nuevas no coinciden');
        return;
    }
    
    const result = await changePassword(currentPassword, newPassword);
    
    if (result.message) {
        alert('Contraseña cambiada exitosamente');
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
    } else {
        alert(result.error || 'Error al cambiar la contraseña');
    }
}

// Usuarios (Admin)
let tablaUsuarios = null;

async function cargarListaUsuarios() {
    const usuarios = await cargarUsuarios();
    
    if (tablaUsuarios) {
        tablaUsuarios.destroy();
    }
    
    tablaUsuarios = $('#tablaUsuarios').DataTable({
        data: usuarios,
        columns: [
            { data: 'idUsuario' },
            { data: 'nombreUsuario' },
            { data: 'nombreCompleto' },
            { data: 'rol' ? 'rol.nombre' : '-', render: (data, type, row) => row.rol ? row.rol.nombre : '-' },
            { data: 'estado' ? 'estado.nombre' : '-', render: (data, type, row) => row.estado ? row.estado.nombre : '-' },
            { data: null, orderable: false, render: (data) => `
                <button class="btn btn-sm btn-warning" onclick="editarUsuario(${data.idUsuario})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="eliminarUsuario(${data.idUsuario})"><i class="fas fa-trash"></i></button>
            ` }
        ],
        language: { url: '//cdn.datatables.net/plug-ins/1.13.4/i18n/es-ES.json' }
    });
}

function limpiarFormularioUsuario() {
    document.getElementById('usuarioId').value = '';
    document.getElementById('usuarioUsername').value = '';
    document.getElementById('usuarioPassword').value = '';
    document.getElementById('usuarioNombreCompleto').value = '';
    document.getElementById('usuarioEmail').value = '';
    document.getElementById('usuarioRol').value = '2';
    document.getElementById('usuarioEstado').value = '1';
}

async function editarUsuario(id) {
    const usuarios = await cargarUsuarios();
    const usuario = usuarios.find(u => u.idUsuario === id);
    if (usuario) {
        document.getElementById('usuarioId').value = usuario.idUsuario;
        document.getElementById('usuarioUsername').value = usuario.nombreUsuario;
        document.getElementById('usuarioPassword').value = '';
        document.getElementById('usuarioNombreCompleto').value = usuario.nombreCompleto;
        document.getElementById('usuarioEmail').value = usuario.email || '';
        document.getElementById('usuarioRol').value = usuario.rol?.idRol || 2;
        document.getElementById('usuarioEstado').value = usuario.estado?.idEstadoUsuario || 1;
        new bootstrap.Modal(document.getElementById('usuarioModal')).show();
    }
}

async function guardarUsuario() {
    const usuario = {
        idUsuario: document.getElementById('usuarioId').value || null,
        nombreUsuario: document.getElementById('usuarioUsername').value,
        contrasenaHash: document.getElementById('usuarioPassword').value,
        nombreCompleto: document.getElementById('usuarioNombreCompleto').value,
        email: document.getElementById('usuarioEmail').value,
        idRol: parseInt(document.getElementById('usuarioRol').value),
        idEstadoUsuario: parseInt(document.getElementById('usuarioEstado').value)
    };
    
    if (!usuario.idUsuario && !usuario.contrasenaHash) {
        alert('La contraseña es obligatoria para nuevos usuarios');
        return;
    }
    
    await guardarUsuarioAPI(usuario);
    bootstrap.Modal.getInstance(document.getElementById('usuarioModal')).hide();
    cargarListaUsuarios();
}

async function eliminarUsuario(id) {
    if (confirm('¿Está seguro de eliminar este usuario?')) {
        await eliminarUsuarioAPI(id);
        cargarListaUsuarios();
    }
}