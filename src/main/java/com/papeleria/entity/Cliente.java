package com.papeleria.entity;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "cliente")
public class Cliente {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer idCliente;

    @Column(nullable = false, length = 200)
    private String nombre;

    @Column(name = "documento", length = 50)
    private String documento;

    @Column(name = "email", length = 100)
    private String email;

    @Column(length = 20)
    private String telefono;

    private String direccion;

    private Boolean activo = true;

    @Column(name = "fecha_creacion", updatable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion = LocalDateTime.now();

    public Cliente() {}

    public Integer getIdCliente() { 
        return idCliente; 
    }
    
    public void setIdCliente(Integer idCliente) { 
        this.idCliente = idCliente; 
    }

    public String getNombre() { 
        return nombre; 
    }
    
    public void setNombre(String nombre) { 
        this.nombre = nombre; 
    }

    public String getDocumento() { 
        return documento; 
    }
    
    public void setDocumento(String documento) { 
        this.documento = documento; 
    }

    public String getEmail() { 
        return email; 
    }
    
    public void setEmail(String email) { 
        this.email = email; 
    }

    public String getTelefono() { 
        return telefono; 
    }
    
    public void setTelefono(String telefono) { 
        this.telefono = telefono; 
    }

    public String getDireccion() { 
        return direccion; 
    }
    
    public void setDireccion(String direccion) { 
        this.direccion = direccion; 
    }

    public Boolean getActivo() { 
        return activo; 
    }
    
    public void setActivo(Boolean activo) { 
        this.activo = activo; 
    }

    public LocalDateTime getFechaCreacion() { 
        return fechaCreacion; 
    }
    
    public void setFechaCreacion(LocalDateTime fechaCreacion) { 
        this.fechaCreacion = fechaCreacion; 
    }

    public LocalDateTime getFechaActualizacion() { 
        return fechaActualizacion; 
    }
    
    public void setFechaActualizacion(LocalDateTime fechaActualizacion) { 
        this.fechaActualizacion = fechaActualizacion; 
    }
}