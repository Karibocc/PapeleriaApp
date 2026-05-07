package com.papeleria.entity;

import javax.persistence.*;

@Entity
@Table(name = "configuracion")
public class Configuracion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idConfig;

    @Column(unique = true, nullable = false, length = 100)
    private String clave;

    private String valor;

    private String descripcion;

    // Getters y Setters
    public Integer getIdConfig() { return idConfig; }
    public void setIdConfig(Integer idConfig) { this.idConfig = idConfig; }

    public String getClave() { return clave; }
    public void setClave(String clave) { this.clave = clave; }

    public String getValor() { return valor; }
    public void setValor(String valor) { this.valor = valor; }

    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
}