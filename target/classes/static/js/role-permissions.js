// Control de permisos basado en roles
function aplicarPermisosPorRol() {
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) {
        window.location.href = 'login.html';
        return;
    }
    
    const currentUser = JSON.parse(currentUserStr);
    const rol = currentUser.rol || '';
    
    console.log('Usuario actual:', currentUser.username, 'Rol:', rol);
    
    // Configurar visibilidad de botones según el rol
    if (rol === 'ADMIN') {
        // Admin: puede ver y usar todos los botones de creación/edición/eliminación
        if (document.getElementById('btnNuevoProducto')) {
            document.getElementById('btnNuevoProducto').style.display = 'block';
        }
        if (document.getElementById('btnNuevoCliente')) {
            document.getElementById('btnNuevoCliente').style.display = 'block';
        }
        if (document.getElementById('btnNuevoProveedor')) {
            document.getElementById('btnNuevoProveedor').style.display = 'block';
        }
        if (document.getElementById('formVenta')) {
            document.getElementById('formVenta').style.display = 'block';
        }
        if (document.getElementById('formCompra')) {
            document.getElementById('formCompra').style.display = 'block';
        }
        // Mostrar columna de acciones en tablas
        if (document.getElementById('thAcciones')) {
            document.getElementById('thAcciones').style.display = 'table-cell';
        }
        if (document.getElementById('thAccionesClientes')) {
            document.getElementById('thAccionesClientes').style.display = 'table-cell';
        }
        if (document.getElementById('thAccionesProveedores')) {
            document.getElementById('thAccionesProveedores').style.display = 'table-cell';
        }
    } 
    else if (rol === 'VENDEDOR') {
        // Vendedor: puede registrar ventas pero no editar/eliminar productos
        if (document.getElementById('btnNuevoProducto')) {
            document.getElementById('btnNuevoProducto').style.display = 'none';
        }
        if (document.getElementById('btnNuevoCliente')) {
            document.getElementById('btnNuevoCliente').style.display = 'none';
        }
        if (document.getElementById('btnNuevoProveedor')) {
            document.getElementById('btnNuevoProveedor').style.display = 'none';
        }
        if (document.getElementById('formVenta')) {
            document.getElementById('formVenta').style.display = 'block';
        }
        if (document.getElementById('formCompra')) {
            document.getElementById('formCompra').style.display = 'none';
        }
        // Ocultar columna de acciones en tablas (solo lectura)
        if (document.getElementById('thAcciones')) {
            document.getElementById('thAcciones').style.display = 'none';
        }
        if (document.getElementById('thAccionesClientes')) {
            document.getElementById('thAccionesClientes').style.display = 'none';
        }
        if (document.getElementById('thAccionesProveedores')) {
            document.getElementById('thAccionesProveedores').style.display = 'none';
        }
    } 
    else if (rol === 'BODEGA') {
        // Bodega: puede registrar compras y editar stock
        if (document.getElementById('btnNuevoProducto')) {
            document.getElementById('btnNuevoProducto').style.display = 'block';
        }
        if (document.getElementById('btnNuevoCliente')) {
            document.getElementById('btnNuevoCliente').style.display = 'none';
        }
        if (document.getElementById('btnNuevoProveedor')) {
            document.getElementById('btnNuevoProveedor').style.display = 'none';
        }
        if (document.getElementById('formVenta')) {
            document.getElementById('formVenta').style.display = 'none';
        }
        if (document.getElementById('formCompra')) {
            document.getElementById('formCompra').style.display = 'block';
        }
        // Mostrar columna de acciones solo para productos
        if (document.getElementById('thAcciones')) {
            document.getElementById('thAcciones').style.display = 'table-cell';
        }
        if (document.getElementById('thAccionesClientes')) {
            document.getElementById('thAccionesClientes').style.display = 'none';
        }
        if (document.getElementById('thAccionesProveedores')) {
            document.getElementById('thAccionesProveedores').style.display = 'none';
        }
    }
    else {
        // Sin rol válido, redirigir a login
        window.location.href = 'login.html';
    }
}

// Función para ocultar menús según el rol
function ajustarMenuPorRol() {
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) return;
    
    const currentUser = JSON.parse(currentUserStr);
    const rol = currentUser.rol || '';
    
    // Ocultar menús según el rol
    if (rol === 'VENDEDOR') {
        // Vendedor no ve Usuarios, Proveedores, Compras, Configuración
        if (document.getElementById('menuUsuarios')) {
            document.getElementById('menuUsuarios').style.display = 'none';
        }
        if (document.getElementById('menuProveedores')) {
            document.getElementById('menuProveedores').style.display = 'none';
        }
        if (document.getElementById('menuCompras')) {
            document.getElementById('menuCompras').style.display = 'none';
        }
        if (document.getElementById('menuConfiguracion')) {
            document.getElementById('menuConfiguracion').style.display = 'none';
        }
    } 
    else if (rol === 'BODEGA') {
        // Bodega no ve Usuarios, Proveedores, Configuración, Reportes
        if (document.getElementById('menuUsuarios')) {
            document.getElementById('menuUsuarios').style.display = 'none';
        }
        if (document.getElementById('menuProveedores')) {
            document.getElementById('menuProveedores').style.display = 'none';
        }
        if (document.getElementById('menuConfiguracion')) {
            document.getElementById('menuConfiguracion').style.display = 'none';
        }
    }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    aplicarPermisosPorRol();
    ajustarMenuPorRol();
});