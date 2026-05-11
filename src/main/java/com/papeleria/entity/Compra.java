package com.papeleria.entity;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "compra")
public class Compra {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idCompra;

    @Column(name = "fecha_hora", nullable = false)
    private LocalDateTime fechaHora = LocalDateTime.now();

    @Column(name = "numero_factura")
    private String numeroFactura;

    @Column(nullable = false)
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal impuesto = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal descuento = BigDecimal.ZERO;

    @Column(nullable = false)
    private BigDecimal total = BigDecimal.ZERO;

    @ManyToOne
    @JoinColumn(name = "id_proveedor", nullable = false)
    private Proveedor proveedor;

    @ManyToOne
    @JoinColumn(name = "id_usuario", nullable = false)
    private Usuario usuario;

    private String observacion;

    @OneToMany(mappedBy = "compra", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<DetalleCompra> detalles = new ArrayList<>();

    public Compra() {}

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

    public Proveedor getProveedor() { 
        return proveedor; 
    }
    
    public void setProveedor(Proveedor proveedor) { 
        this.proveedor = proveedor; 
    }

    public Usuario getUsuario() { 
        return usuario; 
    }
    
    public void setUsuario(Usuario usuario) { 
        this.usuario = usuario; 
    }

    public String getObservacion() { 
        return observacion; 
    }
    
    public void setObservacion(String observacion) { 
        this.observacion = observacion; 
    }

    public List<DetalleCompra> getDetalles() { 
        return detalles; 
    }
    
    public void setDetalles(List<DetalleCompra> detalles) { 
        this.detalles = detalles; 
    }
}