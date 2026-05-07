package com.papeleria.service.patterns.adapter;

import com.papeleria.entity.Venta;
import com.papeleria.service.EmailService;
import com.papeleria.service.FacturaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component("emailSender")
public class EmailFacturaAdapter implements FacturaSender {
    @Autowired
    private EmailService emailService;
    @Autowired
    private FacturaService facturaService;

    @Override
    public void enviar(Venta venta, String destino) {
        byte[] pdf = facturaService.generarFacturaPdf(venta);
        emailService.enviarFacturaPorCorreo(destino, pdf, String.valueOf(venta.getIdVenta()));
    }
}
