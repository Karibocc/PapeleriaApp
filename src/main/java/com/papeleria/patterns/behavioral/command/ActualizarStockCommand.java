package com.papeleria.patterns.behavioral.command;

import com.papeleria.entity.Producto;
import com.papeleria.service.ProductoService;

public class ActualizarStockCommand implements Command {
    private ProductoService productoService;
    private Integer productoId;
    private Integer nuevaCantidad;
    private Integer cantidadAnterior;

    public ActualizarStockCommand(ProductoService productoService, Integer productoId, Integer nuevaCantidad) {
        this.productoService = productoService;
        this.productoId = productoId;
        this.nuevaCantidad = nuevaCantidad;
    }

    @Override
    public void execute() {
        Producto producto = productoService.obtenerPorId(productoId);
        cantidadAnterior = producto.getStockActual();
        producto.setStockActual(nuevaCantidad);
        productoService.guardar(producto);
    }

    @Override
    public void undo() {
        Producto producto = productoService.obtenerPorId(productoId);
        producto.setStockActual(cantidadAnterior);
        productoService.guardar(producto);
    }
}
