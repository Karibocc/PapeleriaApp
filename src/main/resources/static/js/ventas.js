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
    return subtotal + (venta.impuesto || 0) - (venta.descuento || 0);
}

function calcularTotales() {
    let subtotal = 0;
    for (let i = 0; i < carrito.length; i++) {
        const item = carrito[i];
        subtotal = subtotal + (item.precioVenta * item.cantidad - (item.descuento || 0));
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
    
    const montoPagado = parseFloat(document.getElementById('montoPagado').value || 0);
    let cambio = montoPagado - total;
    if (cambio < 0) {
        cambio = 0;
    }
    document.getElementById('cambio').value = cambio.toFixed(2);
    
    return {
        subtotal: subtotal,
        impuesto: impuesto,
        descuento: descuentoGlobal,
        total: total,
        cambio: cambio
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
                    '<div class="col-2">$' + (item.precioVenta * item.cantidad).toFixed(2) + '</div>' +
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

async function buscarProductoVenta() {
    const busqueda = document.getElementById('buscarProducto').value;
    console.log('Buscando producto:', busqueda);
    
    if (!busqueda) {
        mostrarAlerta('Ingrese un código de barras o nombre', 'warning');
        return;
    }
    
    try {
        console.log('Obteniendo token...');
        const token = getAuthToken();
        console.log('Token existe?', token ? 'Si' : 'No');
        
        console.log('Fetch a:', API_BASE_URL + '/productos');
        const response = await fetch(API_BASE_URL + '/productos', { 
            method: 'GET',
            headers: getHeaders()
        });
        
        console.log('Respuesta status:', response.status);
        
        if (response.status === 401) {
            mostrarAlerta('Sesión expirada. Inicie sesión nuevamente.', 'warning');
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            setTimeout(function() {
                window.location.href = 'login.html';
            }, 1500);
            return;
        }
        
        if (response.ok) {
            const productos = await response.json();
            console.log('Productos recibidos:', productos.length);
            
            const productosActivos = [];
            for (let i = 0; i < productos.length; i++) {
                if (productos[i].activo === true) {
                    productosActivos.push(productos[i]);
                }
            }
            console.log('Productos activos:', productosActivos.length);
            
            let producto = null;
            for (let i = 0; i < productosActivos.length; i++) {
                const p = productosActivos[i];
                if ((p.codigoBarras && p.codigoBarras === busqueda) || 
                    (p.nombre && p.nombre.toLowerCase().includes(busqueda.toLowerCase()))) {
                    producto = p;
                    break;
                }
            }
            
            console.log('Producto encontrado:', producto ? producto.nombre : 'No encontrado');
            
            const resultadoDiv = document.getElementById('resultadoBusqueda');
            if (producto && producto.stockActual > 0) {
                resultadoDiv.innerHTML = '<div class="alert alert-success">' +
                        '<strong>' + escapeHtml(producto.nombre) + '</strong><br>' +
                        'Stock: ' + producto.stockActual + ' | Precio: $' + producto.precioVenta.toFixed(2) + '<br>' +
                        '<button class="btn btn-sm btn-primary mt-2" onclick="agregarAlCarrito(' + producto.idProducto + ', \'' + escapeHtml(producto.nombre) + '\', ' + producto.precioVenta + ')">' +
                            '<i class="fas fa-cart-plus"></i> Agregar al Carrito' +
                        '</button>' +
                    '</div>';
                console.log('Producto mostrado en el DOM');
            } else if (producto && producto.stockActual <= 0) {
                resultadoDiv.innerHTML = '<div class="alert alert-warning">Producto sin stock disponible</div>';
            } else {
                resultadoDiv.innerHTML = '<div class="alert alert-danger">Producto no encontrado. Intente con otro nombre o código.</div>';
            }
        } else {
            mostrarAlerta('Error al cargar productos. Status: ' + response.status, 'danger');
        }
    } catch (error) {
        console.error('Error buscando producto:', error);
        mostrarAlerta('Error de conexión al servidor', 'danger');
    }
}

function agregarAlCarrito(id, nombre, precio) {
    let existente = null;
    for (let i = 0; i < carrito.length; i++) {
        if (carrito[i].idProducto === id) {
            existente = carrito[i];
            break;
        }
    }
    
    if (existente) {
        existente.cantidad = existente.cantidad + 1;
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
                if (clientesLista && clientesLista.length > 0) {
                    for (let i = 0; i < clientesLista.length; i++) {
                        const c = clientesLista[i];
                        select.innerHTML = select.innerHTML + '<option value="' + c.idCliente + '">' + escapeHtml(c.nombre) + '</option>';
                    }
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
    
    const montoPagado = parseFloat(document.getElementById('montoPagado').value || 0);
    
    if (montoPagado < totales.total) {
        mostrarAlerta('El monto pagado es insuficiente. Total: $' + totales.total.toFixed(2), 'warning');
        return;
    }
    
    const currentUserData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    let idUsuario = null;
    
    try {
        const usuariosResponse = await fetch(API_BASE_URL + '/usuarios', { headers: getHeaders() });
        if (usuariosResponse.ok) {
            const usuarios = await usuariosResponse.json();
            let usuarioActual = null;
            for (let i = 0; i < usuarios.length; i++) {
                if (usuarios[i].nombreUsuario === currentUserData.username) {
                    usuarioActual = usuarios[i];
                    break;
                }
            }
            if (usuarioActual) {
                idUsuario = usuarioActual.idUsuario;
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
            descuento: 0
        });
    }
    
    const venta = {
        detalles: detalles,
        descuento: totales.descuento,
        impuesto: totales.impuesto,
        montoPagado: montoPagado,
        metodoPago: document.getElementById('metodoPago').value || 'efectivo',
        idCliente: document.getElementById('clienteVenta').value || null,
        idUsuario: idUsuario,
        observacion: document.getElementById('observacionVenta').value || ''
    };
    
    const btnRegistrar = document.getElementById('btnRegistrarVenta');
    const textoOriginal = btnRegistrar ? btnRegistrar.innerHTML : '';
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
            carrito = [];
            actualizarCarrito();
            document.getElementById('descuentoGlobalInput').value = '0';
            document.getElementById('montoPagado').value = '0';
            document.getElementById('observacionVenta').value = '';
            document.getElementById('cambio').value = '';
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
        for (let i = 0; i < factura.detalles.length; i++) {
            const d = factura.detalles[i];
            detallesHTML = detallesHTML + '<td>' +
                '</td>' + escapeHtml(d.nombreProducto) + '</td>' +
                '<td>' + d.cantidad + '</td>' +
                '<td>$' + parseFloat(d.precioUnitario).toFixed(2) + '</td>' +
                '<td>$' + parseFloat(d.subtotalLinea).toFixed(2) + '</td>' +
                '</tr>';
        }
    }
    
    return '<!DOCTYPE html>' +
        '<html>' +
        '<head>' +
        '<meta charset="UTF-8">' +
        '<title>Factura #' + factura.idVenta + '</title>' +
        '<style>' +
        'body { font-family: Arial, sans-serif; margin: 20px; }' +
        '.factura { max-width: 800px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px; }' +
        '.header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }' +
        '.empresa { font-size: 24px; font-weight: bold; }' +
        '.info { margin: 20px 0; }' +
        '.info table { width: 100%; }' +
        '.info td { border: none; padding: 5px; }' +
        'table { width: 100%; border-collapse: collapse; }' +
        'th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }' +
        'th { background-color: #f2f2f2; }' +
        '.totales { margin-top: 20px; text-align: right; }' +
        '.totales p { margin: 5px 0; }' +
        '.footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }' +
        '@media print { .no-print { display: none; } }' +
        '</style>' +
        '</head>' +
        '<body>' +
        '<div class="factura">' +
        '<div class="header">' +
        '<div class="empresa">Papelería App</div>' +
        '<div>Factura de Venta</div>' +
        '<div>N° ' + factura.idVenta + '</div>' +
        '</div>' +
        '<div class="info">' +
        '<tr>' +
        '<td><td style="border: none;"><strong>Fecha:</strong> ' + new Date(factura.fechaEmision).toLocaleString() + '</td>' +
        '<td style="border: none;"><strong>Vendedor:</strong> ' + escapeHtml(factura.nombreVendedor || '') + '</td>' +
        '</tr>' +
        '<tr><td style="border: none;"><strong>Cliente:</strong> ' + escapeHtml(factura.nombreCliente || 'Mostrador') + '</td>' +
        '<td style="border: none;"><strong>Método Pago:</strong> ' + escapeHtml(factura.metodoPago || 'Efectivo') + '</td>' +
        '</tr>' +
        '</div>' +
        '<table>' +
        '<thead><tr><th>Producto</th><th>Cantidad</th><th>Precio Unitario</th><th>Subtotal</th></tr></thead>' +
        '<tbody>' + detallesHTML + '</tbody>' +
        '</table>' +
        '<div class="totales">' +
        '<p><strong>Subtotal:</strong> $' + parseFloat(factura.subtotal).toFixed(2) + '</p>' +
        '<p><strong>Impuesto (19%):</strong> $' + parseFloat(factura.impuesto).toFixed(2) + '</p>' +
        '<p><strong>Descuento:</strong> $' + parseFloat(factura.descuento).toFixed(2) + '</p>' +
        '<p><strong>Total:</strong> $' + parseFloat(factura.total).toFixed(2) + '</p>' +
        '<p><strong>Pagado:</strong> $' + parseFloat(factura.montoPagado).toFixed(2) + '</p>' +
        '<p><strong>Cambio:</strong> $' + parseFloat(factura.cambio).toFixed(2) + '</p>' +
        '</div>' +
        '<div class="footer">' +
        '<p>Gracias por su compra</p>' +
        '<p>Copyright &copy; Papelería App ' + new Date().getFullYear() + '</p>' +
        '</div>' +
        '<div class="no-print" style="text-align: center; margin-top: 20px;">' +
        '<button onclick="window.print()">Imprimir</button> ' +
        '<button onclick="window.close()">Cerrar</button>' +
        '</div>' +
        '</div>' +
        '</body>' +
        '</html>';
}

function enviarPorWhatsapp(idVenta) {
    const telefono = prompt('Ingrese el número de teléfono del cliente (con código de país):', '57');
    if (telefono) {
        const url = API_BASE_URL + '/ventas/factura/' + idVenta;
        fetch(url, { headers: getHeaders() })
            .then(function(response) { return response.json(); })
            .then(function(factura) {
                let mensaje = '----- FACTURA Papelería App -----\n';
                mensaje = mensaje + 'N°: ' + factura.idVenta + '\n';
                mensaje = mensaje + 'Fecha: ' + new Date(factura.fechaEmision).toLocaleString() + '\n';
                mensaje = mensaje + 'Cliente: ' + (factura.nombreCliente || 'Mostrador') + '\n';
                mensaje = mensaje + '--------------------------------\n';
                if (factura.detalles) {
                    for (let i = 0; i < factura.detalles.length; i++) {
                        const d = factura.detalles[i];
                        mensaje = mensaje + d.nombreProducto + ' x' + d.cantidad + ' = $' + parseFloat(d.subtotalLinea).toFixed(2) + '\n';
                    }
                }
                mensaje = mensaje + '--------------------------------\n';
                mensaje = mensaje + 'Subtotal: $' + parseFloat(factura.subtotal).toFixed(2) + '\n';
                mensaje = mensaje + 'Impuesto: $' + parseFloat(factura.impuesto).toFixed(2) + '\n';
                mensaje = mensaje + 'Total: $' + parseFloat(factura.total).toFixed(2) + '\n';
                mensaje = mensaje + 'Gracias por su compra!';
                
                const urlWhatsapp = 'https://wa.me/' + telefono + '?text=' + encodeURIComponent(mensaje);
                window.open(urlWhatsapp, '_blank');
            })
            .catch(function(error) { console.error('Error:', error); });
    }
}

function enviarPorEmail(idVenta) {
    const email = prompt('Ingrese el correo electrónico del cliente:', '');
    if (email && email.includes('@')) {
        const url = API_BASE_URL + '/ventas/factura/' + idVenta;
        fetch(url, { headers: getHeaders() })
            .then(function(response) { return response.json(); })
            .then(function(factura) {
                let htmlContent = generarHTMLFactura(factura);
                const subject = 'Factura Papelería App #' + factura.idVenta;
                const mailtoUrl = 'mailto:' + email + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(htmlContent);
                window.location.href = mailtoUrl;
                mostrarAlerta('Se abrirá su cliente de correo para enviar la factura', 'success');
            })
            .catch(function(error) { console.error('Error:', error); });
    } else {
        mostrarAlerta('Ingrese un correo válido', 'warning');
    }
}

async function cargarListaVentas() {
    try {
        const response = await fetch(API_BASE_URL + '/ventas', { headers: getHeaders() });
        if (response.ok) {
            const ventas = await response.json();
            
            if (tablaVentas) {
                tablaVentas.destroy();
            }
            
            tablaVentas = $('#tablaVentas').DataTable({
                data: ventas,
                columns: [
                    { data: 'idVenta' },
                    { data: 'fechaHora', render: function(data) { return new Date(data).toLocaleString(); } },
                    { data: null, render: function(data, type, row) { return row.cliente ? row.cliente.nombre : 'Mostrador'; } },
                    { data: null, render: function(data) { return calcularTotalVenta(data).toFixed(2); } },
                    { data: null, render: function(data, type, row) { return row.estado ? row.estado.nombre : 'Completada'; } },
                    { 
                        data: 'idVenta',
                        render: function(id) {
                            return '<button class="btn btn-sm btn-info me-1" onclick="imprimirFactura(' + id + ')" title="Imprimir Factura">' +
                                       '<i class="fas fa-print"></i>' +
                                   '</button>' +
                                   '<button class="btn btn-sm btn-success me-1" onclick="enviarPorWhatsapp(' + id + ')" title="Enviar por WhatsApp">' +
                                       '<i class="fab fa-whatsapp"></i>' +
                                   '</button>' +
                                   '<button class="btn btn-sm btn-primary" onclick="enviarPorEmail(' + id + ')" title="Enviar por Email">' +
                                       '<i class="fas fa-envelope"></i>' +
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
        }
    } catch (error) {
        console.error('Error cargando ventas:', error);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const userData = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const formVenta = document.getElementById('formVenta');
    
    console.log('Usuario logueado en ventas:', userData);
    
    const rolesPermitidos = ['ADMIN', 'admin', 'ADMINISTRADOR', 'Administrador', 'VENDEDOR', 'vendedor'];
    let tienePermiso = false;
    for (let i = 0; i < rolesPermitidos.length; i++) {
        if (userData.rol === rolesPermitidos[i]) {
            tienePermiso = true;
            break;
        }
    }
    
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
            const spans = document.querySelectorAll('.sidebar-modern .nav-link span');
            for (let i = 0; i < spans.length; i++) {
                if (spans[i]) spans[i].style.display = 'none';
            }
            const headings = document.querySelectorAll('.sidebar-modern .sidebar-heading');
            for (let i = 0; i < headings.length; i++) {
                if (headings[i]) headings[i].style.display = 'none';
            }
            const icons = document.querySelectorAll('.sidebar-modern .nav-link i');
            for (let i = 0; i < icons.length; i++) {
                if (icons[i]) icons[i].style.marginRight = '0';
            }
        } else {
            sidebar.style.width = '260px';
            const spans = document.querySelectorAll('.sidebar-modern .nav-link span');
            for (let i = 0; i < spans.length; i++) {
                if (spans[i]) spans[i].style.display = 'inline';
            }
            const headings = document.querySelectorAll('.sidebar-modern .sidebar-heading');
            for (let i = 0; i < headings.length; i++) {
                if (headings[i]) headings[i].style.display = 'block';
            }
            const icons = document.querySelectorAll('.sidebar-modern .nav-link i');
            for (let i = 0; i < icons.length; i++) {
                if (icons[i]) icons[i].style.marginRight = '12px';
            }
        }
    });
    
    const btnBuscar = document.getElementById('btnBuscarProducto');
    if (btnBuscar) {
        btnBuscar.removeEventListener('click', buscarProductoVenta);
        btnBuscar.addEventListener('click', buscarProductoVenta);
        console.log('Evento de búsqueda asignado');
    }
    
    const btnRegistrar = document.getElementById('btnRegistrarVenta');
    if (btnRegistrar) {
        btnRegistrar.addEventListener('click', registrarVenta);
    }
    
    const montoPagadoInput = document.getElementById('montoPagado');
    if (montoPagadoInput) {
        montoPagadoInput.addEventListener('input', function() {
            calcularTotales();
        });
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
window.agregarAlCarrito = agregarAlCarrito;
window.calcularTotales = calcularTotales;
window.imprimirFactura = imprimirFactura;
window.enviarPorWhatsapp = enviarPorWhatsapp;
window.enviarPorEmail = enviarPorEmail;