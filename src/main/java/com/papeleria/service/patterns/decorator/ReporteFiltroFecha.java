package com.papeleria.service.patterns.decorator;

import com.papeleria.entity.Venta;
import com.papeleria.service.patterns.bridge.Reporte;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

public class ReporteFiltroFecha extends ReporteDecorator {
    private LocalDate fechaInicio;
    private LocalDate fechaFin;

    public ReporteFiltroFecha(Reporte reporte, LocalDate inicio, LocalDate fin) {
        super(reporte);
        this.fechaInicio = inicio;
        this.fechaFin = fin;
    }

    @Override
    public byte[] generar() {
        // Si el reporte decorado es un ReporteVentas, podríamos filtrar sus datos.
        // En una implementación real, el reporte debería exponer sus datos.
        // Aquí se muestra la idea.
        return super.generar();
    }
}