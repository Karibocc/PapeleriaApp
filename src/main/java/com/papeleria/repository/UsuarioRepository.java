package com.papeleria.repository;

import com.papeleria.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    
    // ============================================
    // Búsquedas básicas
    // ============================================
    
    Optional<Usuario> findByNombreUsuario(String nombreUsuario);
    
    Optional<Usuario> findByEmail(String email);
    
    Optional<Usuario> findByTokenVerificacion(String token);
    
    Optional<Usuario> findByTokenRecuperacion(String token);
    
    boolean existsByNombreUsuario(String nombreUsuario);
    
    // ✅ MÉTODO AGREGADO - Verificar si existe email
    boolean existsByEmail(String email);
    
    // ============================================
    // Consultas con FETCH para evitar LazyInitializationException
    // ============================================
    
    /**
     * Obtiene todos los usuarios con sus roles y estados precargados
     * Esto evita el error de serialización LazyInitializationException
     */
    @Query("SELECT DISTINCT u FROM Usuario u " +
           "LEFT JOIN FETCH u.rol " +
           "LEFT JOIN FETCH u.estado")
    List<Usuario> findAllWithRolAndEstado();
    
    /**
     * Obtiene un usuario por ID con su rol y estado precargados
     */
    @Query("SELECT DISTINCT u FROM Usuario u " +
           "LEFT JOIN FETCH u.rol " +
           "LEFT JOIN FETCH u.estado " +
           "WHERE u.idUsuario = :id")
    Optional<Usuario> findByIdWithRolAndEstado(@Param("id") Integer id);
    
    /**
     * Obtiene un usuario por nombre de usuario con su rol y estado precargados
     */
    @Query("SELECT DISTINCT u FROM Usuario u " +
           "LEFT JOIN FETCH u.rol " +
           "LEFT JOIN FETCH u.estado " +
           "WHERE u.nombreUsuario = :nombreUsuario")
    Optional<Usuario> findByNombreUsuarioWithDetails(@Param("nombreUsuario") String nombreUsuario);
    
    // ============================================
    // Actualizaciones de seguridad
    // ============================================
    
    @Modifying
    @Transactional
    @Query("UPDATE Usuario u SET u.intentosFallidos = :intentos WHERE u.nombreUsuario = :username")
    void updateIntentosFallidos(@Param("username") String username, @Param("intentos") Integer intentos);
    
    @Modifying
    @Transactional
    @Query("UPDATE Usuario u SET u.cuentaBloqueada = true, u.fechaBloqueo = :fecha WHERE u.nombreUsuario = :username")
    void bloquearCuenta(@Param("username") String username, @Param("fecha") LocalDateTime fecha);
    
    @Modifying
    @Transactional
    @Query("UPDATE Usuario u SET u.ultimoLogin = :fecha WHERE u.nombreUsuario = :username")
    void updateUltimoLogin(@Param("username") String username, @Param("fecha") LocalDateTime fecha);
    
    // ============================================
    // Verificaciones
    // ============================================
    
    /**
     * Verifica si existe un usuario con el email dado (excluyendo el ID especificado)
     */
    @Query("SELECT COUNT(u) > 0 FROM Usuario u WHERE u.email = :email AND u.idUsuario != :id")
    boolean existsEmailExcludingId(@Param("email") String email, @Param("id") Integer id);
    
    /**
     * Verifica si existe un usuario con el nombre de usuario dado (excluyendo el ID especificado)
     */
    @Query("SELECT COUNT(u) > 0 FROM Usuario u WHERE u.nombreUsuario = :nombreUsuario AND u.idUsuario != :id")
    boolean existsNombreUsuarioExcludingId(@Param("nombreUsuario") String nombreUsuario, @Param("id") Integer id);
}