package com.papeleria.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import javax.persistence.*;
import java.util.List;

@Entity
@Table(name = "rol_usuario")
public class RolUsuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idRol;

    @Column(nullable = false, unique = true, length = 30)
    private String nombre;
    
    @Column(name = "nivel_prioridad")
    private Integer nivelPrioridad = 1;

    @OneToMany(mappedBy = "rol")
    @JsonIgnore
    private List<Usuario> usuarios;

    public RolUsuario() {}

    public RolUsuario(String nombre) {
        this.nombre = nombre;
    }
    
    public RolUsuario(String nombre, Integer nivelPrioridad) {
        this.nombre = nombre;
        this.nivelPrioridad = nivelPrioridad;
    }

    public Integer getIdRol() { return idRol; }
    public void setIdRol(Integer idRol) { this.idRol = idRol; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    
    public Integer getNivelPrioridad() { return nivelPrioridad; }
    public void setNivelPrioridad(Integer nivelPrioridad) { this.nivelPrioridad = nivelPrioridad; }

    public List<Usuario> getUsuarios() { return usuarios; }
    public void setUsuarios(List<Usuario> usuarios) { this.usuarios = usuarios; }
}