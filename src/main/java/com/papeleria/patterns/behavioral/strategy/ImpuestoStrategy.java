package com.papeleria.patterns.behavioral.strategy;

import java.math.BigDecimal;

public interface ImpuestoStrategy {
    BigDecimal calcularImpuesto(BigDecimal subtotal);
}
