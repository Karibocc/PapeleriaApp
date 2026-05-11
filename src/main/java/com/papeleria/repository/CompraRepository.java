package com.papeleria.repository;

import com.papeleria.entity.Compra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface CompraRepository extends JpaRepository<Compra, Integer> {

    @Query("SELECT c FROM Compra c WHERE c.fechaHora BETWEEN :fechaInicio AND :fechaFin ORDER BY c.fechaHora DESC")
    List<Compra> findComprasPorFecha(@Param("fechaInicio") LocalDateTime fechaInicio, @Param("fechaFin") LocalDateTime fechaFin);
    
    @Query("SELECT c FROM Compra c WHERE c.fechaHora BETWEEN :fechaInicio AND :fechaFin")
    List<Compra> findByFechaHoraBetween(@Param("fechaInicio") LocalDateTime fechaInicio, @Param("fechaFin") LocalDateTime fechaFin);

    List<Compra> findByProveedorIdProveedor(Integer idProveedor);

    List<Compra> findByUsuarioIdUsuario(Integer idUsuario);

    @Query("SELECT c FROM Compra c ORDER BY c.fechaHora DESC")
    List<Compra> findAllOrderByFechaDesc();
    
    @Query("SELECT c.idCompra, c.fechaHora, c.proveedor.nombre, c.usuario.nombreCompleto, " +
           "c.numeroFactura, c.subtotal, c.impuesto, c.descuento, c.total " +
           "FROM Compra c WHERE c.fechaHora BETWEEN :inicio AND :fin ORDER BY c.fechaHora DESC")
    List<Object[]> findComprasConDetalles(@Param("inicio") LocalDateTime inicio, @Param("fin") LocalDateTime fin);
}