package com.papeleria.patterns.behavioral.observer;

import com.papeleria.entity.Producto;
import org.springframework.stereotype.Service;

@Service
public class AlertaStockService implements StockObserver {

    @Override
    public void onStockChange(Producto producto, int nuevoStock) {
        if (nuevoStock <= producto.getStockMinimo()) {
            // Aquí puedes implementar envío de correo, notificación interna, etc.
            System.out.println("⚠️ ALERTA: El producto '" + producto.getNombre() +
                    "' tiene stock bajo: " + nuevoStock + " (mínimo: " + producto.getStockMinimo() + ")");
        }
    }
}