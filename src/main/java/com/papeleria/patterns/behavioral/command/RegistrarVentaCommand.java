package com.papeleria.patterns.behavioral.command;

import com.papeleria.dto.VentaRequestDTO;
import com.papeleria.entity.Venta;
import com.papeleria.service.VentaService;

public class RegistrarVentaCommand implements Command {
    private VentaService ventaService;
    private VentaRequestDTO request;
    private Venta ventaRegistrada;

    public RegistrarVentaCommand(VentaService ventaService, VentaRequestDTO request) {
        this.ventaService = ventaService;
        this.request = request;
    }

    @Override
    public void execute() {
        ventaRegistrada = ventaService.registrarVenta(request);
    }

    @Override
    public void undo() {
        if (ventaRegistrada != null) {
            ventaService.anularVenta(ventaRegistrada.getIdVenta());
        }
    }
}
