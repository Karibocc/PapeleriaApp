package com.papeleria.service.patterns.bridge;

import com.papeleria.entity.Producto;
import com.papeleria.entity.Venta;
import java.util.List;

public class FormatoPDF implements FormatoExportacion {
    @Override
    public byte[] exportarVentas(List<Venta> ventas) {
        // Lógica real con OpenPDF para generar PDF
        return new byte[0]; // placeholder
    }

    @Override
    public byte[] exportarProductos(List<Producto> productos) {
        return new byte[0];
    }
}