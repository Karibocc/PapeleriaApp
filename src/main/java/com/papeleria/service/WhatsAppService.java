package com.papeleria.service;

import com.papeleria.entity.Venta;
import org.springframework.stereotype.Service;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class WhatsAppService {
    public String generarEnlaceWhatsApp(Venta venta, String telefono) {
        String mensaje = "Factura de compra N° " + venta.getIdVenta() + " - Gracias por su compra";
        String mensajeCodificado = URLEncoder.encode(mensaje, StandardCharsets.UTF_8);
        return "https://wa.me/" + telefono + "?text=" + mensajeCodificado;
    }
}