package com.papeleria.entity;

import javax.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "detalle_venta")
public class DetalleVenta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_detalle_venta")
    private Integer idDetalleVenta;

    @ManyToOne
    @JoinColumn(name = "id_venta", nullable = false)
    private Venta venta;

    @ManyToOne
    @JoinColumn(name = "id_producto", nullable = false)
    private Producto producto;

    @Column(nullable = false)
    private Integer cantidad;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal precioUnitario;

    private BigDecimal descuento = BigDecimal.ZERO;

    public DetalleVenta() {}

    public Integer getIdDetalleVenta() { 
        return idDetalleVenta; 
    }
    
    public void setIdDetalleVenta(Integer idDetalleVenta) { 
        this.idDetalleVenta = idDetalleVenta; 
    }

    public Venta getVenta() { 
        return venta; 
    }
    
    public void setVenta(Venta venta) { 
        this.venta = venta; 
    }

    public Producto getProducto() { 
        return producto; 
    }
    
    public void setProducto(Producto producto) { 
        this.producto = producto; 
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

    public BigDecimal getDescuento() { 
        return descuento; 
    }
    
    public void setDescuento(BigDecimal descuento) { 
        this.descuento = descuento; 
    }
}