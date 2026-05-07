package com.papeleria.entity;

import javax.persistence.*;
import java.util.List;

@Entity
@Table(name = "estado_documento")
public class EstadoDocumento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idEstadoDocumento;

    @Column(nullable = false, unique = true, length = 20)
    private String nombre;

    @OneToMany(mappedBy = "estado")
    private List<Venta> ventas;

    @OneToMany(mappedBy = "estado")
    private List<Compra> compras;

    public EstadoDocumento() {}
    public EstadoDocumento(String nombre) { this.nombre = nombre; }

    // Getters y Setters
    public Integer getIdEstadoDocumento() { return idEstadoDocumento; }
    public void setIdEstadoDocumento(Integer idEstadoDocumento) { this.idEstadoDocumento = idEstadoDocumento; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public List<Venta> getVentas() { return ventas; }
    public void setVentas(List<Venta> ventas) { this.ventas = ventas; }
    public List<Compra> getCompras() { return compras; }
    public void setCompras(List<Compra> compras) { this.compras = compras; }
}