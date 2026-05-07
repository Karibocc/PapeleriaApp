package com.papeleria.patterns.creational;

import com.papeleria.entity.Producto;
import com.papeleria.entity.Venta;
import com.papeleria.service.patterns.bridge.FormatoExportacion;
import com.papeleria.service.patterns.bridge.Reporte;
import com.papeleria.service.patterns.bridge.ReporteVentas;
import com.papeleria.service.patterns.bridge.ReporteInventario;

import java.util.List;

public class ReporteFactory {

    /**
     * Crea un reporte de ventas con el formato especificado.
     */
    public static Reporte crearReporteVentas(FormatoExportacion formato, List<Venta> ventas) {
        return new ReporteVentas(formato, ventas);
    }

    /**
     * Crea un reporte de inventario con el formato especificado.
     */
    public static Reporte crearReporteInventario(FormatoExportacion formato, List<Producto> productos) {
        return new ReporteInventario(formato, productos);
    }

    // Aquí se pueden añadir más métodos para otros tipos de reportes:
    // - Reporte de clientes
    // - Reporte de proveedores
    // - Reporte de compras, etc.
}