package com.papeleria.repository;

import com.papeleria.entity.EstadoUsuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EstadoUsuarioRepository extends JpaRepository<EstadoUsuario, Integer> {

    /**
     * Busca un estado por su nombre (ej: activo, inactivo)
     * @param nombre nombre del estado
     * @return Optional con el estado si existe
     */
    Optional<EstadoUsuario> findByNombre(String nombre);
}