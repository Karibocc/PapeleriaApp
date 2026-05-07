package com.papeleria.service.patterns.decorator;

import com.papeleria.service.patterns.bridge.Reporte;

public class ReporteOrdenado extends ReporteDecorator {
    private String campo; // "fecha", "total", etc.

    public ReporteOrdenado(Reporte reporte, String campo) {
        super(reporte);
        this.campo = campo;
    }

    @Override
    public byte[] generar() {
        // Ordenar datos antes de generar
        return super.generar();
    }
}
