// ============================================
// role-permissions.js - Control de permisos por rol
// Papelería App
// ============================================

// Función para mostrar/ocultar elementos de forma segura
function setElementVisibility(elementId, visible, displayStyle = 'block') {
    const element = document.getElementById(elementId);
    if (element) {
        element.style.display = visible ? displayStyle : 'none';
    }
}

// Función para mostrar/ocultar columnas de tabla
function setColumnVisibility(columnId, visible) {
    const column = document.getElementById(columnId);
    if (column) {
        column.style.display = visible ? 'table-cell' : 'none';
    }
}

// Función para mostrar/ocultar elementos del menú
function setMenuVisibility(menuId, visible) {
    const menu = document.getElementById(menuId);
    if (menu) {
        menu.style.display = visible ? 'block' : 'none';
    }
}

// Control de permisos basado en roles
function aplicarPermisosPorRol() {
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) {
        // No redirigir inmediatamente, solo si es una página que requiere autenticación
        const publicPages = ['login.html', 'register.html', 'forgot-password.html', 'reset-password.html'];
        const currentPage = window.location.pathname.split('/').pop();
        
        if (!publicPages.includes(currentPage)) {
            window.location.href = 'login.html';
        }
        return;
    }
    
    let currentUser;
    try {
        currentUser = JSON.parse(currentUserStr);
    } catch (error) {
        console.error('Error parsing user data:', error);
        window.location.href = 'login.html';
        return;
    }
    
    const rol = currentUser.rol || '';
    
    console.log('Permisos aplicados - Usuario:', currentUser.username, 'Rol:', rol);
    
    // ============================================
    // Configurar botones de acción según el rol
    // ============================================
    
    if (rol === 'ADMIN') {
        // Admin: acceso total
        setElementVisibility('btnNuevoProducto', true);
        setElementVisibility('btnNuevoCliente', true);
        setElementVisibility('btnNuevoProveedor', true);
        setElementVisibility('formVenta', true, 'block');
        setElementVisibility('formCompra', true, 'block');
        
        // Mostrar columnas de acciones
        setColumnVisibility('thAcciones', true);
        setColumnVisibility('thAccionesClientes', true);
        setColumnVisibility('thAccionesProveedores', true);
    } 
    else if (rol === 'VENDEDOR') {
        // Vendedor: solo puede registrar ventas y ver clientes
        setElementVisibility('btnNuevoProducto', false);
        setElementVisibility('btnNuevoCliente', false);
        setElementVisibility('btnNuevoProveedor', false);
        setElementVisibility('formVenta', true, 'block');
        setElementVisibility('formCompra', false);
        
        // Ocultar columnas de acciones (solo lectura)
        setColumnVisibility('thAcciones', false);
        setColumnVisibility('thAccionesClientes', false);
        setColumnVisibility('thAccionesProveedores', false);
        
        // Deshabilitar botones de edición/eliminación en tablas (alternativa)
        document.querySelectorAll('.btn-editar, .btn-eliminar').forEach(btn => {
            btn.style.display = 'none';
        });
    } 
    else if (rol === 'BODEGA') {
        // Bodega: puede gestionar productos y compras
        setElementVisibility('btnNuevoProducto', true);
        setElementVisibility('btnNuevoCliente', false);
        setElementVisibility('btnNuevoProveedor', false);
        setElementVisibility('formVenta', false);
        setElementVisibility('formCompra', true, 'block');
        
        // Mostrar acciones solo para productos
        setColumnVisibility('thAcciones', true);
        setColumnVisibility('thAccionesClientes', false);
        setColumnVisibility('thAccionesProveedores', false);
    }
    else {
        // Rol desconocido, redirigir a login
        console.warn('Rol desconocido:', rol);
        window.location.href = 'login.html';
        return;
    }
    
    // Aplicar permisos adicionales a las tablas (si existen)
    aplicarPermisosATablas(rol);
}

// Función para aplicar permisos específicos a las tablas
function aplicarPermisosATablas(rol) {
    // Para la tabla de productos - ocultar botones de acción para no autorizados
    if (rol === 'VENDEDOR') {
        // Ocultar botones de edición/eliminación después de que DataTable cargue
        setTimeout(() => {
            document.querySelectorAll('#tablaProductos .btn-warning, #tablaProductos .btn-danger').forEach(btn => {
                btn.style.display = 'none';
            });
            document.querySelectorAll('#tablaClientes .btn-warning, #tablaClientes .btn-danger').forEach(btn => {
                btn.style.display = 'none';
            });
        }, 500);
    }
    
    if (rol === 'BODEGA') {
        setTimeout(() => {
            document.querySelectorAll('#tablaClientes .btn-warning, #tablaClientes .btn-danger').forEach(btn => {
                btn.style.display = 'none';
            });
            document.querySelectorAll('#tablaProveedores .btn-warning, #tablaProveedores .btn-danger').forEach(btn => {
                btn.style.display = 'none';
            });
        }, 500);
    }
}

// Función para ocultar menús según el rol
function ajustarMenuPorRol() {
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) return;
    
    let currentUser;
    try {
        currentUser = JSON.parse(currentUserStr);
    } catch (error) {
        console.error('Error parsing user data:', error);
        return;
    }
    
    const rol = currentUser.rol || '';
    
    // IDs de los elementos del menú (ajusta según tu HTML)
    const menus = {
        menuUsuarios: 'menuUsuarios',
        menuProveedores: 'menuProveedores',
        menuCompras: 'menuCompras',
        menuConfiguracion: 'menuConfiguracion',
        menuReportes: 'menuReportes',
        menuVentas: 'menuVentas'
    };
    
    // Configurar visibilidad según el rol
    if (rol === 'ADMIN') {
        // Admin ve todos los menús
        setMenuVisibility(menus.menuUsuarios, true);
        setMenuVisibility(menus.menuProveedores, true);
        setMenuVisibility(menus.menuCompras, true);
        setMenuVisibility(menus.menuConfiguracion, true);
        setMenuVisibility(menus.menuReportes, true);
        setMenuVisibility(menus.menuVentas, true);
    } 
    else if (rol === 'VENDEDOR') {
        // Vendedor no ve Usuarios, Proveedores, Compras, Configuración
        setMenuVisibility(menus.menuUsuarios, false);
        setMenuVisibility(menus.menuProveedores, false);
        setMenuVisibility(menus.menuCompras, false);
        setMenuVisibility(menus.menuConfiguracion, false);
        setMenuVisibility(menus.menuReportes, true);
        setMenuVisibility(menus.menuVentas, true);
    } 
    else if (rol === 'BODEGA') {
        // Bodega no ve Usuarios, Proveedores, Configuración, Ventas
        setMenuVisibility(menus.menuUsuarios, false);
        setMenuVisibility(menus.menuProveedores, false);
        setMenuVisibility(menus.menuCompras, true);
        setMenuVisibility(menus.menuConfiguracion, false);
        setMenuVisibility(menus.menuReportes, false);
        setMenuVisibility(menus.menuVentas, false);
    }
}

// Función para verificar si el usuario tiene acceso a una página específica
function tieneAccesoAPagina(pagina, rol) {
    const paginasAdmin = ['usuarios.html', 'configuracion.html', 'proveedores.html'];
    const paginasVendedor = ['ventas.html', 'clientes.html', 'productos.html', 'reportes.html', 'index.html'];
    const paginasBodega = ['compras.html', 'productos.html', 'index.html'];
    
    if (rol === 'ADMIN') return true;
    if (rol === 'VENDEDOR') return paginasVendedor.includes(pagina);
    if (rol === 'BODEGA') return paginasBodega.includes(pagina);
    
    return false;
}

// Función para redirigir si no tiene acceso a la página actual
function verificarAccesoPagina() {
    const currentUserStr = localStorage.getItem('currentUser');
    if (!currentUserStr) return;
    
    let currentUser;
    try {
        currentUser = JSON.parse(currentUserStr);
    } catch (error) {
        return;
    }
    
    const rol = currentUser.rol || '';
    const currentPage = window.location.pathname.split('/').pop();
    
    if (!tieneAccesoAPagina(currentPage, rol)) {
        console.warn('Acceso denegado a:', currentPage, 'para rol:', rol);
        window.location.href = 'index.html';
    }
}

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // Verificar acceso a la página actual
    verificarAccesoPagina();
    
    // Aplicar permisos visuales
    aplicarPermisosPorRol();
    ajustarMenuPorRol();
});

// También aplicar permisos cuando se carga contenido dinámico (como DataTables)
document.addEventListener('DOMContentLoaded', function() {
    // Re-aplicar permisos después de que DataTables termine de cargar
    setTimeout(() => {
        aplicarPermisosPorRol();
    }, 1000);
});