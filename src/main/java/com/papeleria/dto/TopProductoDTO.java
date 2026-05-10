package com.papeleria.dto;

import java.math.BigDecimal;

public class TopProductoDTO {
    private Integer idProducto;
    private String nombre;
    private Long cantidadVendida;
    private BigDecimal totalVendido;

    public TopProductoDTO(Integer idProducto, String nombre, Long cantidadVendida, BigDecimal totalVendido) {
        this.idProducto = idProducto;
        this.nombre = nombre;
        this.cantidadVendida = cantidadVendida;
        this.totalVendido = totalVendido;
    }

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

    public Long getCantidadVendida() {
        return cantidadVendida;
    }

    public void setCantidadVendida(Long cantidadVendida) {
        this.cantidadVendida = cantidadVendida;
    }

    public BigDecimal getTotalVendido() {
        return totalVendido;
    }

    public void setTotalVendido(BigDecimal totalVendido) {
        this.totalVendido = totalVendido;
    }
}