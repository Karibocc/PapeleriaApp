// ============================================
// api.js - Funciones de API
// Papelería App
// ============================================

const API_BASE_URL = 'http://localhost:8085/api';

// ============================================
// Funciones de utilidad
// ============================================

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

async function apiRequest(endpoint, method = 'GET', data = null) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = getHeaders();
    
    const config = {
        method: method,
        headers: headers
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
        config.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, config);
        
        if (response.status === 401) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('currentUser');
            window.location.href = 'login.html';
            return null;
        }
        
        if (response.status === 204) {
            return { success: true };
        }
        
        const responseData = await response.json();
        return responseData;
    } catch (error) {
        console.error('Error en la petición:', error);
        throw error;
    }
}

// ============================================
// Autenticación
// ============================================

async function login(username, password) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            if (data.requiresTwoFactor) {
                return { requiresTwoFactor: true, username: data.username };
            }
            
            if (data.accessToken) {
                localStorage.setItem('authToken', data.accessToken);
                localStorage.setItem('currentUser', JSON.stringify({
                    username: data.username,
                    rol: data.rol,
                    nombreCompleto: data.nombreCompleto
                }));
                return { success: true, data: data };
            }
        }
        
        return { error: data.error || 'Credenciales inválidas' };
    } catch (error) {
        console.error('Error en login:', error);
        return { error: 'Error de conexión con el servidor' };
    }
}

async function loginWith2FA(username, code) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login/2fa`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, code })
        });
        
        const data = await response.json();
        
        if (response.ok && data.accessToken) {
            localStorage.setItem('authToken', data.accessToken);
            localStorage.setItem('currentUser', JSON.stringify({
                username: data.username,
                rol: data.rol,
                nombreCompleto: data.nombreCompleto
            }));
            return { success: true, data: data };
        }
        
        return { error: data.error || 'Código 2FA inválido' };
    } catch (error) {
        console.error('Error en login 2FA:', error);
        return { error: 'Error de conexión' };
    }
}

async function register(userData) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            return { success: true, message: data.message };
        } else {
            return { error: data.error || 'Error en el registro' };
        }
    } catch (error) {
        console.error('Error en registro:', error);
        return { error: 'Error de conexión con el servidor' };
    }
}

async function forgotPassword(email) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            return { success: true, message: data.message };
        } else {
            return { error: data.error || 'Error al enviar el correo' };
        }
    } catch (error) {
        console.error('Error en forgot password:', error);
        return { error: 'Error de conexión con el servidor' };
    }
}

async function resetPassword(token, newPassword) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            return { success: true, message: data.message };
        } else {
            return { error: data.error || 'Error al restablecer la contraseña' };
        }
    } catch (error) {
        console.error('Error en reset password:', error);
        return { error: 'Error de conexión con el servidor' };
    }
}

async function changePassword(oldPassword, newPassword) {
    const token = getAuthToken();
    if (!token) {
        return { error: 'No hay sesión activa' };
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/cambiar-contrasena`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ oldPassword, newPassword })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            return { success: true, message: data.message };
        } else {
            return { error: data.error || 'Error al cambiar la contraseña' };
        }
    } catch (error) {
        console.error('Error en change password:', error);
        return { error: 'Error de conexión con el servidor' };
    }
}

function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// ============================================
// Productos
// ============================================

async function cargarProductos() {
    try {
        const response = await fetch(`${API_BASE_URL}/productos`, { headers: getHeaders() });
        if (response.ok) {
            return await response.json();
        }
        return [];
    } catch (error) {
        console.error('Error cargando productos:', error);
        return [];
    }
}

async function guardarProductoAPI(producto) {
    const url = producto.idProducto ? `${API_BASE_URL}/productos/${producto.idProducto}` : `${API_BASE_URL}/productos`;
    const method = producto.idProducto ? 'PUT' : 'POST';
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: getHeaders(),
            body: JSON.stringify(producto)
        });
        
        if (response.ok) {
            return await response.json();
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Error al guardar producto');
        }
    } catch (error) {
        console.error('Error guardando producto:', error);
        throw error;
    }
}

async function eliminarProductoAPI(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/productos/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al eliminar producto');
        }
        
        return true;
    } catch (error) {
        console.error('Error eliminando producto:', error);
        throw error;
    }
}

// ============================================
// Clientes
// ============================================

async function cargarClientes() {
    try {
        const response = await fetch(`${API_BASE_URL}/clientes`, { headers: getHeaders() });
        if (response.ok) {
            return await response.json();
        }
        return [];
    } catch (error) {
        console.error('Error cargando clientes:', error);
        return [];
    }
}

async function guardarClienteAPI(cliente) {
    const url = cliente.idCliente ? `${API_BASE_URL}/clientes/${cliente.idCliente}` : `${API_BASE_URL}/clientes`;
    const method = cliente.idCliente ? 'PUT' : 'POST';
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: getHeaders(),
            body: JSON.stringify(cliente)
        });
        
        if (response.ok) {
            return await response.json();
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Error al guardar cliente');
        }
    } catch (error) {
        console.error('Error guardando cliente:', error);
        throw error;
    }
}

async function eliminarClienteAPI(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/clientes/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al eliminar cliente');
        }
        
        return true;
    } catch (error) {
        console.error('Error eliminando cliente:', error);
        throw error;
    }
}

// ============================================
// Proveedores
// ============================================

async function cargarProveedores() {
    try {
        const response = await fetch(`${API_BASE_URL}/proveedores`, { headers: getHeaders() });
        if (response.ok) {
            return await response.json();
        }
        return [];
    } catch (error) {
        console.error('Error cargando proveedores:', error);
        return [];
    }
}

async function guardarProveedorAPI(proveedor) {
    const url = proveedor.idProveedor ? `${API_BASE_URL}/proveedores/${proveedor.idProveedor}` : `${API_BASE_URL}/proveedores`;
    const method = proveedor.idProveedor ? 'PUT' : 'POST';
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: getHeaders(),
            body: JSON.stringify(proveedor)
        });
        
        if (response.ok) {
            return await response.json();
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Error al guardar proveedor');
        }
    } catch (error) {
        console.error('Error guardando proveedor:', error);
        throw error;
    }
}

async function eliminarProveedorAPI(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/proveedores/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al eliminar proveedor');
        }
        
        return true;
    } catch (error) {
        console.error('Error eliminando proveedor:', error);
        throw error;
    }
}

// ============================================
// Ventas
// ============================================

async function registrarVentaAPI(venta) {
    try {
        const response = await fetch(`${API_BASE_URL}/ventas`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(venta)
        });
        
        if (response.ok) {
            return await response.json();
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Error al registrar venta');
        }
    } catch (error) {
        console.error('Error registrando venta:', error);
        throw error;
    }
}

async function obtenerTopProductos(inicio, fin) {
    try {
        const response = await fetch(`${API_BASE_URL}/ventas/top-productos?inicio=${inicio}&fin=${fin}`, { headers: getHeaders() });
        if (response.ok) {
            return await response.json();
        }
        return [];
    } catch (error) {
        console.error('Error obteniendo top productos:', error);
        return [];
    }
}

// ============================================
// Compras
// ============================================

async function registrarCompraAPI(compra) {
    try {
        const response = await fetch(`${API_BASE_URL}/compras`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(compra)
        });
        
        if (response.ok) {
            return await response.json();
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Error al registrar compra');
        }
    } catch (error) {
        console.error('Error registrando compra:', error);
        throw error;
    }
}

async function cargarCompras() {
    try {
        const response = await fetch(`${API_BASE_URL}/compras`, { headers: getHeaders() });
        if (response.ok) {
            return await response.json();
        }
        return [];
    } catch (error) {
        console.error('Error cargando compras:', error);
        return [];
    }
}

// ============================================
// Categorías
// ============================================

async function cargarCategorias() {
    try {
        const response = await fetch(`${API_BASE_URL}/categorias`, { headers: getHeaders() });
        if (response.ok) {
            return await response.json();
        }
        return [];
    } catch (error) {
        console.error('Error cargando categorías:', error);
        return [];
    }
}

// ============================================
// Configuración
// ============================================

async function cargarConfiguraciones() {
    try {
        const response = await fetch(`${API_BASE_URL}/configuraciones`, { headers: getHeaders() });
        if (response.ok) {
            const configs = await response.json();
            const configMap = {};
            configs.forEach(c => { configMap[c.clave] = c.valor; });
            return configMap;
        }
        return {};
    } catch (error) {
        console.error('Error cargando configuraciones:', error);
        return {};
    }
}

async function guardarConfiguracionAPI(clave, valor) {
    try {
        const response = await fetch(`${API_BASE_URL}/configuraciones`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify({ clave, valor })
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al guardar configuración');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error guardando configuración:', error);
        throw error;
    }
}

// ============================================
// Usuarios (Solo Admin)
// ============================================

async function cargarUsuarios() {
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios`, { headers: getHeaders() });
        if (response.ok) {
            return await response.json();
        }
        return [];
    } catch (error) {
        console.error('Error cargando usuarios:', error);
        return [];
    }
}

async function guardarUsuarioAPI(usuario) {
    const url = usuario.idUsuario ? `${API_BASE_URL}/usuarios/${usuario.idUsuario}` : `${API_BASE_URL}/usuarios`;
    const method = usuario.idUsuario ? 'PUT' : 'POST';
    
    try {
        const response = await fetch(url, {
            method: method,
            headers: getHeaders(),
            body: JSON.stringify(usuario)
        });
        
        if (response.ok) {
            return await response.json();
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Error al guardar usuario');
        }
    } catch (error) {
        console.error('Error guardando usuario:', error);
        throw error;
    }
}

async function eliminarUsuarioAPI(id) {
    try {
        const response = await fetch(`${API_BASE_URL}/usuarios/${id}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Error al eliminar usuario');
        }
        
        return true;
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        throw error;
    }
}

// Exponer funciones globales
window.apiRequest = apiRequest;
window.login = login;
window.loginWith2FA = loginWith2FA;
window.register = register;
window.forgotPassword = forgotPassword;
window.resetPassword = resetPassword;
window.changePassword = changePassword;
window.logout = logout;
window.cargarProductos = cargarProductos;
window.guardarProductoAPI = guardarProductoAPI;
window.eliminarProductoAPI = eliminarProductoAPI;
window.cargarClientes = cargarClientes;
window.guardarClienteAPI = guardarClienteAPI;
window.eliminarClienteAPI = eliminarClienteAPI;
window.cargarProveedores = cargarProveedores;
window.guardarProveedorAPI = guardarProveedorAPI;
window.eliminarProveedorAPI = eliminarProveedorAPI;
window.registrarVentaAPI = registrarVentaAPI;
window.obtenerTopProductos = obtenerTopProductos;
window.registrarCompraAPI = registrarCompraAPI;
window.cargarCompras = cargarCompras;
window.cargarCategorias = cargarCategorias;
window.cargarConfiguraciones = cargarConfiguraciones;
window.guardarConfiguracionAPI = guardarConfiguracionAPI;
window.cargarUsuarios = cargarUsuarios;
window.guardarUsuarioAPI = guardarUsuarioAPI;
window.eliminarUsuarioAPI = eliminarUsuarioAPI;