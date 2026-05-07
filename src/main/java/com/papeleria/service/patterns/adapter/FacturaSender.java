package com.papeleria.service.patterns.adapter;

import com.papeleria.entity.Venta;

public interface FacturaSender {
    void enviar(Venta venta, String destino);
}
