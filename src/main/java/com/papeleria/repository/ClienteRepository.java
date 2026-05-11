package com.papeleria.repository;

import com.papeleria.entity.Cliente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Integer> {

    Optional<Cliente> findByDocumento(String documento);

    boolean existsByDocumento(String documento);

    List<Cliente> findByActivoTrue();

    List<Cliente> findByActivoFalse();

    @Query("SELECT c FROM Cliente c WHERE c.nombre LIKE %:nombre%")
    List<Cliente> buscarPorNombre(@Param("nombre") String nombre);

    @Query("SELECT c FROM Cliente c WHERE c.documento LIKE %:documento%")
    List<Cliente> buscarPorDocumento(@Param("documento") String documento);
}