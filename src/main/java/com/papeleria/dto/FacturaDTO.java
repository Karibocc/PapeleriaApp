package com.papeleria.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class FacturaDTO {

    private Long idFactura;
    private Long idVenta;
    private String numeroFactura;
    private LocalDateTime fechaEmision;

    private String nombreNegocio;
    private String nitNegocio;
    private String telefonoNegocio;
    private String correoNegocio;
    private String direccionNegocio;

    private Integer idCliente;
    private String nombreCliente;
    private String correoCliente;
    private String telefonoCliente;
    private String direccionCliente;

    private String nombreVendedor;

    private List<DetalleFacturaDTO> detalles;

    private BigDecimal subtotal;
    private BigDecimal descuento;
    private BigDecimal impuesto;
    private BigDecimal total;
    private BigDecimal montoPagado;
    private BigDecimal cambio;

    private String metodoPago;

    private String observaciones;

    public FacturaDTO() {
    }

    public FacturaDTO(Long idFactura, Long idVenta, String numeroFactura, LocalDateTime fechaEmision, String nombreNegocio, String nitNegocio, String telefonoNegocio, String correoNegocio, String direccionNegocio, Integer idCliente, String nombreCliente, String correoCliente, String telefonoCliente, String direccionCliente, String nombreVendedor, List<DetalleFacturaDTO> detalles, BigDecimal subtotal, BigDecimal descuento, BigDecimal impuesto, BigDecimal total, BigDecimal montoPagado, BigDecimal cambio, String metodoPago, String observaciones) {
        this.idFactura = idFactura;
        this.idVenta = idVenta;
        this.numeroFactura = numeroFactura;
        this.fechaEmision = fechaEmision;
        this.nombreNegocio = nombreNegocio;
        this.nitNegocio = nitNegocio;
        this.telefonoNegocio = telefonoNegocio;
        this.correoNegocio = correoNegocio;
        this.direccionNegocio = direccionNegocio;
        this.idCliente = idCliente;
        this.nombreCliente = nombreCliente;
        this.correoCliente = correoCliente;
        this.telefonoCliente = telefonoCliente;
        this.direccionCliente = direccionCliente;
        this.nombreVendedor = nombreVendedor;
        this.detalles = detalles;
        this.subtotal = subtotal;
        this.descuento = descuento;
        this.impuesto = impuesto;
        this.total = total;
        this.montoPagado = montoPagado;
        this.cambio = cambio;
        this.metodoPago = metodoPago;
        this.observaciones = observaciones;
    }

    public Long getIdFactura() {
        return idFactura;
    }

    public void setIdFactura(Long idFactura) {
        this.idFactura = idFactura;
    }

    public Long getIdVenta() {
        return idVenta;
    }

    public void setIdVenta(Long idVenta) {
        this.idVenta = idVenta;
    }

    public String getNumeroFactura() {
        return numeroFactura;
    }

    public void setNumeroFactura(String numeroFactura) {
        this.numeroFactura = numeroFactura;
    }

    public LocalDateTime getFechaEmision() {
        return fechaEmision;
    }

    public void setFechaEmision(LocalDateTime fechaEmision) {
        this.fechaEmision = fechaEmision;
    }

    public String getNombreNegocio() {
        return nombreNegocio;
    }

    public void setNombreNegocio(String nombreNegocio) {
        this.nombreNegocio = nombreNegocio;
    }

    public String getNitNegocio() {
        return nitNegocio;
    }

    public void setNitNegocio(String nitNegocio) {
        this.nitNegocio = nitNegocio;
    }

    public String getTelefonoNegocio() {
        return telefonoNegocio;
    }

    public void setTelefonoNegocio(String telefonoNegocio) {
        this.telefonoNegocio = telefonoNegocio;
    }

    public String getCorreoNegocio() {
        return correoNegocio;
    }

    public void setCorreoNegocio(String correoNegocio) {
        this.correoNegocio = correoNegocio;
    }

    public String getDireccionNegocio() {
        return direccionNegocio;
    }

    public void setDireccionNegocio(String direccionNegocio) {
        this.direccionNegocio = direccionNegocio;
    }

    public Integer getIdCliente() {
        return idCliente;
    }

    public void setIdCliente(Integer idCliente) {
        this.idCliente = idCliente;
    }

    public String getNombreCliente() {
        return nombreCliente;
    }

    public void setNombreCliente(String nombreCliente) {
        this.nombreCliente = nombreCliente;
    }

    public String getCorreoCliente() {
        return correoCliente;
    }

    public void setCorreoCliente(String correoCliente) {
        this.correoCliente = correoCliente;
    }

    public String getTelefonoCliente() {
        return telefonoCliente;
    }

    public void setTelefonoCliente(String telefonoCliente) {
        this.telefonoCliente = telefonoCliente;
    }

    public String getDireccionCliente() {
        return direccionCliente;
    }

    public void setDireccionCliente(String direccionCliente) {
        this.direccionCliente = direccionCliente;
    }

    public String getNombreVendedor() {
        return nombreVendedor;
    }

    public void setNombreVendedor(String nombreVendedor) {
        this.nombreVendedor = nombreVendedor;
    }

    public List<DetalleFacturaDTO> getDetalles() {
        return detalles;
    }

    public void setDetalles(List<DetalleFacturaDTO> detalles) {
        this.detalles = detalles;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getDescuento() {
        return descuento;
    }

    public void setDescuento(BigDecimal descuento) {
        this.descuento = descuento;
    }

    public BigDecimal getImpuesto() {
        return impuesto;
    }

    public void setImpuesto(BigDecimal impuesto) {
        this.impuesto = impuesto;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public BigDecimal getMontoPagado() {
        return montoPagado;
    }

    public void setMontoPagado(BigDecimal montoPagado) {
        this.montoPagado = montoPagado;
    }

    public BigDecimal getCambio() {
        return cambio;
    }

    public void setCambio(BigDecimal cambio) {
        this.cambio = cambio;
    }

    public String getMetodoPago() {
        return metodoPago;
    }

    public void setMetodoPago(String metodoPago) {
        this.metodoPago = metodoPago;
    }

    public String getObservaciones() {
        return observaciones;
    }

    public void setObservaciones(String observaciones) {
        this.observaciones = observaciones;
    }

    public static class DetalleFacturaDTO {
        private Integer idProducto;
        private String codigoBarras;
        private String nombreProducto;
        private Integer cantidad;
        private BigDecimal precioUnitario;
        private BigDecimal descuentoLinea;
        private BigDecimal subtotalLinea;

        public DetalleFacturaDTO() {
        }

        public DetalleFacturaDTO(Integer idProducto, String codigoBarras, String nombreProducto, Integer cantidad, BigDecimal precioUnitario, BigDecimal descuentoLinea, BigDecimal subtotalLinea) {
            this.idProducto = idProducto;
            this.codigoBarras = codigoBarras;
            this.nombreProducto = nombreProducto;
            this.cantidad = cantidad;
            this.precioUnitario = precioUnitario;
            this.descuentoLinea = descuentoLinea;
            this.subtotalLinea = subtotalLinea;
        }

        public Integer getIdProducto() {
            return idProducto;
        }

        public void setIdProducto(Integer idProducto) {
            this.idProducto = idProducto;
        }

        public String getCodigoBarras() {
            return codigoBarras;
        }

        public void setCodigoBarras(String codigoBarras) {
            this.codigoBarras = codigoBarras;
        }

        public String getNombreProducto() {
            return nombreProducto;
        }

        public void setNombreProducto(String nombreProducto) {
            this.nombreProducto = nombreProducto;
        }

        public Integer getCantidad() {
            return cantidad;
        }

        public void setCantidad(Integer cantidad) {
            this.cantidad = cantidad;
        }

        public BigDecimal getPrecioUnitario() {
            return precioUnitario;
        }

        public void setPrecioUnitario(BigDecimal precioUnitario) {
            this.precioUnitario = precioUnitario;
        }

        public BigDecimal getDescuentoLinea() {
            return descuentoLinea;
        }

        public void setDescuentoLinea(BigDecimal descuentoLinea) {
            this.descuentoLinea = descuentoLinea;
        }

        public BigDecimal getSubtotalLinea() {
            return subtotalLinea;
        }

        public void setSubtotalLinea(BigDecimal subtotalLinea) {
            this.subtotalLinea = subtotalLinea;
        }
    }
}