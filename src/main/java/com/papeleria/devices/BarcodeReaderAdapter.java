package com.papeleria.devices;

import org.springframework.stereotype.Component;
import javax.swing.*;

/**
 * Adaptador para lector de código de barras.
 * En un entorno real, se conectaría vía puerto serie, USB o red.
 */
@Component
public class BarcodeReaderAdapter {

    /**
     * Simula la lectura de un código de barras desde un escáner real.
     * En implementación real, usarías una librería como javax.comm, usb4java,
     * o escuchar eventos de teclado (el escáner actúa como teclado).
     * @return código de barras leído (String)
     */
    public String leerCodigo() {
        // Simulación: retorna un código de prueba
        // En producción, aquí capturarías el evento del escáner.
        return "7501234567890";
    }

    /**
     * Permite ingresar el código manualmente (por si falla el escáner).
     * @return código ingresado por el usuario
     */
    public String leerManual() {
        return JOptionPane.showInputDialog("Ingrese el código de barras manualmente:");
    }
}