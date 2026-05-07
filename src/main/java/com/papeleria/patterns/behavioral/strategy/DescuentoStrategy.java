package com.papeleria.patterns.behavioral.strategy;

import java.math.BigDecimal;

public interface DescuentoStrategy {
    BigDecimal aplicarDescuento(BigDecimal total);
}