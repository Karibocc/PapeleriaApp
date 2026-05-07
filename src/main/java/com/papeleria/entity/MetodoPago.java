package com.papeleria.entity;

import javax.persistence.*;
import java.util.List;

@Entity
@Table(name = "metodo_pago")
public class MetodoPago {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idMetodoPago;

    @Column(nullable = false, unique = true, length = 30)
    private String nombre;

    @OneToMany(mappedBy = "metodoPago")
    private List<Venta> ventas;

    public MetodoPago() {}
    public MetodoPago(String nombre) { this.nombre = nombre; }

    // Getters y Setters
    public Integer getIdMetodoPago() { return idMetodoPago; }
    public void setIdMetodoPago(Integer idMetodoPago) { this.idMetodoPago = idMetodoPago; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public List<Venta> getVentas() { return ventas; }
    public void setVentas(List<Venta> ventas) { this.ventas = ventas; }
}