package com.papeleria.repository;

import com.papeleria.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {

    /**
     * Busca una categoría por su nombre (exacto).
     * @param nombre nombre de la categoría
     * @return Optional con la categoría si existe
     */
    Optional<Categoria> findByNombre(String nombre);

    /**
     * Verifica si ya existe una categoría con el mismo nombre.
     * @param nombre nombre a verificar
     * @return true si existe, false en caso contrario
     */
    boolean existsByNombre(String nombre);
}