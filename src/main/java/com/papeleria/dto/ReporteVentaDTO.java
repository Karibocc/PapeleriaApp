package com.papeleria.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ReporteVentaDTO {
    private LocalDate fecha;
    private Long cantidadVentas;
    private BigDecimal totalIngresos;
    private BigDecimal totalUtilidad;

    public ReporteVentaDTO() {}

    public ReporteVentaDTO(LocalDate fecha, Long cantidadVentas, BigDecimal totalIngresos, BigDecimal totalUtilidad) {
        this.fecha = fecha;
        this.cantidadVentas = cantidadVentas;
        this.totalIngresos = totalIngresos;
        this.totalUtilidad = totalUtilidad;
    }

    // Getters y Setters
    public LocalDate getFecha() { return fecha; }
    public void setFecha(LocalDate fecha) { this.fecha = fecha; }
    public Long getCantidadVentas() { return cantidadVentas; }
    public void setCantidadVentas(Long cantidadVentas) { this.cantidadVentas = cantidadVentas; }
    public BigDecimal getTotalIngresos() { return totalIngresos; }
    public void setTotalIngresos(BigDecimal totalIngresos) { this.totalIngresos = totalIngresos; }
    public BigDecimal getTotalUtilidad() { return totalUtilidad; }
    public void setTotalUtilidad(BigDecimal totalUtilidad) { this.totalUtilidad = totalUtilidad; }
}