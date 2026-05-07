package com.papeleria.patterns.behavioral.observer;

import com.papeleria.entity.Producto;
import org.springframework.stereotype.Component;
import java.util.ArrayList;
import java.util.List;

@Component
public class StockNotificador implements StockObserver {
    private List<StockObserver> observers = new ArrayList<>();

    public void addObserver(StockObserver observer) {
        observers.add(observer);
    }

    public void removeObserver(StockObserver observer) {
        observers.remove(observer);
    }

    @Override
    public void onStockChange(Producto producto, int nuevoStock) {
        for (StockObserver observer : observers) {
            observer.onStockChange(producto, nuevoStock);
        }
    }
}