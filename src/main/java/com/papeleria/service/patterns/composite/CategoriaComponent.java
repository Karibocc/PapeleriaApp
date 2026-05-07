package com.papeleria.service.patterns.composite;

import java.math.BigDecimal;

public interface CategoriaComponent {
    String getNombre();
    BigDecimal getPrecioTotal();
    void mostrar();
}