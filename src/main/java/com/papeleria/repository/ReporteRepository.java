package com.papeleria.repository;

import com.papeleria.dto.ReporteProductoDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public class ReporteRepository {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public BigDecimal getTotalVentasPorPeriodo(LocalDateTime inicio, LocalDateTime fin) {
        String sql = "SELECT COALESCE(SUM(total), 0) FROM compra WHERE fecha_hora BETWEEN ? AND ?";
        return jdbcTemplate.queryForObject(sql, new Object[]{inicio, fin}, BigDecimal.class);
    }

    public List<ReporteProductoDTO> getProductosMasVendidos(LocalDateTime inicio, LocalDateTime fin, int limit) {
        String sql = "SELECT p.id_producto, p.nombre, c.nombre as categoria, " +
                     "SUM(d.cantidad) as cantidad_vendida, " +
                     "SUM(d.cantidad * d.precio_unitario) as total_vendido " +
                     "FROM detalle_venta d " +
                     "JOIN producto p ON d.id_producto = p.id_producto " +
                     "LEFT JOIN categoria c ON p.id_categoria = c.id_categoria " +
                     "JOIN venta v ON d.id_venta = v.id_venta " +
                     "WHERE v.fecha_hora BETWEEN ? AND ? " +
                     "GROUP BY p.id_producto, p.nombre, c.nombre " +
                     "ORDER BY cantidad_vendida DESC LIMIT ?";
        
        return jdbcTemplate.query(sql, new Object[]{inicio, fin, limit}, (rs, rowNum) -> {
            ReporteProductoDTO dto = new ReporteProductoDTO();
            dto.setIdProducto(rs.getInt("id_producto"));
            dto.setNombre(rs.getString("nombre"));
            dto.setCategoria(rs.getString("categoria"));
            dto.setCantidadVendida(rs.getLong("cantidad_vendida"));
            dto.setTotalVendido(rs.getBigDecimal("total_vendido"));
            return dto;
        });
    }

    public List<ReporteProductoDTO> getProductosConStockBajo() {
        String sql = "SELECT p.id_producto, p.nombre, c.nombre as categoria, " +
                     "p.stock_actual, p.stock_minimo, p.precio_compra, p.precio_venta " +
                     "FROM producto p " +
                     "LEFT JOIN categoria c ON p.id_categoria = c.id_categoria " +
                     "WHERE p.stock_actual <= p.stock_minimo AND p.activo = true " +
                     "ORDER BY (p.stock_minimo - p.stock_actual) DESC";
        
        return jdbcTemplate.query(sql, (rs, rowNum) -> {
            ReporteProductoDTO dto = new ReporteProductoDTO();
            dto.setIdProducto(rs.getInt("id_producto"));
            dto.setNombre(rs.getString("nombre"));
            dto.setCategoria(rs.getString("categoria"));
            dto.setStockActual(rs.getInt("stock_actual"));
            dto.setStockMinimo(rs.getInt("stock_minimo"));
            dto.setPrecioCompra(rs.getBigDecimal("precio_compra"));
            dto.setPrecioVenta(rs.getBigDecimal("precio_venta"));
            return dto;
        });
    }
}