package com.papeleria.security.controller;

import com.papeleria.entity.Usuario;
import com.papeleria.entity.RolUsuario;
import com.papeleria.entity.EstadoUsuario;
import com.papeleria.repository.UsuarioRepository;
import com.papeleria.repository.RolUsuarioRepository;
import com.papeleria.repository.EstadoUsuarioRepository;
import com.papeleria.security.jwt.JwtTokenProvider;
import com.papeleria.security.model.AuthRequest;
import com.papeleria.security.model.AuthResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private JwtTokenProvider tokenProvider;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private RolUsuarioRepository rolUsuarioRepository;
    
    @Autowired
    private EstadoUsuarioRepository estadoUsuarioRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody AuthRequest loginRequest) {
        
        System.out.println("========================================");
        System.out.println("INTENTO DE LOGIN");
        System.out.println("Usuario recibido: " + loginRequest.getUsername());
        System.out.println("Password recibido: " + loginRequest.getPassword());
        System.out.println("========================================");
        
        try {
            Usuario usuario = usuarioRepository.findByNombreUsuario(loginRequest.getUsername()).orElse(null);
            
            if (usuario == null) {
                System.out.println("ERROR: Usuario NO encontrado en BD: " + loginRequest.getUsername());
            } else {
                System.out.println("Usuario encontrado: " + usuario.getNombreUsuario());
                System.out.println("Hash en BD: " + usuario.getContrasenaHash());
                System.out.println("Cuenta bloqueada: " + usuario.getCuentaBloqueada());
                System.out.println("Email verificado: " + usuario.getEmailVerificado());
                System.out.println("Intentos fallidos: " + usuario.getIntentosFallidos());
                
                boolean passwordMatches = passwordEncoder.matches(loginRequest.getPassword(), usuario.getContrasenaHash());
                System.out.println("Password encoder coincide: " + passwordMatches);
            }
            
            if (usuario != null && usuario.getCuentaBloqueada()) {
                System.out.println("ERROR: Cuenta bloqueada");
                if (usuario.getFechaBloqueo() != null && 
                    usuario.getFechaBloqueo().plusMinutes(30).isBefore(LocalDateTime.now())) {
                    usuario.setCuentaBloqueada(false);
                    usuario.setIntentosFallidos(0);
                    usuarioRepository.save(usuario);
                    System.out.println("Cuenta desbloqueada por tiempo");
                } else {
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "Cuenta bloqueada. Intente mas tarde.");
                    return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
                }
            }
            
            if (usuario != null && !usuario.getEmailVerificado()) {
                System.out.println("ERROR: Email no verificado");
                Map<String, String> error = new HashMap<>();
                error.put("error", "Por favor verifica tu correo electronico antes de iniciar sesion");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }
            
            System.out.println("Intentando autenticar con AuthenticationManager...");
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getUsername(),
                    loginRequest.getPassword()
                )
            );
            
            System.out.println("Autenticacion EXITOSA");
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            if (usuario != null && usuario.getTwoFactorEnabled() != null && usuario.getTwoFactorEnabled()) {
                Map<String, Object> response = new HashMap<>();
                response.put("requiresTwoFactor", true);
                response.put("message", "Se requiere codigo de autenticacion de dos factores");
                response.put("username", usuario.getNombreUsuario());
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
            }
            
            String jwt = tokenProvider.generateToken(authentication);
            
            if (usuario != null) {
                usuario.setUltimoLogin(LocalDateTime.now());
                usuario.setIntentosFallidos(0);
                usuarioRepository.save(usuario);
            }
            
            String rol = authentication.getAuthorities().stream()
                .findFirst()
                .map(grantedAuthority -> grantedAuthority.getAuthority().replace("ROLE_", ""))
                .orElse("USER");
            
            AuthResponse response = new AuthResponse(jwt, 86400000L, loginRequest.getUsername(), rol, 
                usuario != null ? usuario.getNombreCompleto() : "");
            
            System.out.println("LOGIN EXITOSO - Token generado");
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.out.println("ERROR EN AUTHENTICACION: " + e.getMessage());
            e.printStackTrace();
            
            Usuario usuario = usuarioRepository.findByNombreUsuario(loginRequest.getUsername()).orElse(null);
            if (usuario != null) {
                int nuevosIntentos = (usuario.getIntentosFallidos() != null ? usuario.getIntentosFallidos() : 0) + 1;
                usuario.setIntentosFallidos(nuevosIntentos);
                System.out.println("Intentos fallidos incrementados a: " + nuevosIntentos);
                
                if (nuevosIntentos >= 5) {
                    usuario.setCuentaBloqueada(true);
                    usuario.setFechaBloqueo(LocalDateTime.now());
                    System.out.println("Cuenta BLOQUEADA por exceso de intentos");
                }
                usuarioRepository.save(usuario);
            }
            
            Map<String, String> error = new HashMap<>();
            error.put("error", "Credenciales invalidas");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }
    
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        SecurityContextHolder.clearContext();
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logout exitoso");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String token) {
        try {
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
                boolean isValid = tokenProvider.validateToken(token);
                Map<String, Object> response = new HashMap<>();
                response.put("valid", isValid);
                if (isValid) {
                    String username = tokenProvider.getUsernameFromToken(token);
                    response.put("username", username);
                }
                return ResponseEntity.ok(response);
            }
            return ResponseEntity.badRequest().body(Map.of("valid", false));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("valid", false));
        }
    }
    
    @PostMapping("/cambiar-contrasena")
    public ResponseEntity<?> changePassword(
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> request) {
        
        try {
            if (token != null && token.startsWith("Bearer ")) {
                token = token.substring(7);
                String username = tokenProvider.getUsernameFromToken(token);
                Usuario usuario = usuarioRepository.findByNombreUsuario(username).orElse(null);
                
                if (usuario != null) {
                    String oldPassword = request.get("oldPassword");
                    String newPassword = request.get("newPassword");
                    
                    if (passwordEncoder.matches(oldPassword, usuario.getContrasenaHash())) {
                        usuario.setContrasenaHash(passwordEncoder.encode(newPassword));
                        usuarioRepository.save(usuario);
                        return ResponseEntity.ok(Map.of("message", "Contrasena actualizada exitosamente"));
                    } else {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .body(Map.of("error", "Contrasena actual incorrecta"));
                    }
                }
            }
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "No autorizado"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "Error al cambiar contrasena"));
        }
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody Map<String, String> registerRequest) {
        
        System.out.println("========================================");
        System.out.println("INTENTO DE REGISTRO");
        System.out.println("Username: " + registerRequest.get("username"));
        System.out.println("Email: " + registerRequest.get("email"));
        System.out.println("========================================");
        
        try {
            String username = registerRequest.get("username");
            String password = registerRequest.get("password");
            String email = registerRequest.get("email");
            String nombreCompleto = registerRequest.get("nombreCompleto");
            String telefonoMovil = registerRequest.get("telefonoMovil");
            
            if (username == null || username.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "El nombre de usuario es obligatorio");
                return ResponseEntity.badRequest().body(error);
            }
            
            if (password == null || password.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "La contrasena es obligatoria");
                return ResponseEntity.badRequest().body(error);
            }
            
            if (email == null || email.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "El correo electronico es obligatorio");
                return ResponseEntity.badRequest().body(error);
            }
            
            if (nombreCompleto == null || nombreCompleto.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "El nombre completo es obligatorio");
                return ResponseEntity.badRequest().body(error);
            }
            
            if (usuarioRepository.existsByNombreUsuario(username)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "El nombre de usuario ya existe");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
            }
            
            if (usuarioRepository.existsByEmail(email)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "El correo electronico ya esta registrado");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
            }
            
            RolUsuario rolVendedor = rolUsuarioRepository.findById(2)
                .orElseThrow(() -> new RuntimeException("No se encontro el rol VENDEDOR"));
            
            EstadoUsuario estadoActivo = estadoUsuarioRepository.findById(1)
                .orElseThrow(() -> new RuntimeException("No se encontro el estado ACTIVO"));
            
            Usuario nuevoUsuario = new Usuario();
            nuevoUsuario.setNombreUsuario(username);
            nuevoUsuario.setContrasenaHash(passwordEncoder.encode(password));
            nuevoUsuario.setEmail(email);
            nuevoUsuario.setNombreCompleto(nombreCompleto);
            nuevoUsuario.setTelefonoMovil(telefonoMovil != null ? telefonoMovil : "");
            nuevoUsuario.setRol(rolVendedor);
            nuevoUsuario.setEstado(estadoActivo);
            nuevoUsuario.setEmailVerificado(true);
            nuevoUsuario.setCuentaBloqueada(false);
            nuevoUsuario.setIntentosFallidos(0);
            nuevoUsuario.setFechaCreacion(LocalDateTime.now());
            
            Usuario usuarioGuardado = usuarioRepository.save(nuevoUsuario);
            
            System.out.println("REGISTRO EXITOSO - Usuario creado con ID: " + usuarioGuardado.getIdUsuario());
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Usuario registrado exitosamente");
            response.put("username", usuarioGuardado.getNombreUsuario());
            response.put("email", usuarioGuardado.getEmail());
            response.put("rol", rolVendedor.getNombre());
            response.put("estado", estadoActivo.getNombre());
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
            
        } catch (Exception e) {
            System.out.println("ERROR EN REGISTRO: " + e.getMessage());
            e.printStackTrace();
            
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al registrar usuario: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}