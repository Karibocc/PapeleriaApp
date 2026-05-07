package com.papeleria.service.patterns.decorator;

import com.papeleria.service.patterns.bridge.Reporte;

public abstract class ReporteDecorator extends Reporte {
    protected Reporte reporteDecorado;

    public ReporteDecorator(Reporte reporte) {
        super(reporte.getFormato());  
    }

    @Override
    public byte[] generar() {
        return reporteDecorado.generar();
    }
}