package com.papeleria.service.patterns.bridge;

public abstract class Reporte {
    protected FormatoExportacion formato;

    public Reporte(FormatoExportacion formato) {
        this.formato = formato;
    }

    public FormatoExportacion getFormato() {
        return formato;
    }

    public abstract byte[] generar();
}