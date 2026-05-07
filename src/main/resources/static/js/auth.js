// Página de Login
if (document.getElementById('loginForm')) {
    const loginForm = document.getElementById('loginForm');
    let pendingUsername = null;
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const twoFactorCode = document.getElementById('twoFactorCode').value;
        
        const alertError = document.getElementById('alertError');
        const alert2FA = document.getElementById('alert2FA');
        const twoFactorDiv = document.getElementById('twoFactorDiv');
        
        alertError.style.display = 'none';
        alert2FA.style.display = 'none';
        
        if (twoFactorDiv.style.display === 'block' && pendingUsername) {
            const result = await loginWith2FA(pendingUsername, twoFactorCode);
            if (result.success) {
                window.location.href = 'index.html';
            } else {
                alertError.innerText = result.error;
                alertError.style.display = 'block';
            }
        } else {
            const result = await login(username, password);
            
            if (result.requiresTwoFactor) {
                pendingUsername = result.username;
                twoFactorDiv.style.display = 'block';
                alert2FA.innerText = 'Se requiere código de autenticación de dos factores';
                alert2FA.style.display = 'block';
                document.getElementById('btnLogin').innerText = 'Verificar Código 2FA';
            } else if (result.success) {
                window.location.href = 'index.html';
            } else {
                alertError.innerText = result.error;
                alertError.style.display = 'block';
            }
        }
    });
}

// Página de Registro
if (document.getElementById('registerForm')) {
    const registerForm = document.getElementById('registerForm');
    const alertError = document.getElementById('alertError');
    const alertSuccess = document.getElementById('alertSuccess');
    
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            alertError.innerText = 'Las contraseñas no coinciden';
            alertError.style.display = 'block';
            return;
        }
        
        const userData = {
            username: document.getElementById('username').value,
            password: password,
            email: document.getElementById('email').value,
            nombreCompleto: document.getElementById('nombreCompleto').value,
            telefonoMovil: document.getElementById('telefonoMovil').value
        };
        
        const result = await register(userData);
        
        if (result.success) {
            alertSuccess.innerText = result.message;
            alertSuccess.style.display = 'block';
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
        } else {
            alertError.innerText = result.error;
            alertError.style.display = 'block';
        }
    });
}

// Página de Recuperación de Contraseña
if (document.getElementById('forgotForm')) {
    const forgotForm = document.getElementById('forgotForm');
    const alertError = document.getElementById('alertError');
    const alertSuccess = document.getElementById('alertSuccess');
    
    forgotForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const result = await forgotPassword(email);
        
        if (result.success) {
            alertSuccess.innerText = result.message;
            alertSuccess.style.display = 'block';
        } else {
            alertError.innerText = result.error;
            alertError.style.display = 'block';
        }
    });
}

// Página de Restablecer Contraseña
if (document.getElementById('resetForm')) {
    const resetForm = document.getElementById('resetForm');
    const alertError = document.getElementById('alertError');
    const alertSuccess = document.getElementById('alertSuccess');
    
    resetForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (newPassword !== confirmPassword) {
            alertError.innerText = 'Las contraseñas no coinciden';
            alertError.style.display = 'block';
            return;
        }
        
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        
        if (!token) {
            alertError.innerText = 'Token de recuperación no encontrado';
            alertError.style.display = 'block';
            return;
        }
        
        const result = await resetPassword(token, newPassword);
        
        if (result.success) {
            alertSuccess.innerText = result.message;
            alertSuccess.style.display = 'block';
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 3000);
        } else {
            alertError.innerText = result.error;
            alertError.style.display = 'block';
        }
    });
}

// Cerrar sesión
if (document.getElementById('btnLogout')) {
    document.getElementById('btnLogout').addEventListener('click', (e) => {
        e.preventDefault();
        logout();
    });
}