package com.papeleria.patterns.behavioral.iterator;

import com.papeleria.entity.Venta;
import java.util.Iterator;
import java.util.List;
import java.util.NoSuchElementException;

public class VentaIterator implements Iterator<Venta> {
    private List<Venta> ventas;
    private int position = 0;

    public VentaIterator(List<Venta> ventas) {
        this.ventas = ventas;
    }

    @Override
    public boolean hasNext() {
        return position < ventas.size();
    }

    @Override
    public Venta next() {
        if (!hasNext()) throw new NoSuchElementException();
        return ventas.get(position++);
    }
}