package com.papeleria.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public class ReporteVentaDTO {
    private Integer idVenta;
    private LocalDateTime fechaHora;
    private String cliente;
    private String vendedor;
    private BigDecimal subtotal;
    private BigDecimal impuesto;
    private BigDecimal descuento;
    private BigDecimal total;
    private String metodoPago;
    
    private LocalDate fecha;
    private Long cantidadVentas;
    private BigDecimal totalIngresos;
    private BigDecimal totalUtilidad;

    public ReporteVentaDTO() {}

    public ReporteVentaDTO(Integer idVenta, LocalDateTime fechaHora, String cliente, String vendedor, 
                           BigDecimal subtotal, BigDecimal impuesto, BigDecimal descuento, 
                           BigDecimal total, String metodoPago) {
        this.idVenta = idVenta;
        this.fechaHora = fechaHora;
        this.cliente = cliente;
        this.vendedor = vendedor;
        this.subtotal = subtotal;
        this.impuesto = impuesto;
        this.descuento = descuento;
        this.total = total;
        this.metodoPago = metodoPago;
    }

    public ReporteVentaDTO(LocalDate fecha, Long cantidadVentas, BigDecimal totalIngresos, BigDecimal totalUtilidad) {
        this.fecha = fecha;
        this.cantidadVentas = cantidadVentas;
        this.totalIngresos = totalIngresos;
        this.totalUtilidad = totalUtilidad;
    }

    public Integer getIdVenta() { 
        return idVenta; 
    }
    
    public void setIdVenta(Integer idVenta) { 
        this.idVenta = idVenta; 
    }

    public LocalDateTime getFechaHora() { 
        return fechaHora; 
    }
    
    public void setFechaHora(LocalDateTime fechaHora) { 
        this.fechaHora = fechaHora; 
    }

    public String getCliente() { 
        return cliente; 
    }
    
    public void setCliente(String cliente) { 
        this.cliente = cliente; 
    }

    public String getVendedor() { 
        return vendedor; 
    }
    
    public void setVendedor(String vendedor) { 
        this.vendedor = vendedor; 
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

    public String getMetodoPago() { 
        return metodoPago; 
    }
    
    public void setMetodoPago(String metodoPago) { 
        this.metodoPago = metodoPago; 
    }

    public LocalDate getFecha() { 
        return fecha; 
    }
    
    public void setFecha(LocalDate fecha) { 
        this.fecha = fecha; 
    }

    public Long getCantidadVentas() { 
        return cantidadVentas; 
    }
    
    public void setCantidadVentas(Long cantidadVentas) { 
        this.cantidadVentas = cantidadVentas; 
    }

    public BigDecimal getTotalIngresos() { 
        return totalIngresos; 
    }
    
    public void setTotalIngresos(BigDecimal totalIngresos) { 
        this.totalIngresos = totalIngresos; 
    }

    public BigDecimal getTotalUtilidad() { 
        return totalUtilidad; 
    }
    
    public void setTotalUtilidad(BigDecimal totalUtilidad) { 
        this.totalUtilidad = totalUtilidad; 
    }
}