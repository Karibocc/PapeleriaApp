package com.papeleria.service.patterns.composite;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class CategoriaCompuesta implements CategoriaComponent {
    private String nombre;
    private List<CategoriaComponent> hijos = new ArrayList<>();

    public CategoriaCompuesta(String nombre) {
        this.nombre = nombre;
    }

    public void agregar(CategoriaComponent componente) {
        hijos.add(componente);
    }

    public void remover(CategoriaComponent componente) {
        hijos.remove(componente);
    }

    @Override
    public String getNombre() {
        return nombre;
    }

    @Override
    public BigDecimal getPrecioTotal() {
        return hijos.stream()
                .map(CategoriaComponent::getPrecioTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    public void mostrar() {
        System.out.println(nombre + " (total: $" + getPrecioTotal() + ")");
        hijos.forEach(CategoriaComponent::mostrar);
    }
}