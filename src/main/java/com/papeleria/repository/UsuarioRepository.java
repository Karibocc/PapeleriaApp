package com.papeleria.repository;

import com.papeleria.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    
    Optional<Usuario> findByNombreUsuario(String nombreUsuario);
    
    Optional<Usuario> findByEmail(String email);
    
    Optional<Usuario> findByTokenVerificacion(String token);
    
    Optional<Usuario> findByTokenRecuperacion(String token);
    
    boolean existsByNombreUsuario(String nombreUsuario);
    
    @Modifying
    @Transactional
    @Query("UPDATE Usuario u SET u.intentosFallidos = :intentos WHERE u.nombreUsuario = :username")
    void updateIntentosFallidos(@Param("username") String username, @Param("intentos") Integer intentos);
    
    @Modifying
    @Transactional
    @Query("UPDATE Usuario u SET u.cuentaBloqueada = true, u.fechaBloqueo = :fecha WHERE u.nombreUsuario = :username")
    void bloquearCuenta(@Param("username") String username, @Param("fecha") LocalDateTime fecha);
}