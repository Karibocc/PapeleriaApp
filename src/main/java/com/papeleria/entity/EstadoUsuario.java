package com.papeleria.entity;

import javax.persistence.*;
import java.util.List;

@Entity
@Table(name = "estado_usuario")
public class EstadoUsuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idEstadoUsuario;

    @Column(nullable = false, unique = true, length = 20)
    private String nombre;

    @OneToMany(mappedBy = "estado")
    private List<Usuario> usuarios;

    public EstadoUsuario() {}

    public EstadoUsuario(String nombre) {
        this.nombre = nombre;
    }

    // Getters y Setters
    public Integer getIdEstadoUsuario() { return idEstadoUsuario; }
    public void setIdEstadoUsuario(Integer idEstadoUsuario) { this.idEstadoUsuario = idEstadoUsuario; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public List<Usuario> getUsuarios() { return usuarios; }
    public void setUsuarios(List<Usuario> usuarios) { this.usuarios = usuarios; }
}