package com.papeleria.service;

import com.papeleria.entity.Venta;
import org.springframework.stereotype.Service;

@Service
public class FacturaService {
    public byte[] generarFacturaPdf(Venta venta) {
        // Aquí implementarás la generación de PDF con OpenPDF
        System.out.println("Generando PDF para venta " + venta.getIdVenta());
        return new byte[0]; // placeholder
    }
}