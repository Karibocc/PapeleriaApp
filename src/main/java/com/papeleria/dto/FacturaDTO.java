package com.papeleria.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FacturaDTO {

    private Long idFactura;
    private Long idVenta;               // Referencia a la venta original
    private String numeroFactura;       // Número secuencial o formateado
    private LocalDateTime fechaEmision;

    // Datos del negocio (se pueden tomar de Configuracion)
    private String nombreNegocio;
    private String nitNegocio;
    private String telefonoNegocio;
    private String correoNegocio;
    private String direccionNegocio;

    // Datos del cliente
    private Integer idCliente;
    private String nombreCliente;
    private String correoCliente;
    private String telefonoCliente;
    private String direccionCliente;

    // Datos del vendedor
    private String nombreVendedor;

    // Detalle de productos/servicios
    private List<DetalleFacturaDTO> detalles;

    // Totales
    private BigDecimal subtotal;
    private BigDecimal descuento;
    private BigDecimal impuesto;
    private BigDecimal total;
    private BigDecimal montoPagado;
    private BigDecimal cambio;

    // Método de pago
    private String metodoPago;

    // Observaciones
    private String observaciones;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DetalleFacturaDTO {
        private Integer idProducto;
        private String codigoBarras;
        private String nombreProducto;
        private Integer cantidad;
        private BigDecimal precioUnitario;
        private BigDecimal descuentoLinea;
        private BigDecimal subtotalLinea;
    }
}