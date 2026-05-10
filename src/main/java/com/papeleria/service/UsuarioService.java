package com.papeleria.service;

import com.papeleria.entity.Usuario;
import com.papeleria.exception.ResourceNotFoundException;
import com.papeleria.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepository;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    /**
     * Lista todos los usuarios con roles y estados precargados
     * Esto evita el error LazyInitializationException y ERR_INCOMPLETE_CHUNKED_ENCODING
     */
    public List<Usuario> listarTodos() {
        // Usar el nuevo método con FETCH para cargar relaciones
        return usuarioRepository.findAllWithRolAndEstado();
    }

    /**
     * Obtiene un usuario por ID con sus relaciones precargadas
     */
    public Usuario obtenerPorId(Integer id) {
        // Usar el nuevo método con FETCH para cargar relaciones
        return usuarioRepository.findByIdWithRolAndEstado(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + id));
    }

    /**
     * Obtiene un usuario por nombre de usuario con sus relaciones precargadas
     */
    public Usuario obtenerPorNombreUsuario(String nombreUsuario) {
        // Usar el nuevo método con FETCH para cargar relaciones
        return usuarioRepository.findByNombreUsuarioWithDetails(nombreUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + nombreUsuario));
    }

    @Transactional
    public Usuario guardar(Usuario usuario) {
        // Agregar email si no tiene
        if (usuario.getEmail() == null || usuario.getEmail().isEmpty()) {
            usuario.setEmail(usuario.getNombreUsuario() + "@papeleria.com");
        }
        
        // Encriptar contraseña si es nueva
        if (usuario.getContrasenaHash() != null && !usuario.getContrasenaHash().startsWith("$2a$")) {
            usuario.setContrasenaHash(passwordEncoder.encode(usuario.getContrasenaHash()));
        }
        
        // Valores por defecto
        if (usuario.getIntentosFallidos() == null) {
            usuario.setIntentosFallidos(0);
        }
        if (usuario.getCuentaBloqueada() == null) {
            usuario.setCuentaBloqueada(false);
        }
        if (usuario.getEmailVerificado() == null) {
            usuario.setEmailVerificado(true);
        }
        if (usuario.getTwoFactorEnabled() == null) {
            usuario.setTwoFactorEnabled(false);
        }
        
        return usuarioRepository.save(usuario);
    }

    @Transactional
    public Usuario actualizar(Integer id, Usuario usuarioActualizado) {
        Usuario usuario = obtenerPorId(id);
        
        // Actualizar campos básicos
        usuario.setNombreUsuario(usuarioActualizado.getNombreUsuario());
        usuario.setNombreCompleto(usuarioActualizado.getNombreCompleto());
        usuario.setRol(usuarioActualizado.getRol());
        usuario.setEstado(usuarioActualizado.getEstado());
        
        // Actualizar email si se proporcionó
        if (usuarioActualizado.getEmail() != null && !usuarioActualizado.getEmail().isEmpty()) {
            usuario.setEmail(usuarioActualizado.getEmail());
        }

        // Actualizar contraseña solo si se envió una nueva y es diferente
        if (usuarioActualizado.getContrasenaHash() != null && !usuarioActualizado.getContrasenaHash().isEmpty()) {
            if (!usuarioActualizado.getContrasenaHash().startsWith("$2a$")) {
                usuario.setContrasenaHash(passwordEncoder.encode(usuarioActualizado.getContrasenaHash()));
            } else {
                usuario.setContrasenaHash(usuarioActualizado.getContrasenaHash());
            }
        }
        
        return usuarioRepository.save(usuario);
    }

    @Transactional
    public void eliminar(Integer id) {
        Usuario usuario = obtenerPorId(id);
        
        // Validar que no se pueda eliminar el propio usuario
        // (esto se debe validar también en el controlador)
        
        usuarioRepository.delete(usuario);
    }
    
    /**
     * Verifica si existe un usuario con el email dado
     */
    public boolean existeEmail(String email) {
        return usuarioRepository.findByEmail(email).isPresent();
    }
    
    /**
     * Verifica si existe un nombre de usuario
     */
    public boolean existeNombreUsuario(String nombreUsuario) {
        return usuarioRepository.existsByNombreUsuario(nombreUsuario);
    }
}