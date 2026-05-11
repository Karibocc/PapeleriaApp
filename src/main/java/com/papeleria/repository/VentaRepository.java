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
    
    @Query("SELECT v FROM Venta v WHERE v.fechaHora BETWEEN :fechaInicio AND :fechaFin")
    List<Venta> findVentasPorFecha(@Param("fechaInicio") LocalDateTime fechaInicio, @Param("fechaFin") LocalDateTime fechaFin);
    
    @Query("SELECT v FROM Venta v WHERE v.fechaHora BETWEEN :fechaInicio AND :fechaFin")
    List<Venta> findByFechaHoraBetween(@Param("fechaInicio") LocalDateTime fechaInicio, @Param("fechaFin") LocalDateTime fechaFin);
    
    @Query("SELECT v FROM Venta v WHERE v.cliente.idCliente = :idCliente")
    List<Venta> findByClienteIdCliente(@Param("idCliente") Integer idCliente);
    
    @Query("SELECT v FROM Venta v WHERE v.usuario.idUsuario = :idUsuario")
    List<Venta> findByUsuarioIdUsuario(@Param("idUsuario") Integer idUsuario);
    
    @Query("SELECT DISTINCT v FROM Venta v LEFT JOIN FETCH v.detalles d")
    List<Venta> findAllWithDetails();
    
    @Query("SELECT DISTINCT v FROM Venta v LEFT JOIN FETCH v.detalles d WHERE v.idVenta = :id")
    Venta findByIdWithDetails(@Param("id") Integer id);
    
    @Query("SELECT new com.papeleria.dto.TopProductoDTO(p.idProducto, p.nombre, SUM(d.cantidad), SUM(d.cantidad * d.precioUnitario)) " +
           "FROM Venta v JOIN v.detalles d JOIN d.producto p " +
           "WHERE v.fechaHora BETWEEN :inicio AND :fin " +
           "GROUP BY p.idProducto, p.nombre " +
           "ORDER BY SUM(d.cantidad) DESC")
    List<TopProductoDTO> findTopProductosEntreFechas(@Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);
}