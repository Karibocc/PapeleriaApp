package com.papeleria.service;

import com.papeleria.entity.EstadoUsuario;
import com.papeleria.entity.RolUsuario;
import com.papeleria.entity.Usuario;
import com.papeleria.exception.ResourceNotFoundException;
import com.papeleria.repository.EstadoUsuarioRepository;
import com.papeleria.repository.RolUsuarioRepository;
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

    @Autowired
    private RolUsuarioRepository rolUsuarioRepository;

    @Autowired
    private EstadoUsuarioRepository estadoUsuarioRepository;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAllWithRolAndEstado();
    }

    public Usuario obtenerPorId(Integer id) {
        return usuarioRepository.findByIdWithRolAndEstado(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + id));
    }

    public Usuario obtenerPorNombreUsuario(String nombreUsuario) {
        return usuarioRepository.findByNombreUsuarioWithDetails(nombreUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + nombreUsuario));
    }

    @Transactional
    public Usuario guardar(Usuario usuario) {
        // Asignar rol si el usuario ya tiene un objeto Rol con ID (debe venir del controlador)
        if (usuario.getRol() != null && usuario.getRol().getIdRol() != null) {
            RolUsuario rol = rolUsuarioRepository.findById(usuario.getRol().getIdRol())
                    .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado con id: " + usuario.getRol().getIdRol()));
            usuario.setRol(rol);
        }
        // Asignar estado si el usuario ya tiene un objeto Estado con ID
        if (usuario.getEstado() != null && usuario.getEstado().getIdEstadoUsuario() != null) {
            EstadoUsuario estado = estadoUsuarioRepository.findById(usuario.getEstado().getIdEstadoUsuario())
                    .orElseThrow(() -> new ResourceNotFoundException("Estado no encontrado con id: " + usuario.getEstado().getIdEstadoUsuario()));
            usuario.setEstado(estado);
        }

        // Agregar email por defecto si no tiene
        if (usuario.getEmail() == null || usuario.getEmail().isEmpty()) {
            usuario.setEmail(usuario.getNombreUsuario() + "@papeleria.com");
        }
        
        // Encriptar contraseña si es nueva
        if (usuario.getContrasenaHash() != null && !usuario.getContrasenaHash().startsWith("$2a$")) {
            usuario.setContrasenaHash(passwordEncoder.encode(usuario.getContrasenaHash()));
        }
        
        // Valores por defecto
        if (usuario.getIntentosFallidos() == null) usuario.setIntentosFallidos(0);
        if (usuario.getCuentaBloqueada() == null) usuario.setCuentaBloqueada(false);
        if (usuario.getEmailVerificado() == null) usuario.setEmailVerificado(true);
        if (usuario.getTwoFactorEnabled() == null) usuario.setTwoFactorEnabled(false);
        
        return usuarioRepository.save(usuario);
    }

    @Transactional
    public Usuario actualizar(Integer id, Usuario usuarioActualizado) {
        Usuario usuario = obtenerPorId(id);
        
        // Actualizar campos simples
        usuario.setNombreUsuario(usuarioActualizado.getNombreUsuario());
        usuario.setNombreCompleto(usuarioActualizado.getNombreCompleto());
        if (usuarioActualizado.getEmail() != null && !usuarioActualizado.getEmail().isEmpty()) {
            usuario.setEmail(usuarioActualizado.getEmail());
        }

        // Actualizar rol si el objeto usuarioActualizado tiene un Rol con ID
        if (usuarioActualizado.getRol() != null && usuarioActualizado.getRol().getIdRol() != null) {
            RolUsuario rol = rolUsuarioRepository.findById(usuarioActualizado.getRol().getIdRol())
                    .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado con id: " + usuarioActualizado.getRol().getIdRol()));
            usuario.setRol(rol);
        }

        // Actualizar estado si el objeto usuarioActualizado tiene un Estado con ID
        if (usuarioActualizado.getEstado() != null && usuarioActualizado.getEstado().getIdEstadoUsuario() != null) {
            EstadoUsuario estado = estadoUsuarioRepository.findById(usuarioActualizado.getEstado().getIdEstadoUsuario())
                    .orElseThrow(() -> new ResourceNotFoundException("Estado no encontrado con id: " + usuarioActualizado.getEstado().getIdEstadoUsuario()));
            usuario.setEstado(estado);
        }

        // Actualizar contraseña solo si se envió una nueva
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
        usuarioRepository.delete(usuario);
    }
    
    public boolean existeEmail(String email) {
        return usuarioRepository.findByEmail(email).isPresent();
    }
    
    public boolean existeNombreUsuario(String nombreUsuario) {
        return usuarioRepository.existsByNombreUsuario(nombreUsuario);
    }
}