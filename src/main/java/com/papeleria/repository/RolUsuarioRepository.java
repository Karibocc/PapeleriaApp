package com.papeleria.repository;

import com.papeleria.entity.RolUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RolUsuarioRepository extends JpaRepository<RolUsuario, Integer> {

    /**
     * Busca un rol por su nombre (ej: ADMIN, VENDEDOR, BODEGA)
     * @param nombre nombre del rol
     * @return Optional con el rol si existe
     */
    Optional<RolUsuario> findByNombre(String nombre);
}