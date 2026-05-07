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

    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    public Usuario obtenerPorId(Integer id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + id));
    }

    public Usuario obtenerPorNombreUsuario(String nombreUsuario) {
        return usuarioRepository.findByNombreUsuario(nombreUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + nombreUsuario));
    }

    @Transactional
    public Usuario guardar(Usuario usuario) {
        // Encriptar contraseña si es nueva
        if (usuario.getContrasenaHash() != null && !usuario.getContrasenaHash().startsWith("$2a$")) {
            usuario.setContrasenaHash(passwordEncoder.encode(usuario.getContrasenaHash()));
        }
        return usuarioRepository.save(usuario);
    }

    @Transactional
    public Usuario actualizar(Integer id, Usuario usuarioActualizado) {
        Usuario usuario = obtenerPorId(id);
        usuario.setNombreUsuario(usuarioActualizado.getNombreUsuario());
        usuario.setNombreCompleto(usuarioActualizado.getNombreCompleto());
        usuario.setRol(usuarioActualizado.getRol());
        usuario.setEstado(usuarioActualizado.getEstado());

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
        // Aquí puedes agregar validación: si tiene ventas o compras, lanzar excepción
        usuarioRepository.delete(usuario);
    }
}