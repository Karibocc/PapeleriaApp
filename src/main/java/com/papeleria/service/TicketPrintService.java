package com.papeleria.service;

import com.papeleria.entity.Venta;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.print.*;
import javax.print.attribute.HashPrintRequestAttributeSet;
import javax.print.attribute.PrintRequestAttributeSet;
import javax.print.attribute.standard.Copies;
import java.awt.*;
import java.awt.print.*;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class TicketPrintService {

    @Value("${pos.printer.name:XP-58IIH}")
    private String printerName;

    private static final int PAPER_WIDTH = 180;

    public void printTicket(Venta venta) {
        try {
            javax.print.PrintService printer = findPrinter(printerName);
            if (printer == null) {
                throw new RuntimeException("Impresora POS no encontrada: " + printerName);
            }

            // Calcular subtotal, total y cambio
            BigDecimal subtotal = venta.getDetalles().stream()
                    .map(d -> d.getPrecioUnitario()
                            .multiply(BigDecimal.valueOf(d.getCantidad()))
                            .subtract(d.getDescuento()))
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal total = subtotal.add(venta.getImpuesto()).subtract(venta.getDescuento());
            BigDecimal cambio = venta.getMontoPagado().subtract(total);

            Printable printable = (graphics, pageFormat, pageIndex) -> {
                if (pageIndex > 0) return Printable.NO_SUCH_PAGE;
                Graphics2D g2d = (Graphics2D) graphics;
                g2d.translate(0, 0);
                g2d.scale(1.0, 1.0);

                Font font = new Font("Monospaced", Font.PLAIN, 9);
                g2d.setFont(font);
                FontMetrics metrics = g2d.getFontMetrics();
                int lineHeight = metrics.getHeight();
                int y = 10;

                java.util.function.BiConsumer<String, Integer> printCentered = (text, yPos) -> {
                    int x = (PAPER_WIDTH - metrics.stringWidth(text)) / 2;
                    g2d.drawString(text, x, yPos);
                };

                printCentered.accept("PAPELERÍA APP", y);
                y += lineHeight;
                printCentered.accept("==============================", y);
                y += lineHeight;
                y = printLine(g2d, "Factura: " + venta.getIdVenta(), y, font);
                y = printLine(g2d, "Fecha: " + formatDate(venta.getFechaHora()), y, font);
                y = printLine(g2d, "Cliente: " + (venta.getCliente() != null ? venta.getCliente().getNombre() : "Cliente Mostrador"), y, font);
                y = printLine(g2d, "Vendedor: " + venta.getUsuario().getNombreCompleto(), y, font);
                y = printLine(g2d, "--------------------------------", y, font);
                y = printLine(g2d, "CANT | PRODUCTO          | TOTAL", y, font);
                y = printLine(g2d, "--------------------------------", y, font);

                for (var detalle : venta.getDetalles()) {
                    String nombre = truncate(detalle.getProducto().getNombre(), 16);
                    String cantidad = String.format("%-4s", detalle.getCantidad());
                    BigDecimal lineaTotal = detalle.getPrecioUnitario()
                            .multiply(BigDecimal.valueOf(detalle.getCantidad()))
                            .subtract(detalle.getDescuento());
                    String totalStr = String.format("%6s", formatCOP(lineaTotal));

                    g2d.drawString(cantidad, 10, y);
                    g2d.drawString(nombre, 50, y);
                    g2d.drawString(totalStr, PAPER_WIDTH - 50, y);
                    y += lineHeight;
                }

                y = printLine(g2d, "--------------------------------", y, font);
                y = printLine(g2d, "SUBTOTAL:      " + formatCOP(subtotal), y, font);
                y = printLine(g2d, "DESCUENTO:     " + formatCOP(venta.getDescuento()), y, font);
                y = printLine(g2d, "IMPUESTO:      " + formatCOP(venta.getImpuesto()), y, font);
                y = printLine(g2d, "TOTAL:         " + formatCOP(total), y, font);
                y = printLine(g2d, "--------------------------------", y, font);
                y = printLine(g2d, "PAGADO:        " + formatCOP(venta.getMontoPagado()), y, font);
                y = printLine(g2d, "CAMBIO:        " + formatCOP(cambio), y, font);
                y = printLine(g2d, "====================================", y, font);
                printCentered.accept("¡GRACIAS POR SU COMPRA!", y);
                y += lineHeight;
                printCentered.accept("www.mipapeleria.com", y);

                return Printable.PAGE_EXISTS;
            };

            Book book = new Book();
            PageFormat pf = new PageFormat();
            pf.setOrientation(PageFormat.PORTRAIT);
            Paper paper = new Paper();
            paper.setSize(PAPER_WIDTH, 5000);
            paper.setImageableArea(0, 0, PAPER_WIDTH, 5000);
            pf.setPaper(paper);
            book.append(printable, pf);

            PrintRequestAttributeSet aset = new HashPrintRequestAttributeSet();
            aset.add(new Copies(1));
            DocPrintJob job = printer.createPrintJob();
            Doc doc = new SimpleDoc(book, DocFlavor.SERVICE_FORMATTED.PRINTABLE, null);
            job.print(doc, aset);

            System.out.println("Ticket impreso correctamente.");

        } catch (PrintException e) {
            System.err.println("Error de impresión: " + e.getMessage());
            e.printStackTrace();
        } catch (Exception e) {
            System.err.println("Error inesperado al imprimir: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private javax.print.PrintService findPrinter(String printerName) {
        javax.print.PrintService[] services = PrintServiceLookup.lookupPrintServices(null, null);
        if (services != null) {
            for (javax.print.PrintService service : services) {
                if (service.getName().toLowerCase().contains(printerName.toLowerCase())) {
                    return service;
                }
            }
            System.err.println("Impresora '" + printerName + "' no encontrada. Impresoras disponibles:");
            for (javax.print.PrintService service : services) {
                System.err.println("  - " + service.getName());
            }
        } else {
            System.err.println("No se pudo obtener la lista de impresoras.");
        }
        // Fallback a impresora predeterminada del sistema
        javax.print.PrintService defaultPrinter = PrintServiceLookup.lookupDefaultPrintService();
        if (defaultPrinter != null) {
            System.err.println("Usando impresora predeterminada: " + defaultPrinter.getName());
        }
        return defaultPrinter;
    }

    private int printLine(Graphics2D g, String text, int y, Font font) {
        g.drawString(text, 10, y);
        return y + g.getFontMetrics(font).getHeight();
    }

    private String formatCOP(BigDecimal value) {
        if (value == null) value = BigDecimal.ZERO;
        return String.format("$%,.0f", value.setScale(0, RoundingMode.HALF_UP));
    }

    private String formatDate(LocalDateTime date) {
        return date.format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss"));
    }

    private String truncate(String str, int length) {
        if (str == null) return "";
        if (str.length() <= length) return str;
        return str.substring(0, length - 3) + "...";
    }
}