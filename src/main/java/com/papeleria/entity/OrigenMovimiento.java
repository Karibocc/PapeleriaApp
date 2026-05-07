package com.papeleria.entity;

import javax.persistence.*;
import java.util.List;

@Entity
@Table(name = "origen_movimiento")
public class OrigenMovimiento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idOrigenMovimiento;

    @Column(nullable = false, unique = true, length = 30)
    private String nombre;

    @OneToMany(mappedBy = "origenMovimiento")
    private List<MovimientoInventario> movimientos;

    public OrigenMovimiento() {}
    public OrigenMovimiento(String nombre) { this.nombre = nombre; }

    // Getters y Setters
    public Integer getIdOrigenMovimiento() { return idOrigenMovimiento; }
    public void setIdOrigenMovimiento(Integer idOrigenMovimiento) { this.idOrigenMovimiento = idOrigenMovimiento; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public List<MovimientoInventario> getMovimientos() { return movimientos; }
    public void setMovimientos(List<MovimientoInventario> movimientos) { this.movimientos = movimientos; }
}