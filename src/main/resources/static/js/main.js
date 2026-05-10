// ============================================
// main.js - Orquestador principal
// Papelería App
// ============================================

// Variable global del usuario actual
let currentUser = null;

// ============================================
// Funciones de autenticación y verificación
// ============================================

function checkAuth() {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('currentUser');
    
    if (!token || !userStr) {
        window.location.href = 'login.html';
        return false;
    }
    
    try {
        currentUser = JSON.parse(userStr);
        return true;
    } catch (error) {
        console.error('Error parsing user data:', error);
        window.location.href = 'login.html';
        return false;
    }
}

function mostrarInfoUsuario() {
    const userNameElement = document.getElementById('userName');
    const userRolElement = document.getElementById('userRol');
    const userRolBadgeElement = document.getElementById('userRolBadge');
    const userRolTextElement = document.getElementById('userRolText');
    
    if (currentUser) {
        if (userNameElement) {
            userNameElement.innerText = currentUser.nombreCompleto || currentUser.username;
        }
        if (userRolElement) {
            userRolElement.innerText = currentUser.rol || '';
        }
        if (userRolBadgeElement) {
            userRolBadgeElement.innerText = currentUser.rol || '';
        }
        if (userRolTextElement) {
            userRolTextElement.innerHTML = `<strong>Rol:</strong> ${currentUser.rol || ''}`;
        }
    }
}

function cerrarSesionGlobal() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// ============================================
// Configuración de sidebar
// ============================================

function configurarSidebar() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            document.body.classList.toggle('sb-sidenav-toggled');
        });
    }
}

function configurarSidebarModerno() {
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
        sidebarToggle.addEventListener('click', function() {
            const sidebar = document.getElementById('sidebar');
            if (sidebar) {
                if (sidebar.style.width === '260px') {
                    sidebar.style.width = '70px';
                    document.querySelectorAll('.sidebar-modern .nav-link span').forEach(span => {
                        if (span) span.style.display = 'none';
                    });
                    document.querySelectorAll('.sidebar-modern .sidebar-heading').forEach(heading => {
                        if (heading) heading.style.display = 'none';
                    });
                    document.querySelectorAll('.sidebar-modern .nav-link i').forEach(icon => {
                        if (icon) icon.style.marginRight = '0';
                    });
                } else {
                    sidebar.style.width = '260px';
                    document.querySelectorAll('.sidebar-modern .nav-link span').forEach(span => {
                        if (span) span.style.display = 'inline';
                    });
                    document.querySelectorAll('.sidebar-modern .sidebar-heading').forEach(heading => {
                        if (heading) heading.style.display = 'block';
                    });
                    document.querySelectorAll('.sidebar-modern .nav-link i').forEach(icon => {
                        if (icon) icon.style.marginRight = '12px';
                    });
                }
            } else {
                document.body.classList.toggle('sb-sidenav-toggled');
            }
        });
    }
}

// ============================================
// Configuración del botón de logout
// ============================================

function configurarLogout() {
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', function(e) {
            e.preventDefault();
            cerrarSesionGlobal();
        });
    }
}

// ============================================
// Carga de scripts según la página actual
// ============================================

function cargarScriptsPorPagina() {
    const page = window.location.pathname.split('/').pop();
    
    // Dashboard
    if (page === 'index.html' && typeof cargarDashboard === 'function') {
        cargarDashboard();
    }
    // Productos
    else if (page === 'productos.html') {
        if (typeof cargarListaProductos === 'function') cargarListaProductos();
        if (typeof cargarCategoriasSelect === 'function') cargarCategoriasSelect();
    }
    // Clientes
    else if (page === 'clientes.html') {
        if (typeof cargarListaClientes === 'function') cargarListaClientes();
    }
    // Proveedores
    else if (page === 'proveedores.html') {
        if (typeof cargarListaProveedores === 'function') cargarListaProveedores();
    }
    // Ventas
    else if (page === 'ventas.html') {
        if (typeof cargarListaVentas === 'function') cargarListaVentas();
        if (typeof cargarClientesSelect === 'function') cargarClientesSelect();
        if (currentUser && (currentUser.rol === 'ADMIN' || currentUser.rol === 'VENDEDOR')) {
            const formVenta = document.getElementById('formVenta');
            if (formVenta) formVenta.style.display = 'block';
        }
    }
    // Compras
    else if (page === 'compras.html') {
        if (typeof cargarListaCompras === 'function') cargarListaCompras();
        if (typeof cargarProveedoresSelect === 'function') cargarProveedoresSelect();
        if (currentUser && (currentUser.rol === 'ADMIN' || currentUser.rol === 'BODEGA')) {
            const formCompra = document.getElementById('formCompra');
            if (formCompra) formCompra.style.display = 'block';
        }
    }
    // Reportes
    else if (page === 'reportes.html') {
        if (typeof cargarTopProductos === 'function') cargarTopProductos();
        if (typeof cargarUtilidades === 'function') cargarUtilidades();
        if (typeof cargarGraficoVentas === 'function') cargarGraficoVentas();
    }
    // Configuración
    else if (page === 'configuracion.html') {
        if (typeof cargarConfiguracionesForm === 'function') cargarConfiguracionesForm();
        const configForm = document.getElementById('configForm');
        if (configForm && typeof guardarConfiguraciones === 'function') {
            configForm.addEventListener('submit', guardarConfiguraciones);
        }
    }
    // Usuarios
    else if (page === 'usuarios.html') {
        if (currentUser && currentUser.rol === 'ADMIN') {
            if (typeof cargarListaUsuarios === 'function') cargarListaUsuarios();
        } else {
            window.location.href = 'index.html';
        }
    }
}

// ============================================
// Aplicar permisos por rol en el menú lateral
// ============================================

function aplicarPermisosMenu() {
    if (!currentUser) return;
    
    const rol = currentUser.rol;
    
    // Ocultar elementos según el rol
    if (rol === 'VENDEDOR') {
        const menuUsuarios = document.getElementById('menuUsuarios');
        const menuProveedores = document.getElementById('menuProveedores');
        const menuCompras = document.getElementById('menuCompras');
        const menuConfiguracion = document.getElementById('menuConfiguracion');
        
        if (menuUsuarios) menuUsuarios.style.display = 'none';
        if (menuProveedores) menuProveedores.style.display = 'none';
        if (menuCompras) menuCompras.style.display = 'none';
        if (menuConfiguracion) menuConfiguracion.style.display = 'none';
    } 
    else if (rol === 'BODEGA') {
        const menuUsuarios = document.getElementById('menuUsuarios');
        const menuProveedores = document.getElementById('menuProveedores');
        const menuVentas = document.getElementById('menuVentas');
        const menuConfiguracion = document.getElementById('menuConfiguracion');
        
        if (menuUsuarios) menuUsuarios.style.display = 'none';
        if (menuProveedores) menuProveedores.style.display = 'none';
        if (menuVentas) menuVentas.style.display = 'none';
        if (menuConfiguracion) menuConfiguracion.style.display = 'none';
    }
}

// ============================================
// Inicialización principal
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación
    if (!checkAuth()) return;
    
    // Mostrar información del usuario
    mostrarInfoUsuario();
    
    // Configurar sidebar
    configurarSidebarModerno();
    configurarSidebar();
    
    // Configurar logout
    configurarLogout();
    
    // Aplicar permisos del menú
    aplicarPermisosMenu();
    
    // Cargar scripts específicos de la página
    cargarScriptsPorPagina();
});