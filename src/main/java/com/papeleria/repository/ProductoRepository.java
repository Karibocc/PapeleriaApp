package com.papeleria.repository;

import com.papeleria.entity.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Integer> {

    Optional<Producto> findByNombre(String nombre);
    
    Optional<Producto> findByCodigoBarras(String codigoBarras);

    boolean existsByNombre(String nombre);

    boolean existsByCodigoBarras(String codigoBarras);

    List<Producto> findByActivoTrue();

    List<Producto> findByActivoFalse();

    @Query("SELECT p FROM Producto p WHERE p.nombre LIKE %:nombre%")
    List<Producto> buscarPorNombre(@Param("nombre") String nombre);

    @Query("SELECT p FROM Producto p WHERE p.stockActual <= p.stockMinimo AND p.activo = true")
    List<Producto> findProductosConStockBajo();

    @Query("SELECT p FROM Producto p WHERE p.stockActual <= :stockMinimo AND p.activo = true")
    List<Producto> findProductosConStockBajo(@Param("stockMinimo") Integer stockMinimo);
}