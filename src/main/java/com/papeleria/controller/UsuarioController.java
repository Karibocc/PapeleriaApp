package com.papeleria.controller;

import com.papeleria.entity.Usuario;
import com.papeleria.entity.RolUsuario;
import com.papeleria.entity.EstadoUsuario;
import com.papeleria.service.UsuarioService;
import com.papeleria.repository.RolUsuarioRepository;
import com.papeleria.repository.EstadoUsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
@PreAuthorize("hasRole('ADMIN')")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;
    
    @Autowired
    private RolUsuarioRepository rolUsuarioRepository;
    
    @Autowired
    private EstadoUsuarioRepository estadoUsuarioRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<List<Usuario>> listar() {
        List<Usuario> usuarios = usuarioService.listarTodos();
        return ResponseEntity.ok(usuarios);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Usuario> obtenerPorId(@PathVariable Integer id) {
        Usuario usuario = usuarioService.obtenerPorId(id);
        return ResponseEntity.ok(usuario);
    }

    @GetMapping("/username/{nombreUsuario}")
    public ResponseEntity<Usuario> obtenerPorNombreUsuario(@PathVariable String nombreUsuario) {
        Usuario usuario = usuarioService.obtenerPorNombreUsuario(nombreUsuario);
        return ResponseEntity.ok(usuario);
    }

    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody Map<String, Object> usuarioData) {
        try {
            System.out.println("=== CREAR USUARIO ===");
            System.out.println("Datos recibidos: " + usuarioData);
            
            String username = (String) usuarioData.get("username");
            String password = (String) usuarioData.get("password");
            String email = (String) usuarioData.get("email");
            String nombreCompleto = (String) usuarioData.get("nombreCompleto");
            String telefonoMovil = (String) usuarioData.get("telefonoMovil");
            
            Object rolObj = usuarioData.get("rol");
            Object estadoObj = usuarioData.get("estado");
            
            Integer rolId = 2;
            Integer estadoId = 1;
            
            if (rolObj != null) {
                if (rolObj instanceof Integer) {
                    rolId = (Integer) rolObj;
                } else if (rolObj instanceof String) {
                    rolId = Integer.parseInt((String) rolObj);
                }
            }
            
            if (estadoObj != null) {
                if (estadoObj instanceof Integer) {
                    estadoId = (Integer) estadoObj;
                } else if (estadoObj instanceof String) {
                    estadoId = Integer.parseInt((String) estadoObj);
                }
            }
            
            if (username == null || username.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "El nombre de usuario es obligatorio");
                return ResponseEntity.badRequest().body(error);
            }
            
            if (password == null || password.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "La contraseña es obligatoria");
                return ResponseEntity.badRequest().body(error);
            }
            
            if (email == null || email.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "El correo electrónico es obligatorio");
                return ResponseEntity.badRequest().body(error);
            }
            
            if (usuarioService.existeNombreUsuario(username)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "El nombre de usuario ya existe");
                return ResponseEntity.badRequest().body(error);
            }
            
            if (usuarioService.existeEmail(email)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "El correo electrónico ya está registrado");
                return ResponseEntity.badRequest().body(error);
            }
            
            Optional<RolUsuario> rolOpt = rolUsuarioRepository.findById(rolId);
            if (!rolOpt.isPresent()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Rol no encontrado");
                return ResponseEntity.badRequest().body(error);
            }
            
            Optional<EstadoUsuario> estadoOpt = estadoUsuarioRepository.findById(estadoId);
            if (!estadoOpt.isPresent()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Estado no encontrado");
                return ResponseEntity.badRequest().body(error);
            }
            
            Usuario nuevoUsuario = new Usuario();
            nuevoUsuario.setNombreUsuario(username);
            nuevoUsuario.setContrasenaHash(passwordEncoder.encode(password));
            nuevoUsuario.setEmail(email);
            nuevoUsuario.setNombreCompleto(nombreCompleto);
            if (telefonoMovil != null) {
                nuevoUsuario.setTelefonoMovil(telefonoMovil);
            }
            nuevoUsuario.setRol(rolOpt.get());
            nuevoUsuario.setEstado(estadoOpt.get());
            
            Usuario guardado = usuarioService.guardar(nuevoUsuario);
            
            System.out.println("Usuario creado con ID: " + guardado.getIdUsuario());
            
            return new ResponseEntity<>(guardado, HttpStatus.CREATED);
            
        } catch (Exception e) {
            System.err.println("Error al crear usuario: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al crear el usuario: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Map<String, Object> usuarioData) {
        try {
            System.out.println("=== ACTUALIZAR USUARIO ===");
            System.out.println("ID: " + id);
            System.out.println("Datos recibidos: " + usuarioData);
            
            Usuario usuarioExistente = usuarioService.obtenerPorId(id);
            if (usuarioExistente == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Usuario no encontrado");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            
            String username = (String) usuarioData.get("username");
            String email = (String) usuarioData.get("email");
            String nombreCompleto = (String) usuarioData.get("nombreCompleto");
            String telefonoMovil = (String) usuarioData.get("telefonoMovil");
            String password = (String) usuarioData.get("password");
            
            Object rolObj = usuarioData.get("rol");
            Object estadoObj = usuarioData.get("estado");
            
            if (username != null && !username.equals(usuarioExistente.getNombreUsuario())) {
                if (usuarioService.existeNombreUsuario(username)) {
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "El nombre de usuario ya está en uso por otro usuario");
                    return ResponseEntity.badRequest().body(error);
                }
                usuarioExistente.setNombreUsuario(username);
            }
            
            if (email != null && !email.equals(usuarioExistente.getEmail())) {
                if (usuarioService.existeEmail(email)) {
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "El correo electrónico ya está registrado por otro usuario");
                    return ResponseEntity.badRequest().body(error);
                }
                usuarioExistente.setEmail(email);
            }
            
            if (nombreCompleto != null) {
                usuarioExistente.setNombreCompleto(nombreCompleto);
            }
            
            if (telefonoMovil != null) {
                usuarioExistente.setTelefonoMovil(telefonoMovil);
            }
            
            if (password != null && !password.trim().isEmpty()) {
                usuarioExistente.setContrasenaHash(passwordEncoder.encode(password));
            }
            
            if (rolObj != null) {
                Integer rolId = null;
                if (rolObj instanceof Integer) {
                    rolId = (Integer) rolObj;
                } else if (rolObj instanceof String) {
                    rolId = Integer.parseInt((String) rolObj);
                } else if (rolObj instanceof Long) {
                    rolId = ((Long) rolObj).intValue();
                }
                
                if (rolId != null) {
                    Optional<RolUsuario> rolOpt = rolUsuarioRepository.findById(rolId);
                    if (rolOpt.isPresent()) {
                        usuarioExistente.setRol(rolOpt.get());
                        System.out.println("Rol actualizado a ID: " + rolId);
                    } else {
                        Map<String, String> error = new HashMap<>();
                        error.put("error", "Rol no encontrado con ID: " + rolId);
                        return ResponseEntity.badRequest().body(error);
                    }
                }
            }
            
            if (estadoObj != null) {
                Integer estadoId = null;
                if (estadoObj instanceof Integer) {
                    estadoId = (Integer) estadoObj;
                } else if (estadoObj instanceof String) {
                    estadoId = Integer.parseInt((String) estadoObj);
                } else if (estadoObj instanceof Long) {
                    estadoId = ((Long) estadoObj).intValue();
                }
                
                if (estadoId != null) {
                    Optional<EstadoUsuario> estadoOpt = estadoUsuarioRepository.findById(estadoId);
                    if (estadoOpt.isPresent()) {
                        usuarioExistente.setEstado(estadoOpt.get());
                        System.out.println("Estado actualizado a ID: " + estadoId);
                    } else {
                        Map<String, String> error = new HashMap<>();
                        error.put("error", "Estado no encontrado con ID: " + estadoId);
                        return ResponseEntity.badRequest().body(error);
                    }
                }
            }
            
            Usuario actualizado = usuarioService.actualizar(id, usuarioExistente);
            System.out.println("Usuario actualizado exitosamente");
            return ResponseEntity.ok(actualizado);
            
        } catch (Exception e) {
            System.err.println("Error al actualizar usuario: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al actualizar el usuario: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            Usuario usuario = usuarioService.obtenerPorId(id);
            if (usuario == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Usuario no encontrado");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            
            usuarioService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al eliminar el usuario: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @GetMapping("/check-username/{nombreUsuario}")
    public ResponseEntity<Map<String, Boolean>> verificarNombreUsuario(@PathVariable String nombreUsuario) {
        boolean existe = usuarioService.existeNombreUsuario(nombreUsuario);
        Map<String, Boolean> response = new HashMap<>();
        response.put("disponible", !existe);
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/check-email/{email}")
    public ResponseEntity<Map<String, Boolean>> verificarEmail(@PathVariable String email) {
        boolean existe = usuarioService.existeEmail(email);
        Map<String, Boolean> response = new HashMap<>();
        response.put("disponible", !existe);
        return ResponseEntity.ok(response);
    }
}