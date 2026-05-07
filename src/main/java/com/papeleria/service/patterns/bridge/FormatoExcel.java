package com.papeleria.service.patterns.bridge;

import com.papeleria.entity.Producto;
import com.papeleria.entity.Venta;
import java.util.List;

public class FormatoExcel implements FormatoExportacion {
    @Override
    public byte[] exportarVentas(List<Venta> ventas) {
        // Lógica con Apache POI
        return new byte[0];
    }

    @Override
    public byte[] exportarProductos(List<Producto> productos) {
        return new byte[0];
    }
}
