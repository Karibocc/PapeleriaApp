package com.papeleria.patterns.behavioral.iterator;

import com.papeleria.entity.DetalleVenta;
import java.util.Iterator;
import java.util.List;
import java.util.NoSuchElementException;

public class DetalleVentaIterator implements Iterator<DetalleVenta> {
    private List<DetalleVenta> detalles;
    private int position = 0;

    public DetalleVentaIterator(List<DetalleVenta> detalles) {
        this.detalles = detalles;
    }

    @Override
    public boolean hasNext() {
        return position < detalles.size();
    }

    @Override
    public DetalleVenta next() {
        if (!hasNext()) throw new NoSuchElementException();
        return detalles.get(position++);
    }
}
