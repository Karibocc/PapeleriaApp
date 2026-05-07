package com.papeleria.devices;

import com.papeleria.entity.Producto;
import org.springframework.stereotype.Component;

/**
 * Adaptador para impresora de etiquetas de código de barras.
 * Envía comandos ZPL (Zebra) o EPL según la impresora.
 */
@Component
public class BarcodePrinterAdapter {

    /**
     * Imprime una etiqueta con el código de barras del producto.
     * @param producto producto a etiquetar
     * @param cantidad cantidad de etiquetas
     */
    public void imprimirEtiqueta(Producto producto, int cantidad) {
        // Simulación: solo imprime en consola
        System.out.println("=== IMPRESIÓN DE ETIQUETA ===");
        System.out.println("Producto: " + producto.getNombre());
        System.out.println("Código: " + producto.getCodigoBarras());
        System.out.println("Precio: $" + producto.getPrecioVenta());
        System.out.println("Cantidad de etiquetas: " + cantidad);
        System.out.println("============================");

        // En un entorno real, enviarías comandos ZPL a la impresora:
        // String zpl = "^XA^FO50,50^BY3^BCN,100,Y,N,N^FD" + producto.getCodigoBarras() + "^FS^XZ";
        // enviarAImpresora(zpl);
    }
}
