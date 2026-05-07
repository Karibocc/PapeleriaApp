const API_BASE_URL = 'http://localhost:8085/api';

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
                return data;
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
            return data;
        }
        
        return { error: data.error || 'Código 2FA inválido' };
    } catch (error) {
        console.error('Error en login 2FA:', error);
        return { error: 'Error de conexión' };
    }
}