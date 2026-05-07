package com.papeleria.service.patterns.bridge;

import com.papeleria.entity.Producto;
import com.papeleria.entity.Venta;
import java.util.List;

public interface FormatoExportacion {
    byte[] exportarVentas(List<Venta> ventas);
    byte[] exportarProductos(List<Producto> productos);
}
