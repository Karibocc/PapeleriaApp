package com.papeleria.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class ReporteCompraDTO {
    private Integer idCompra;
    private LocalDateTime fechaHora;
    private String proveedor;
    private String comprador;
    private String numeroFactura;
    private BigDecimal subtotal;
    private BigDecimal impuesto;
    private BigDecimal descuento;
    private BigDecimal total;

    public ReporteCompraDTO() {}

    public ReporteCompraDTO(Integer idCompra, LocalDateTime fechaHora, String proveedor, String comprador,
                            String numeroFactura, BigDecimal subtotal, BigDecimal impuesto,
                            BigDecimal descuento, BigDecimal total) {
        this.idCompra = idCompra;
        this.fechaHora = fechaHora;
        this.proveedor = proveedor;
        this.comprador = comprador;
        this.numeroFactura = numeroFactura;
        this.subtotal = subtotal;
        this.impuesto = impuesto;
        this.descuento = descuento;
        this.total = total;
    }

    public Integer getIdCompra() { 
        return idCompra; 
    }
    
    public void setIdCompra(Integer idCompra) { 
        this.idCompra = idCompra; 
    }

    public LocalDateTime getFechaHora() { 
        return fechaHora; 
    }
    
    public void setFechaHora(LocalDateTime fechaHora) { 
        this.fechaHora = fechaHora; 
    }

    public String getProveedor() { 
        return proveedor; 
    }
    
    public void setProveedor(String proveedor) { 
        this.proveedor = proveedor; 
    }

    public String getComprador() { 
        return comprador; 
    }
    
    public void setComprador(String comprador) { 
        this.comprador = comprador; 
    }

    public String getNumeroFactura() { 
        return numeroFactura; 
    }
    
    public void setNumeroFactura(String numeroFactura) { 
        this.numeroFactura = numeroFactura; 
    }

    public BigDecimal getSubtotal() { 
        return subtotal; 
    }
    
    public void setSubtotal(BigDecimal subtotal) { 
        this.subtotal = subtotal; 
    }

    public BigDecimal getImpuesto() { 
        return impuesto; 
    }
    
    public void setImpuesto(BigDecimal impuesto) { 
        this.impuesto = impuesto; 
    }

    public BigDecimal getDescuento() { 
        return descuento; 
    }
    
    public void setDescuento(BigDecimal descuento) { 
        this.descuento = descuento; 
    }

    public BigDecimal getTotal() { 
        return total; 
    }
    
    public void setTotal(BigDecimal total) { 
        this.total = total; 
    }
}