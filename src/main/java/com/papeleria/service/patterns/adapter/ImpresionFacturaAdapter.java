package com.papeleria.service.patterns.adapter;

import com.papeleria.entity.Venta;
import com.papeleria.service.FacturaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component("printSender")
public class ImpresionFacturaAdapter implements FacturaSender {
    @Autowired
    private FacturaService facturaService;

    @Override
    public void enviar(Venta venta, String destino) {
        byte[] pdf = facturaService.generarFacturaPdf(venta);
        // Aquí iría la lógica de impresión real
        System.out.println("Imprimiendo factura " + venta.getIdVenta());
    }
}