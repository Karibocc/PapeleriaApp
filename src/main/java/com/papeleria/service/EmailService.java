package com.papeleria.service;

import org.springframework.stereotype.Service;

@Service
public class EmailService {
    public void enviarFacturaPorCorreo(String destinatario, byte[] pdf, String numeroFactura) {
        // Aquí implementarás el envío real con JavaMail
        System.out.println("Enviando factura " + numeroFactura + " a " + destinatario);
    }
}
