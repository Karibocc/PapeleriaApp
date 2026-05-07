package com.papeleria.service.patterns.composite;

import com.papeleria.entity.Producto;
import java.math.BigDecimal;

public class ProductoHoja implements CategoriaComponent {
    private Producto producto;

    public ProductoHoja(Producto producto) {
        this.producto = producto;
    }

    @Override
    public String getNombre() {
        return producto.getNombre();
    }

    @Override
    public BigDecimal getPrecioTotal() {
        return producto.getPrecioVenta();
    }

    @Override
    public void mostrar() {
        System.out.println("  - " + getNombre() + ": $" + getPrecioTotal());
    }
}