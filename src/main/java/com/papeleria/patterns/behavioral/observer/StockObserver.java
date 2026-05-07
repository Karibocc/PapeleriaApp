package com.papeleria.patterns.behavioral.observer;

import com.papeleria.entity.Producto;

public interface StockObserver {
    void onStockChange(Producto producto, int nuevoStock);
}