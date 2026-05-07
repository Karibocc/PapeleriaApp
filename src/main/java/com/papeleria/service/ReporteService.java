package com.papeleria.service;

import com.papeleria.dto.ReporteVentaDTO;
import com.papeleria.entity.DetalleVenta;
import com.papeleria.entity.Producto;
import com.papeleria.entity.Venta;
import com.papeleria.repository.VentaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReporteService {

    @Autowired
    private VentaRepository ventaRepository;

    /**
     * Genera un reporte de ventas agrupado por día, con total de ingresos y utilidad bruta.
     *
     * @param fechaInicio fecha inicial del período (incluida)
     * @param fechaFin    fecha final del período (incluida)
     * @return lista de DTOs con los datos del reporte
     */
    public List<ReporteVentaDTO> reporteVentasPorPeriodo(LocalDate fechaInicio, LocalDate fechaFin) {
        LocalDateTime inicio = fechaInicio.atStartOfDay();
        LocalDateTime fin = fechaFin.atTime(LocalTime.MAX);

        List<Venta> ventas = ventaRepository.findByFechaHoraBetween(inicio, fin);

        // Agrupar por día
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

    /**
     * Calcula el total de una venta (subtotal + impuesto - descuento global).
     */
    private BigDecimal calcularTotalVenta(Venta venta) {
        BigDecimal subtotal = venta.getDetalles().stream()
                .map(d -> d.getPrecioUnitario()
                        .multiply(BigDecimal.valueOf(d.getCantidad()))
                        .subtract(d.getDescuento()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return subtotal.add(venta.getImpuesto()).subtract(venta.getDescuento());
    }

    /**
     * Calcula la utilidad de un detalle de venta (ingreso - costo).
     */
    private BigDecimal calcularUtilidadDetalle(DetalleVenta detalle) {
        Producto producto = detalle.getProducto();
        BigDecimal costoTotal = producto.getPrecioCompra()
                .multiply(BigDecimal.valueOf(detalle.getCantidad()));
        BigDecimal ingresoTotal = detalle.getPrecioUnitario()
                .multiply(BigDecimal.valueOf(detalle.getCantidad()))
                .subtract(detalle.getDescuento());
        return ingresoTotal.subtract(costoTotal);
    }
}