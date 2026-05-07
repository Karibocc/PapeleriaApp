package com.papeleria.dto;

public class TopProductoDTO {
    private Integer idProducto;
    private String nombre;
    private Long totalVendido;

    // Constructor requerido por la consulta JPQL
    public TopProductoDTO(Integer idProducto, String nombre, Long totalVendido) {
        this.idProducto = idProducto;
        this.nombre = nombre;
        this.totalVendido = totalVendido;
    }

    // Getters y Setters
    public Integer getIdProducto() {
        return idProducto;
    }

    public void setIdProducto(Integer idProducto) {
        this.idProducto = idProducto;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public Long getTotalVendido() {
        return totalVendido;
    }

    public void setTotalVendido(Long totalVendido) {
        this.totalVendido = totalVendido;
    }
}