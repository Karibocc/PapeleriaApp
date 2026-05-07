package com.papeleria.patterns.behavioral.strategy;

import java.math.BigDecimal;

public class SinDescuentoStrategy implements DescuentoStrategy {
    @Override
    public BigDecimal aplicarDescuento(BigDecimal total) {
        return total;
    }
}