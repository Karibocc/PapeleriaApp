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

function calcularTotalVenta(venta) {
    let subtotal = 0;
    if (venta.detalles) {
        for (let i = 0; i < venta.detalles.length; i++) {
            const d = venta.detalles[i];
            subtotal = subtotal + (d.precioUnitario * d.cantidad - (d.descuento || 0));
        }
    }
    const total = subtotal + (venta.impuesto || 0) - (venta.descuento || 0);
    return total;
}

function calcularTotales() {
    let subtotal = 0;
    for (let i = 0; i < carrito.length; i++) {
        const item = carrito[i];
        subtotal = subtotal + (item.precioVenta * item.cantidad - (item.descuento || 0));
    }
    
    const ivaPorcentaje = 0.19;
    const impuesto = subtotal * ivaPorcentaje;
    const descuentoGlobal = parseFloat(document.getElementById('descuentoGlobalInput')?.value || 0);
    let total = subtotal + impuesto - descuentoGlobal;
    
    if (total < 0) {
        total = 0;
    }
    
    const subtotalEl = document.getElementById('subtotal');
    const impuestoEl = document.getElementById('impuesto');
    const descuentoGlobalEl = document.getElementById('descuentoGlobal');
    const totalEl = document.getElementById('total');
    
    if (subtotalEl) subtotalEl.innerText = subtotal.toFixed(2);
    if (impuestoEl) impuestoEl.innerText = impuesto.toFixed(2);
    if (descuentoGlobalEl) descuentoGlobalEl.innerText = descuentoGlobal.toFixed(2);
    if (totalEl) totalEl.innerText = total.toFixed(2);
    
    const montoPagado = parseFloat(document.getElementById('montoPagado')?.value || 0);
    let cambio = montoPagado - total;
    if (cambio < 0) cambio = 0;
    const cambioEl = document.getElementById('cambio');
    if (cambioEl) cambioEl.value = cambio.toFixed(2);
    
    return { subtotal, impuesto, descuento: descuentoGlobal, total, cambio };
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
        const itemTotal = item.precioVenta * item.cantidad - (item.descuento || 0);
        const html = `<div class="cart-item">
                <div class="row align-items-center">
                    <div class="col-5">${escapeHtml(item.nombre)}</div>
                    <div class="col-3">
                        <input type="number" class="form-control form-control-sm cantidad-item" data-index="${i}" value="${item.cantidad}">
                    </div>
                    <div class="col-2">$${itemTotal.toFixed(2)}</div>
                    <div class="col-2">
                        <button class="btn btn-sm btn-danger eliminar-item" data-index="${i}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>`;
        container.innerHTML += html;
    }
    
    // Agregar event listeners a los inputs de cantidad
    document.querySelectorAll('.cantidad-item').forEach(input => {
        input.removeEventListener('change', cantidadChangeHandler);
        input.addEventListener('change', cantidadChangeHandler);
    });
    document.querySelectorAll('.eliminar-item').forEach(btn => {
        btn.removeEventListener('click', eliminarClickHandler);
        btn.addEventListener('click', eliminarClickHandler);
    });
    
    calcularTotales();
}

function cantidadChangeHandler(e) {
    const index = parseInt(e.target.dataset.index);
    let nuevaCantidad = parseInt(e.target.value);
    if (isNaN(nuevaCantidad) || nuevaCantidad <= 0) {
        eliminarDelCarrito(index);
    } else {
        carrito[index].cantidad = nuevaCantidad;
        actualizarCarrito();
    }
}

function eliminarClickHandler(e) {
    const index = parseInt(e.target.closest('.eliminar-item')?.dataset.index);
    if (!isNaN(index)) eliminarDelCarrito(index);
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

async function buscarProductoVenta() {
    const busqueda = document.getElementById('buscarProducto').value.trim();
    if (!busqueda) {
        mostrarAlerta('Ingrese un código de barras o nombre', 'warning');
        return;
    }
    
    const resultadoDiv = document.getElementById('resultadoBusqueda');
    resultadoDiv.innerHTML = '<div class="text-center">Buscando...</div>';
    
    try {
        const response = await fetch(API_BASE_URL + '/productos', { 
            method: 'GET',
            headers: getHeaders()
        });
        
        if (response.status === 401) {
            mostrarAlerta('Sesión expirada. Inicie sesión nuevamente.', 'warning');
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            setTimeout(() => window.location.href = 'login.html', 1500);
            return;
        }
        
        if (response.ok) {
            const productos = await response.json();
            const productosActivos = productos.filter(p => p.activo === true);
            
            let producto = null;
            for (let p of productosActivos) {
                if ((p.codigoBarras && p.codigoBarras === busqueda) || 
                    (p.nombre && p.nombre.toLowerCase().includes(busqueda.toLowerCase()))) {
                    producto = p;
                    break;
                }
            }
            
            if (producto && producto.stockActual > 0) {
                resultadoDiv.innerHTML = `<div class="alert alert-success">
                        <strong>${escapeHtml(producto.nombre)}</strong><br>
                        Stock: ${producto.stockActual} | Precio: $${producto.precioVenta.toFixed(2)}<br>
                        <button class="btn btn-sm btn-primary mt-2" onclick="agregarAlCarrito(${producto.idProducto}, '${escapeHtml(producto.nombre)}', ${producto.precioVenta})">
                            <i class="fas fa-cart-plus"></i> Agregar al Carrito
                        </button>
                    </div>`;
            } else if (producto && producto.stockActual <= 0) {
                resultadoDiv.innerHTML = '<div class="alert alert-warning">Producto sin stock disponible</div>';
            } else {
                resultadoDiv.innerHTML = '<div class="alert alert-danger">Producto no encontrado. Intente con otro nombre o código.</div>';
            }
        } else {
            resultadoDiv.innerHTML = '<div class="alert alert-danger">Error al cargar productos</div>';
        }
    } catch (error) {
        console.error('Error buscando producto:', error);
        resultadoDiv.innerHTML = '<div class="alert alert-danger">Error de conexión al servidor</div>';
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
    mostrarAlerta('Producto agregado al carrito', 'success');
}

async function cargarClientesSelect() {
    try {
        const response = await fetch(API_BASE_URL + '/clientes', { headers: getHeaders() });
        if (response.ok) {
            clientesLista = await response.json();
            const select = document.getElementById('clienteVenta');
            if (select) {
                select.innerHTML = '<option value="">Cliente Mostrador</option>';
                for (let c of clientesLista) {
                    select.innerHTML += `<option value="${c.idCliente}">${escapeHtml(c.nombre)}</option>`;
                }
            }
        }
    } catch (error) {
        console.error('Error cargando clientes:', error);
    }
}

async function registrarVenta() {
    if (carrito.length === 0) {
        mostrarAlerta('Agregue productos al carrito', 'warning');
        return;
    }
    
    const totales = calcularTotales();
    if (totales.total <= 0) {
        mostrarAlerta('El total de la venta debe ser mayor a 0', 'warning');
        return;
    }
    
    const montoPagado = parseFloat(document.getElementById('montoPagado')?.value || 0);
    if (montoPagado < totales.total) {
        mostrarAlerta(`El monto pagado es insuficiente. Total: $${totales.total.toFixed(2)}`, 'warning');
        return;
    }
    
    const currentUserData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    let idUsuario = 1;
    
    try {
        const usuariosResponse = await fetch(API_BASE_URL + '/usuarios', { headers: getHeaders() });
        if (usuariosResponse.ok) {
            const usuarios = await usuariosResponse.json();
            const usuarioActual = usuarios.find(u => u.nombreUsuario === currentUserData.username);
            if (usuarioActual) idUsuario = usuarioActual.idUsuario;
        }
    } catch (error) {
        console.error('Error obteniendo usuario:', error);
    }
    
    const detalles = carrito.map(item => ({
        idProducto: item.idProducto,
        cantidad: item.cantidad,
        descuento: 0
    }));
    
    const venta = {
        detalles: detalles,
        descuento: totales.descuento,
        impuesto: totales.impuesto,
        montoPagado: montoPagado,
        metodoPago: document.getElementById('metodoPago')?.value || 'efectivo',
        idCliente: document.getElementById('clienteVenta')?.value || null,
        idUsuario: idUsuario,
        observacion: document.getElementById('observacionVenta')?.value || ''
    };
    
    const btnRegistrar = document.getElementById('btnRegistrarVenta');
    const textoOriginal = btnRegistrar?.innerHTML || '';
    if (btnRegistrar) {
        btnRegistrar.disabled = true;
        btnRegistrar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registrando...';
    }
    
    try {
        const response = await fetch(API_BASE_URL + '/ventas', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(venta)
        });
        
        if (response.ok) {
            mostrarAlerta('Venta registrada exitosamente', 'success');
            
            // Limpiar carrito y resetear formulario
            carrito = [];
            actualizarCarrito(); // Esto llama a calcularTotales() internamente, que pondrá todo a cero
            
            // Resetear campos adicionales
            const descuentoGlobalInput = document.getElementById('descuentoGlobalInput');
            const montoPagadoInput = document.getElementById('montoPagado');
            const observacionInput = document.getElementById('observacionVenta');
            const clienteSelect = document.getElementById('clienteVenta');
            
            if (descuentoGlobalInput) descuentoGlobalInput.value = '0';
            if (montoPagadoInput) montoPagadoInput.value = '0';
            if (observacionInput) observacionInput.value = '';
            if (clienteSelect) clienteSelect.value = '';
            
            // Recargar lista de ventas
            cargarListaVentas();
        } else {
            let mensajeError = 'Error al registrar la venta';
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
        console.error('Error registrando venta:', error);
        mostrarAlerta('Error de conexión al servidor', 'danger');
    } finally {
        if (btnRegistrar) {
            btnRegistrar.disabled = false;
            btnRegistrar.innerHTML = textoOriginal;
        }
    }
}

async function imprimirFactura(idVenta) {
    try {
        const response = await fetch(API_BASE_URL + '/ventas/factura/' + idVenta, { headers: getHeaders() });
        if (response.ok) {
            const factura = await response.json();
            const ventana = window.open('', '_blank');
            ventana.document.write(generarHTMLFactura(factura));
            ventana.document.close();
            ventana.print();
        } else {
            mostrarAlerta('Error al obtener la factura', 'danger');
        }
    } catch (error) {
        console.error('Error:', error);
        mostrarAlerta('Error de conexión', 'danger');
    }
}

function generarHTMLFactura(factura) {
    let detallesHTML = '';
    if (factura.detalles) {
        for (let d of factura.detalles) {
            detallesHTML += `<tr>
                <td>${escapeHtml(d.nombreProducto)}</td>
                <td>${d.cantidad}</td>
                <td>$${parseFloat(d.precioUnitario).toFixed(2)}</td>
                <td>$${parseFloat(d.subtotalLinea).toFixed(2)}</td>
            </tr>`;
        }
    }
    
    return `<!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <title>Factura #${factura.idVenta}</title>
        <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .factura { max-width: 800px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
        .empresa { font-size: 24px; font-weight: bold; }
        .info { margin: 20px 0; }
        .info table { width: 100%; }
        .info td { border: none; padding: 5px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .totales { margin-top: 20px; text-align: right; }
        .totales p { margin: 5px 0; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        @media print { .no-print { display: none; } }
        </style>
        </head>
        <body>
        <div class="factura">
        <div class="header">
        <div class="empresa">Papelería App</div>
        <div>Factura de Venta</div>
        <div>N° ${factura.idVenta}</div>
        </div>
        <div class="info">
        <table><tr>
        <td style="border: none;"><strong>Fecha:</strong> ${new Date(factura.fechaEmision).toLocaleString()}</td>
        <td style="border: none;"><strong>Vendedor:</strong> ${escapeHtml(factura.nombreVendedor || '')}</td>
        </tr><tr>
        <td style="border: none;"><strong>Cliente:</strong> ${escapeHtml(factura.nombreCliente || 'Mostrador')}</td>
        <td style="border: none;"><strong>Método Pago:</strong> ${escapeHtml(factura.metodoPago || 'Efectivo')}</td>
        </tr></table>
        </div>
        <table>
        <thead><tr><th>Producto</th><th>Cantidad</th><th>Precio Unitario</th><th>Subtotal</th></tr></thead>
        <tbody>${detallesHTML}</tbody>
        </table>
        <div class="totales">
        <p><strong>Subtotal:</strong> $${parseFloat(factura.subtotal).toFixed(2)}</p>
        <p><strong>Impuesto (19%):</strong> $${parseFloat(factura.impuesto).toFixed(2)}</p>
        <p><strong>Descuento:</strong> $${parseFloat(factura.descuento).toFixed(2)}</p>
        <p><strong>Total:</strong> $${parseFloat(factura.total).toFixed(2)}</p>
        <p><strong>Pagado:</strong> $${parseFloat(factura.montoPagado).toFixed(2)}</p>
        <p><strong>Cambio:</strong> $${parseFloat(factura.cambio).toFixed(2)}</p>
        </div>
        <div class="footer">
        <p>Gracias por su compra</p>
        <p>Copyright &copy; Papelería App ${new Date().getFullYear()}</p>
        </div>
        <div class="no-print" style="text-align: center; margin-top: 20px;">
        <button onclick="window.print()">Imprimir</button>
        <button onclick="window.close()">Cerrar</button>
        </div>
        </div>
        </body>
        </html>`;
}

function enviarPorWhatsapp(idVenta) {
    const telefono = prompt('Ingrese el número de teléfono del cliente (con código de país):', '57');
    if (telefono) {
        fetch(API_BASE_URL + '/ventas/factura/' + idVenta, { headers: getHeaders() })
            .then(response => response.json())
            .then(factura => {
                let mensaje = `----- FACTURA Papelería App -----\n`;
                mensaje += `N°: ${factura.idVenta}\n`;
                mensaje += `Fecha: ${new Date(factura.fechaEmision).toLocaleString()}\n`;
                mensaje += `Cliente: ${factura.nombreCliente || 'Mostrador'}\n`;
                mensaje += `Total: $${parseFloat(factura.total).toFixed(2)}\n`;
                mensaje += `--------------------------------\n`;
                mensaje += `Gracias por su compra!\n`;
                mensaje += `Papelería App - ${new Date().getFullYear()}`;
                const urlWhatsapp = 'https://api.whatsapp.com/send?phone=' + telefono + '&text=' + encodeURIComponent(mensaje);
                window.open(urlWhatsapp, '_blank');
                mostrarAlerta('Se abrirá WhatsApp para enviar la factura', 'success');
            })
            .catch(error => { 
                console.error('Error:', error); 
                mostrarAlerta('Error al obtener la factura', 'danger');
            });
    }
}

function enviarPorEmail(idVenta) {
    const email = prompt('Ingrese el correo electrónico del cliente:', '');
    if (email && email.includes('@')) {
        fetch(API_BASE_URL + '/ventas/factura/' + idVenta, { headers: getHeaders() })
            .then(response => response.json())
            .then(factura => {
                let cuerpo = `Estimado cliente,\n\nAdjunto encontrará el detalle de su factura.\n\n`;
                cuerpo += `N° Factura: ${factura.idVenta}\n`;
                cuerpo += `Fecha: ${new Date(factura.fechaEmision).toLocaleString()}\n`;
                cuerpo += `Cliente: ${factura.nombreCliente || 'Mostrador'}\n`;
                cuerpo += `Total: $${parseFloat(factura.total).toFixed(2)}\n\n`;
                cuerpo += `Gracias por su compra.\nPapelería App`;
                const subject = `Factura Papelería App #${factura.idVenta}`;
                const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(cuerpo)}`;
                window.location.href = mailtoUrl;
                mostrarAlerta('Se abrirá su cliente de correo para enviar la factura', 'success');
            })
            .catch(error => { 
                console.error('Error:', error); 
                mostrarAlerta('Error al obtener la factura', 'danger');
            });
    } else {
        mostrarAlerta('Ingrese un correo electrónico válido', 'warning');
    }
}

async function cargarListaVentas() {
    try {
        const response = await fetch(API_BASE_URL + '/ventas', { headers: getHeaders() });
        if (response.ok) {
            const ventas = await response.json();
            if (tablaVentas) tablaVentas.destroy();
            
            tablaVentas = $('#tablaVentas').DataTable({
                data: ventas,
                columns: [
                    { data: 'idVenta' },
                    { data: 'fechaHora', render: data => new Date(data).toLocaleString() },
                    { data: null, render: (data, type, row) => row.cliente ? row.cliente.nombre : 'Mostrador' },
                    { 
                        data: null, 
                        render: data => {
                            let subtotal = 0;
                            if (data.detalles) {
                                for (let d of data.detalles) {
                                    subtotal += (d.precioUnitario * d.cantidad - (d.descuento || 0));
                                }
                            }
                            const total = subtotal + (data.impuesto || 0) - (data.descuento || 0);
                            return total.toFixed(2);
                        }
                    },
                    { data: null, render: (data, type, row) => row.estado ? row.estado.nombre : 'Completada' },
                    { 
                        data: 'idVenta',
                        render: id => `<button class="btn btn-sm btn-info me-1" onclick="imprimirFactura(${id})" title="Imprimir Factura"><i class="fas fa-print"></i></button>
                                       <button class="btn btn-sm btn-success me-1" onclick="enviarPorWhatsapp(${id})" title="Enviar por WhatsApp"><i class="fab fa-whatsapp"></i></button>
                                       <button class="btn btn-sm btn-primary" onclick="enviarPorEmail(${id})" title="Enviar por Email"><i class="fas fa-envelope"></i></button>`
                    }
                ],
                language: {
                    "decimal": "",
                    "emptyTable": "No hay datos disponibles en la tabla",
                    "info": "Mostrando _START_ a _END_ de _TOTAL_ registros",
                    "infoEmpty": "Mostrando 0 a 0 de 0 registros",
                    "infoFiltered": "(filtrado de _MAX_ registros totales)",
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
                    }
                },
                order: [[0, 'desc']]
            });
        }
    } catch (error) {
        console.error('Error cargando ventas:', error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const formVenta = document.getElementById('formVenta');
    
    const rolesPermitidos = ['ADMIN', 'admin', 'ADMINISTRADOR', 'Administrador', 'VENDEDOR', 'vendedor'];
    let tienePermiso = rolesPermitidos.includes(userData.rol);
    
    if (tienePermiso) {
        if (formVenta) formVenta.style.display = 'block';
        cargarClientesSelect();
        cargarListaVentas();
    } else {
        if (formVenta) formVenta.style.display = 'none';
    }
    
    document.getElementById('userName').innerText = userData.nombreCompleto || userData.username || 'Usuario';
    document.getElementById('userRolBadge').innerText = userData.rol || '';
    document.getElementById('userRolText').innerHTML = '<strong>Rol:</strong> ' + (userData.rol || '');
    
    document.getElementById('btnLogout').addEventListener('click', function(e) {
        e.preventDefault();
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });
    
    document.getElementById('sidebarToggle').addEventListener('click', function() {
        const sidebar = document.getElementById('sidebar');
        if (sidebar.style.width === '260px') {
            sidebar.style.width = '70px';
            document.querySelectorAll('.sidebar-modern .nav-link span').forEach(span => span.style.display = 'none');
            document.querySelectorAll('.sidebar-modern .sidebar-heading').forEach(heading => heading.style.display = 'none');
            document.querySelectorAll('.sidebar-modern .nav-link i').forEach(icon => icon.style.marginRight = '0');
        } else {
            sidebar.style.width = '260px';
            document.querySelectorAll('.sidebar-modern .nav-link span').forEach(span => span.style.display = 'inline');
            document.querySelectorAll('.sidebar-modern .sidebar-heading').forEach(heading => heading.style.display = 'block');
            document.querySelectorAll('.sidebar-modern .nav-link i').forEach(icon => icon.style.marginRight = '12px');
        }
    });
    
    const btnBuscar = document.getElementById('btnBuscarProducto');
    if (btnBuscar) {
        btnBuscar.removeEventListener('click', buscarProductoVenta);
        btnBuscar.addEventListener('click', buscarProductoVenta);
    }
    
    const btnRegistrar = document.getElementById('btnRegistrarVenta');
    if (btnRegistrar) {
        btnRegistrar.removeEventListener('click', registrarVenta);
        btnRegistrar.addEventListener('click', registrarVenta);
    }
    
    const montoPagadoInput = document.getElementById('montoPagado');
    if (montoPagadoInput) {
        montoPagadoInput.addEventListener('input', () => calcularTotales());
    }
    
    const descuentoInput = document.getElementById('descuentoGlobalInput');
    if (descuentoInput) {
        descuentoInput.addEventListener('input', () => calcularTotales());
    }
    
    // Inicializar carrito vacío y totales en cero
    actualizarCarrito();
});

window.actualizarCantidad = actualizarCantidad;
window.eliminarDelCarrito = eliminarDelCarrito;
window.agregarAlCarrito = agregarAlCarrito;
window.calcularTotales = calcularTotales;
window.imprimirFactura = imprimirFactura;
window.enviarPorWhatsapp = enviarPorWhatsapp;
window.enviarPorEmail = enviarPorEmail;