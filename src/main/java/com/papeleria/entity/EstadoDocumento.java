package com.papeleria.entity;

import javax.persistence.*;

@Entity
@Table(name = "estado_documento")
public class EstadoDocumento {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idEstadoDocumento;

    @Column(nullable = false, length = 50)
    private String nombre;

    public EstadoDocumento() {}

    public Integer getIdEstadoDocumento() {
        return idEstadoDocumento;
    }

    public void setIdEstadoDocumento(Integer idEstadoDocumento) {
        this.idEstadoDocumento = idEstadoDocumento;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}