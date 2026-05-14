package com.papeleria.service;

import com.papeleria.dto.*;
import com.papeleria.entity.DetalleVenta;
import com.papeleria.entity.Producto;
import com.papeleria.entity.Venta;
import com.papeleria.entity.Compra;
import com.papeleria.repository.VentaRepository;
import com.papeleria.repository.CompraRepository;
import com.papeleria.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReporteService {

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private CompraRepository compraRepository;

    @Autowired
    private ProductoRepository productoRepository;

    public List<ReporteVentaDTO> reporteVentasPorPeriodo(LocalDate fechaInicio, LocalDate fechaFin) {
        LocalDateTime inicio = fechaInicio.atStartOfDay();
        LocalDateTime fin = fechaFin.atTime(LocalTime.MAX);

        List<Venta> ventas = ventaRepository.findByFechaHoraBetween(inicio, fin);

        return ventas.stream()
                .collect(Collectors.groupingBy(v -> v.getFechaHora().toLocalDate()))
                .entrySet().stream()
                .map(entry -> {
                    LocalDate fecha = entry.getKey();
                    List<Venta> ventasDelDia = entry.getValue();

                    long cantidadVentas = ventasDelDia.size();
                    BigDecimal totalIngresos = ventasDelDia.stream()
                            .map(this::calcularTotalVenta)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    BigDecimal totalUtilidad = ventasDelDia.stream()
                            .flatMap(v -> v.getDetalles().stream())
                            .map(this::calcularUtilidadDetalle)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return new ReporteVentaDTO(fecha, cantidadVentas, totalIngresos, totalUtilidad);
                })
                .collect(Collectors.toList());
    }

    public List<ReporteCompraDTO> getReporteCompras(LocalDate fechaInicio, LocalDate fechaFin) {
        LocalDateTime inicio = fechaInicio.atStartOfDay();
        LocalDateTime fin = fechaFin.atTime(LocalTime.MAX);
        
        List<Compra> compras = compraRepository.findComprasPorFecha(inicio, fin);
        List<ReporteCompraDTO> reportes = new ArrayList<>();
        
        for (Compra compra : compras) {
            ReporteCompraDTO dto = new ReporteCompraDTO();
            dto.setIdCompra(compra.getIdCompra());
            dto.setFechaHora(compra.getFechaHora());
            dto.setProveedor(compra.getProveedor() != null ? compra.getProveedor().getNombre() : "N/A");
            dto.setComprador(compra.getUsuario() != null ? compra.getUsuario().getNombreCompleto() : "N/A");
            dto.setNumeroFactura(compra.getNumeroFactura());
            dto.setSubtotal(compra.getSubtotal());
            dto.setImpuesto(compra.getImpuesto());
            dto.setDescuento(compra.getDescuento());
            dto.setTotal(compra.getTotal());
            reportes.add(dto);
        }
        
        return reportes;
    }

    public List<ReporteProductoDTO> getProductosMasVendidos(LocalDate fechaInicio, LocalDate fechaFin, int limit) {
        LocalDateTime inicio = fechaInicio.atStartOfDay();
        LocalDateTime fin = fechaFin.atTime(LocalTime.MAX);
        
        List<Object[]> results = ventaRepository.findProductosMasVendidos(inicio, fin, limit);
        List<ReporteProductoDTO> reportes = new ArrayList<>();
        
        for (Object[] row : results) {
            ReporteProductoDTO dto = new ReporteProductoDTO();
            dto.setIdProducto((Integer) row[0]);
            dto.setNombre((String) row[1]);
            dto.setCategoria(row[2] != null ? (String) row[2] : "Sin categoría");
            dto.setCantidadVendida((Long) row[3]);
            dto.setTotalVendido((BigDecimal) row[4]);
            reportes.add(dto);
        }
        
        return reportes;
    }

    public List<ReporteProductoDTO> getProductosConStockBajo() {
        List<Producto> productos = productoRepository.findAll();
        List<ReporteProductoDTO> reportes = new ArrayList<>();
        
        for (Producto p : productos) {
            if (p.getStockActual() <= p.getStockMinimo()) {
                ReporteProductoDTO dto = new ReporteProductoDTO();
                dto.setIdProducto(p.getIdProducto());
                dto.setNombre(p.getNombre());
                dto.setCategoria(p.getCategoria() != null ? p.getCategoria().getNombre() : "Sin categoría");
                dto.setStockActual(p.getStockActual());
                dto.setStockMinimo(p.getStockMinimo());
                dto.setPrecioCompra(p.getPrecioCompra());
                dto.setPrecioVenta(p.getPrecioVenta());
                reportes.add(dto);
            }
        }
        
        return reportes;
    }

    public List<ReporteProductoDTO> getInventarioCompleto() {
        List<Producto> productos = productoRepository.findAll();
        List<ReporteProductoDTO> reportes = new ArrayList<>();
        
        for (Producto p : productos) {
            ReporteProductoDTO dto = new ReporteProductoDTO();
            dto.setIdProducto(p.getIdProducto());
            dto.setNombre(p.getNombre());
            dto.setCategoria(p.getCategoria() != null ? p.getCategoria().getNombre() : "Sin categoría");
            dto.setStockActual(p.getStockActual());
            dto.setStockMinimo(p.getStockMinimo());
            dto.setPrecioCompra(p.getPrecioCompra());
            dto.setPrecioVenta(p.getPrecioVenta());
            reportes.add(dto);
        }
        
        return reportes;
    }

    // ==================== MÉTODOS CORREGIDOS PARA UTILIDAD ====================

    public List<ReporteUtilidadDTO> getUtilidadPorMes(int year) {
        List<ReporteUtilidadDTO> reportes = new ArrayList<>();
        
        for (int month = 1; month <= 12; month++) {
            LocalDateTime inicio = LocalDateTime.of(year, month, 1, 0, 0);
            LocalDateTime fin = inicio.plusMonths(1).minusSeconds(1);
            
            BigDecimal ingresos = ventaRepository.sumTotalVentasPorFecha(inicio, fin);
            BigDecimal utilidad = ventaRepository.sumUtilidadPorFecha(inicio, fin);
            BigDecimal costos = ingresos.subtract(utilidad);
            BigDecimal margen = ingresos.compareTo(BigDecimal.ZERO) > 0 ? 
                utilidad.divide(ingresos, 4, RoundingMode.HALF_UP).multiply(new BigDecimal(100)) : BigDecimal.ZERO;
            
            ReporteUtilidadDTO dto = new ReporteUtilidadDTO();
            dto.setPeriodo(year + "-" + String.format("%02d", month));
            dto.setIngresos(ingresos != null ? ingresos : BigDecimal.ZERO);
            dto.setCostos(costos != null ? costos : BigDecimal.ZERO);
            dto.setUtilidad(utilidad != null ? utilidad : BigDecimal.ZERO);
            dto.setMargen(margen);
            reportes.add(dto);
        }
        
        return reportes;
    }

    public ReporteUtilidadDTO getUtilidadPorRango(LocalDate fechaInicio, LocalDate fechaFin) {
        LocalDateTime inicio = fechaInicio.atStartOfDay();
        LocalDateTime fin = fechaFin.atTime(LocalTime.MAX);
        
        BigDecimal ingresos = ventaRepository.sumTotalVentasPorFecha(inicio, fin);
        BigDecimal utilidad = ventaRepository.sumUtilidadPorFecha(inicio, fin);
        BigDecimal costos = ingresos.subtract(utilidad);
        BigDecimal margen = ingresos.compareTo(BigDecimal.ZERO) > 0 ? 
            utilidad.divide(ingresos, 4, RoundingMode.HALF_UP).multiply(new BigDecimal(100)) : BigDecimal.ZERO;
        
        ReporteUtilidadDTO dto = new ReporteUtilidadDTO();
        dto.setPeriodo(fechaInicio + " al " + fechaFin);
        dto.setIngresos(ingresos != null ? ingresos : BigDecimal.ZERO);
        dto.setCostos(costos != null ? costos : BigDecimal.ZERO);
        dto.setUtilidad(utilidad != null ? utilidad : BigDecimal.ZERO);
        dto.setMargen(margen);
        
        return dto;
    }

    // ==================== MÉTODOS OPTIMIZADOS PARA RESUMEN ====================

    public Map<String, Object> getResumen() {
        Map<String, Object> resumen = new HashMap<>();
        
        LocalDateTime inicioHoy = LocalDate.now().atStartOfDay();
        LocalDateTime finHoy = LocalDate.now().atTime(LocalTime.MAX);
        
        LocalDateTime inicioMes = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime finMes = LocalDate.now().atTime(LocalTime.MAX);
        
        BigDecimal ventasHoy = ventaRepository.sumTotalVentasPorFecha(inicioHoy, finHoy);
        BigDecimal ventasMes = ventaRepository.sumTotalVentasPorFecha(inicioMes, finMes);
        BigDecimal comprasHoy = getTotalCompras(inicioHoy, finHoy);
        BigDecimal comprasMes = getTotalCompras(inicioMes, finMes);
        
        resumen.put("ventasHoy", ventasHoy != null ? ventasHoy : BigDecimal.ZERO);
        resumen.put("ventasMes", ventasMes != null ? ventasMes : BigDecimal.ZERO);
        resumen.put("comprasHoy", comprasHoy != null ? comprasHoy : BigDecimal.ZERO);
        resumen.put("comprasMes", comprasMes != null ? comprasMes : BigDecimal.ZERO);
        resumen.put("productosStockBajo", getProductosConStockBajo().size());
        
        return resumen;
    }

    // ==================== MÉTODOS PRIVADOS ====================

    private BigDecimal calcularTotalVenta(Venta venta) {
        BigDecimal subtotal = venta.getDetalles().stream()
                .map(d -> d.getPrecioUnitario()
                        .multiply(BigDecimal.valueOf(d.getCantidad()))
                        .subtract(d.getDescuento()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return subtotal.add(venta.getImpuesto()).subtract(venta.getDescuento());
    }

    private BigDecimal calcularUtilidadDetalle(DetalleVenta detalle) {
        Producto producto = detalle.getProducto();
        BigDecimal costoTotal = producto.getPrecioCompra()
                .multiply(BigDecimal.valueOf(detalle.getCantidad()));
        BigDecimal ingresoTotal = detalle.getPrecioUnitario()
                .multiply(BigDecimal.valueOf(detalle.getCantidad()))
                .subtract(detalle.getDescuento());
        return ingresoTotal.subtract(costoTotal);
    }

    private BigDecimal getTotalCompras(LocalDateTime inicio, LocalDateTime fin) {
        List<Compra> compras = compraRepository.findComprasPorFecha(inicio, fin);
        BigDecimal total = BigDecimal.ZERO;
        for (Compra c : compras) {
            total = total.add(c.getTotal());
        }
        return total;
    }
}