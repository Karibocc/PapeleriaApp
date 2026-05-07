package com.papeleria.dto;

import javax.validation.Valid;
import javax.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public class VentaRequestDTO {

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal descuento = BigDecimal.ZERO;

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal impuesto = BigDecimal.ZERO;

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal montoPagado;

    @NotNull
    @Pattern(regexp = "^(efectivo|transferencia|tarjeta|mixto)$",
             message = "Método de pago no válido. Valores permitidos: efectivo, transferencia, tarjeta, mixto")
    private String metodoPago;

    private Integer idCliente;

    @NotNull
    private Integer idUsuario;

    private String observacion;

    @NotEmpty
    @Valid
    private List<DetalleDTO> detalles;

    // Getters y Setters
    public BigDecimal getDescuento() { return descuento; }
    public void setDescuento(BigDecimal descuento) { this.descuento = descuento; }

    public BigDecimal getImpuesto() { return impuesto; }
    public void setImpuesto(BigDecimal impuesto) { this.impuesto = impuesto; }

    public BigDecimal getMontoPagado() { return montoPagado; }
    public void setMontoPagado(BigDecimal montoPagado) { this.montoPagado = montoPagado; }

    public String getMetodoPago() { return metodoPago; }
    public void setMetodoPago(String metodoPago) { this.metodoPago = metodoPago; }

    public Integer getIdCliente() { return idCliente; }
    public void setIdCliente(Integer idCliente) { this.idCliente = idCliente; }

    public Integer getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Integer idUsuario) { this.idUsuario = idUsuario; }

    public String getObservacion() { return observacion; }
    public void setObservacion(String observacion) { this.observacion = observacion; }

    public List<DetalleDTO> getDetalles() { return detalles; }
    public void setDetalles(List<DetalleDTO> detalles) { this.detalles = detalles; }

    public static class DetalleDTO {
        @NotNull
        private Integer idProducto;

        @NotNull
        @Min(1)
        private Integer cantidad;

        @DecimalMin("0.0")
        private BigDecimal descuento = BigDecimal.ZERO;

        // Getters y Setters
        public Integer getIdProducto() { return idProducto; }
        public void setIdProducto(Integer idProducto) { this.idProducto = idProducto; }

        public Integer getCantidad() { return cantidad; }
        public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

        public BigDecimal getDescuento() { return descuento; }
        public void setDescuento(BigDecimal descuento) { this.descuento = descuento; }
    }
}