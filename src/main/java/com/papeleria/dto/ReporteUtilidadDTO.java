package com.papeleria.dto;

import java.math.BigDecimal;

public class ReporteUtilidadDTO {
    private String periodo;
    private BigDecimal ingresos;
    private BigDecimal costos;
    private BigDecimal utilidad;
    private BigDecimal margen;

    public ReporteUtilidadDTO() {}

    public String getPeriodo() { return periodo; }
    public void setPeriodo(String periodo) { this.periodo = periodo; }
    public BigDecimal getIngresos() { return ingresos; }
    public void setIngresos(BigDecimal ingresos) { this.ingresos = ingresos; }
    public BigDecimal getCostos() { return costos; }
    public void setCostos(BigDecimal costos) { this.costos = costos; }
    public BigDecimal getUtilidad() { return utilidad; }
    public void setUtilidad(BigDecimal utilidad) { this.utilidad = utilidad; }
    public BigDecimal getMargen() { return margen; }
    public void setMargen(BigDecimal margen) { this.margen = margen; }
}