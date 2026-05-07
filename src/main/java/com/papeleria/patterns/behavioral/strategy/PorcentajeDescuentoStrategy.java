package com.papeleria.patterns.behavioral.strategy;

import java.math.BigDecimal;

public class PorcentajeDescuentoStrategy implements DescuentoStrategy {
    private BigDecimal porcentaje;

    public PorcentajeDescuentoStrategy(BigDecimal porcentaje) {
        this.porcentaje = porcentaje;
    }

    @Override
    public BigDecimal aplicarDescuento(BigDecimal total) {
        return total.multiply(BigDecimal.ONE.subtract(porcentaje));
    }
}