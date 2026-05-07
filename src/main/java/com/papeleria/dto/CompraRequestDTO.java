package com.papeleria.dto;

import javax.validation.Valid;
import javax.validation.constraints.*;
import java.math.BigDecimal;
import java.util.List;

public class CompraRequestDTO {

    private String numeroFactura;

    @NotNull
    @DecimalMin("0.0")
    private BigDecimal impuesto = BigDecimal.ZERO;

    @NotNull
    private Integer idProveedor;

    @NotNull
    private Integer idUsuario;

    private String observacion;

    @NotEmpty(message = "Debe incluir al menos un producto en la compra")
    @Valid
    private List<DetalleDTO> detalles;

    // Getters y Setters
    public String getNumeroFactura() { return numeroFactura; }
    public void setNumeroFactura(String numeroFactura) { this.numeroFactura = numeroFactura; }

    public BigDecimal getImpuesto() { return impuesto; }
    public void setImpuesto(BigDecimal impuesto) { this.impuesto = impuesto; }

    public Integer getIdProveedor() { return idProveedor; }
    public void setIdProveedor(Integer idProveedor) { this.idProveedor = idProveedor; }

    public Integer getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Integer idUsuario) { this.idUsuario = idUsuario; }

    public String getObservacion() { return observacion; }
    public void setObservacion(String observacion) { this.observacion = observacion; }

    public List<DetalleDTO> getDetalles() { return detalles; }
    public void setDetalles(List<DetalleDTO> detalles) { this.detalles = detalles; }

    // Clase interna DetalleDTO
    public static class DetalleDTO {
        @NotNull
        private Integer idProducto;

        @NotNull
        @Min(1)
        private Integer cantidad;

        @NotNull
        @DecimalMin("0.0")
        private BigDecimal costoUnitario;

        // Getters y Setters
        public Integer getIdProducto() { return idProducto; }
        public void setIdProducto(Integer idProducto) { this.idProducto = idProducto; }

        public Integer getCantidad() { return cantidad; }
        public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

        public BigDecimal getCostoUnitario() { return costoUnitario; }
        public void setCostoUnitario(BigDecimal costoUnitario) { this.costoUnitario = costoUnitario; }
    }
}