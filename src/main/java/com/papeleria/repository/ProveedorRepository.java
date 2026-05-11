package com.papeleria.repository;

import com.papeleria.entity.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProveedorRepository extends JpaRepository<Proveedor, Integer> {

    Optional<Proveedor> findByNit(String nit);

    boolean existsByNit(String nit);

    List<Proveedor> findByEstado(String estado);

    @Query("SELECT p FROM Proveedor p WHERE p.nombre LIKE %:nombre%")
    List<Proveedor> buscarPorNombre(@Param("nombre") String nombre);

    @Query("SELECT p FROM Proveedor p WHERE p.contacto LIKE %:contacto%")
    List<Proveedor> buscarPorContacto(@Param("contacto") String contacto);
}