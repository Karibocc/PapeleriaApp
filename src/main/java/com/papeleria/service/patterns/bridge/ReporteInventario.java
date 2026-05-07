package com.papeleria.service.patterns.bridge;

import com.papeleria.entity.Producto;
import java.util.List;

public class ReporteInventario extends Reporte {
    private List<Producto> productos;

    public ReporteInventario(FormatoExportacion formato, List<Producto> productos) {
        super(formato);
        this.productos = productos;
    }

    @Override
    public byte[] generar() {
        return formato.exportarProductos(productos);
    }
}
