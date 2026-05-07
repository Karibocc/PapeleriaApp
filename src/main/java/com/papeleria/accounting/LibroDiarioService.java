package com.papeleria.accounting;

import com.papeleria.entity.Compra;
import com.papeleria.entity.Venta;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Servicio que registra asientos contables (libro diario).
 * En una versión real, estos asientos se persistirían en una tabla específica.
 */
@Service
public class LibroDiarioService {

    private List<AsientoContable> asientos = new ArrayList<>();

    /**
     * Registra un asiento contable a partir de una venta.
     * @param venta venta realizada
     */
    public void registrarVenta(Venta venta) {
        AsientoContable asiento = new AsientoContable();
        asiento.fecha = venta.getFechaHora();
        asiento.descripcion = "Venta N° " + venta.getIdVenta();
        asiento.debe = BigDecimal.ZERO;       // según naturaleza de cuenta
        asiento.haber = calcularTotalVenta(venta);
        asientos.add(asiento);
        System.out.println("Asiento registrado para venta " + venta.getIdVenta());
    }

    /**
     * Registra un asiento contable a partir de una compra a proveedor.
     * @param compra compra registrada
     */
    public void registrarCompra(Compra compra) {
        AsientoContable asiento = new AsientoContable();
        asiento.fecha = compra.getFechaHora();
        asiento.descripcion = "Compra a proveedor N° " + compra.getIdCompra();
        asiento.debe = calcularTotalCompra(compra);
        asiento.haber = BigDecimal.ZERO;
        asientos.add(asiento);
        System.out.println("Asiento registrado para compra " + compra.getIdCompra());
    }

    /**
     * Obtiene la lista de todos los asientos registrados.
     * @return lista de asientos
     */
    public List<AsientoContable> obtenerAsientos() {
        return new ArrayList<>(asientos);
    }

    private BigDecimal calcularTotalVenta(Venta venta) {
        BigDecimal subtotal = venta.getDetalles().stream()
                .map(d -> d.getPrecioUnitario()
                        .multiply(BigDecimal.valueOf(d.getCantidad()))
                        .subtract(d.getDescuento()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return subtotal.add(venta.getImpuesto()).subtract(venta.getDescuento());
    }

    private BigDecimal calcularTotalCompra(Compra compra) {
        BigDecimal subtotal = compra.getDetalles().stream()
                .map(d -> d.getCostoUnitario().multiply(BigDecimal.valueOf(d.getCantidad())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return subtotal.add(compra.getImpuesto());
    }

    // Clase interna para representar un asiento contable simple
    public static class AsientoContable {
        private LocalDateTime fecha;
        private String descripcion;
        private BigDecimal debe;
        private BigDecimal haber;

        // Getters (puedes generarlos si los necesitas)
        public LocalDateTime getFecha() { return fecha; }
        public String getDescripcion() { return descripcion; }
        public BigDecimal getDebe() { return debe; }
        public BigDecimal getHaber() { return haber; }
    }
}