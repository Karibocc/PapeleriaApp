package com.papeleria.repository;

import com.papeleria.entity.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Integer> {

    Optional<Categoria> findByNombre(String nombre);

    boolean existsByNombre(String nombre);
    
    List<Categoria> findByActivoTrue();
    
    @Query("SELECT c FROM Categoria c WHERE c.activo = true ORDER BY c.nombre")
    List<Categoria> findAllActivasOrdenadas();
    
    @Query("SELECT c FROM Categoria c WHERE c.nombre LIKE %:nombre%")
    List<Categoria> buscarPorNombre(@Param("nombre") String nombre);
}