package com.papeleria.entity;

import javax.persistence.*;
import java.util.List;

@Entity
@Table(name = "tipo_movimiento")
public class TipoMovimiento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idTipoMovimiento;

    @Column(nullable = false, unique = true, length = 30)
    private String nombre;

    @OneToMany(mappedBy = "tipoMovimiento")
    private List<MovimientoInventario> movimientos;

    public TipoMovimiento() {}
    public TipoMovimiento(String nombre) { this.nombre = nombre; }

    // Getters y Setters
    public Integer getIdTipoMovimiento() { return idTipoMovimiento; }
    public void setIdTipoMovimiento(Integer idTipoMovimiento) { this.idTipoMovimiento = idTipoMovimiento; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public List<MovimientoInventario> getMovimientos() { return movimientos; }
    public void setMovimientos(List<MovimientoInventario> movimientos) { this.movimientos = movimientos; }
}