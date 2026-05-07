package com.papeleria.repository;

import com.papeleria.dto.TopProductoDTO;
import com.papeleria.entity.Venta;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface VentaRepository extends JpaRepository<Venta, Integer> {

    // Método para buscar ventas entre dos fechas (usado en reportes)
    List<Venta> findByFechaHoraBetween(LocalDateTime inicio, LocalDateTime fin);

    // Método para obtener los productos más vendidos en un rango de fechas
    @Query("SELECT new com.papeleria.dto.TopProductoDTO(p.idProducto, p.nombre, SUM(dv.cantidad)) " +
           "FROM DetalleVenta dv JOIN dv.producto p JOIN dv.venta v " +
           "WHERE v.fechaHora BETWEEN :inicio AND :fin " +
           "GROUP BY p.idProducto, p.nombre " +
           "ORDER BY SUM(dv.cantidad) DESC")
    List<TopProductoDTO> findTopProductosEntreFechas(@Param("inicio") LocalDateTime inicio,
                                                     @Param("fin") LocalDateTime fin);
}