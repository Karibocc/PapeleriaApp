package com.papeleria.accounting;

import com.papeleria.repository.VentaRepository;
import com.papeleria.repository.CompraRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class ReporteContableService {

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private CompraRepository compraRepository;

    public BigDecimal calcularUtilidadDiaria(LocalDate fecha) {
        LocalDateTime inicio = fecha.atStartOfDay();
        LocalDateTime fin = fecha.atTime(LocalTime.MAX);

        BigDecimal ingresos = ventaRepository.findByFechaHoraBetween(inicio, fin).stream()
                .map(this::calcularTotalVenta)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal costoVentas = compraRepository.findAll().stream()
                .filter(c -> c.getFechaHora().isAfter(inicio) && c.getFechaHora().isBefore(fin))
                .map(this::calcularTotalCompra)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return ingresos.subtract(costoVentas);
    }

    public Map<String, BigDecimal> reporteMensual(int year, int month) {
        LocalDateTime inicio = LocalDateTime.of(year, month, 1, 0, 0);
        LocalDateTime fin = inicio.plusMonths(1).minusSeconds(1);

        BigDecimal ingresos = ventaRepository.findByFechaHoraBetween(inicio, fin).stream()
                .map(this::calcularTotalVenta)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal costos = compraRepository.findAll().stream()
                .filter(c -> c.getFechaHora().isAfter(inicio) && c.getFechaHora().isBefore(fin))
                .map(this::calcularTotalCompra)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal utilidad = ingresos.subtract(costos);

        Map<String, BigDecimal> reporte = new HashMap<>();
        reporte.put("ingresos", ingresos);
        reporte.put("costos", costos);
        reporte.put("utilidad", utilidad);
        return reporte;
    }

    private BigDecimal calcularTotalVenta(com.papeleria.entity.Venta venta) {
        BigDecimal subtotal = venta.getDetalles().stream()
                .map(d -> d.getPrecioUnitario()
                        .multiply(BigDecimal.valueOf(d.getCantidad()))
                        .subtract(d.getDescuento()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return subtotal.add(venta.getImpuesto()).subtract(venta.getDescuento());
    }

    private BigDecimal calcularTotalCompra(com.papeleria.entity.Compra compra) {
        BigDecimal subtotal = compra.getDetalles().stream()
                .map(d -> d.getPrecioUnitario().multiply(BigDecimal.valueOf(d.getCantidad())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return subtotal.add(compra.getImpuesto());
    }
}