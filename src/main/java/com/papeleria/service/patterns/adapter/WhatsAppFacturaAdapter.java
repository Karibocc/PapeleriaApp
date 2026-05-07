package com.papeleria.service.patterns.adapter;

import com.papeleria.entity.Venta;
import com.papeleria.service.WhatsAppService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component("whatsappSender")
public class WhatsAppFacturaAdapter implements FacturaSender {
    @Autowired
    private WhatsAppService whatsAppService;

    @Override
    public void enviar(Venta venta, String destino) {
        String enlace = whatsAppService.generarEnlaceWhatsApp(venta, destino);
        // Puedes mostrar el enlace, guardarlo o abrirlo automáticamente
        System.out.println("Enlace WhatsApp: " + enlace);
    }
}