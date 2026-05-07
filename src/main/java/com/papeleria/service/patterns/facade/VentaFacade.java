package com.papeleria.service.patterns.facade;

import com.papeleria.dto.VentaRequestDTO;
import com.papeleria.entity.Venta;
import com.papeleria.service.VentaService;
import com.papeleria.service.patterns.adapter.FacturaSender;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class VentaFacade {

    @Autowired
    private VentaService ventaService;

    @Autowired
    private Map<String, FacturaSender> senders; // Spring inyecta todos los beans que implementan FacturaSender

    public Venta realizarVenta(VentaRequestDTO request, String medioEnvio, String destino) {
        // 1. Registrar la venta
        Venta venta = ventaService.registrarVenta(request);

        // 2. Enviar factura usando el adapter correspondiente
        FacturaSender sender = senders.get(medioEnvio + "Sender");
        if (sender == null) {
            throw new IllegalArgumentException("Medio de envío no soportado: " + medioEnvio);
        }
        sender.enviar(venta, destino);

        return venta;
    }
}