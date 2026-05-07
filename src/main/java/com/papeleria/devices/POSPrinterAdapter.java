package com.papeleria.devices;

import com.papeleria.entity.Venta;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;

/**
 * Adaptador para impresora POS (punto de venta) - tickets.
 * Envía comandos ESC/POS.
 */
@Component
public class POSPrinterAdapter {

    /**
     * Imprime el ticket de una venta.
     * @param venta venta realizada
     */
    public void imprimirTicket(Venta venta) {
        StringBuilder ticket = new StringBuilder();
        ticket.append("=============================\n");
        ticket.append("       TICKET DE VENTA       \n");
        ticket.append("=============================\n");
        ticket.append("Factura N°: ").append(venta.getIdVenta()).append("\n");
        ticket.append("Fecha: ").append(venta.getFechaHora()).append("\n");
        ticket.append("Cliente: ");
        ticket.append(venta.getCliente() != null ? venta.getCliente().getNombre() : "Mostrador");
        ticket.append("\n");
        ticket.append("Vendedor: ").append(venta.getUsuario().getNombreCompleto()).append("\n");
        ticket.append("-----------------------------\n");
        ticket.append("CANT | PRODUCTO          | P.U. | TOTAL\n");
        ticket.append("-----------------------------\n");

        for (var detalle : venta.getDetalles()) {
            BigDecimal subtotal = detalle.getPrecioUnitario()
                    .multiply(BigDecimal.valueOf(detalle.getCantidad()))
                    .subtract(detalle.getDescuento());
            ticket.append(String.format("%-4d | %-16s | $%4.2f | $%6.2f\n",
                    detalle.getCantidad(),
                    detalle.getProducto().getNombre().length() > 16 ?
                            detalle.getProducto().getNombre().substring(0, 13) + "..." :
                            detalle.getProducto().getNombre(),
                    detalle.getPrecioUnitario(),
                    subtotal));
        }

        ticket.append("-----------------------------\n");
        ticket.append("Subtotal: $").append(calcularSubtotal(venta)).append("\n");
        ticket.append("Descuento: $").append(venta.getDescuento()).append("\n");
        ticket.append("Impuesto: $").append(venta.getImpuesto()).append("\n");
        ticket.append("TOTAL: $").append(calcularTotal(venta)).append("\n");
        ticket.append("Monto pagado: $").append(venta.getMontoPagado()).append("\n");
        ticket.append("Cambio: $").append(venta.getMontoPagado().subtract(calcularTotal(venta))).append("\n");
        ticket.append("=============================\n");
        ticket.append("   ¡Gracias por su compra!   \n");
        ticket.append("=============================\n");

        System.out.println(ticket.toString());

        // En entorno real, enviar estos bytes a la impresora térmica
        // Ejemplo usando javax.print o comandos ESC/POS
    }

    private BigDecimal calcularSubtotal(Venta venta) {
        return venta.getDetalles().stream()
                .map(d -> d.getPrecioUnitario()
                        .multiply(BigDecimal.valueOf(d.getCantidad()))
                        .subtract(d.getDescuento()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal calcularTotal(Venta venta) {
        return calcularSubtotal(venta).add(venta.getImpuesto()).subtract(venta.getDescuento());
    }
}