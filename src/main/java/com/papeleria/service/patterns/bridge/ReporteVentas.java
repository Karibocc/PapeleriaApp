package com.papeleria.service.patterns.bridge;

import com.papeleria.entity.Venta;
import java.util.List;

public class ReporteVentas extends Reporte {
    private List<Venta> ventas;

    public ReporteVentas(FormatoExportacion formato, List<Venta> ventas) {
        super(formato);
        this.ventas = ventas;
    }

    @Override
    public byte[] generar() {
        return formato.exportarVentas(ventas);
    }
}