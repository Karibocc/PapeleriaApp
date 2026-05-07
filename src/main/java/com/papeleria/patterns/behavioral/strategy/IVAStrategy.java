package com.papeleria.patterns.behavioral.strategy;

import java.math.BigDecimal;

public class IVAStrategy implements ImpuestoStrategy {
    private static final BigDecimal IVA = new BigDecimal("0.19");

    @Override
    public BigDecimal calcularImpuesto(BigDecimal subtotal) {
        return subtotal.multiply(IVA);
    }
}