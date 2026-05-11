package com.papeleria.dto;

import java.math.BigDecimal;

public class ReporteProductoDTO {
    private Integer idProducto;
    private String nombre;
    private String categoria;
    private Integer stockActual;
    private Integer stockMinimo;
    private BigDecimal precioCompra;
    private BigDecimal precioVenta;
    private Long cantidadVendida;
    private BigDecimal totalVendido;

    public ReporteProductoDTO() {}

    public Integer getIdProducto() { return idProducto; }
    public void setIdProducto(Integer idProducto) { this.idProducto = idProducto; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    public Integer getStockActual() { return stockActual; }
    public void setStockActual(Integer stockActual) { this.stockActual = stockActual; }
    public Integer getStockMinimo() { return stockMinimo; }
    public void setStockMinimo(Integer stockMinimo) { this.stockMinimo = stockMinimo; }
    public BigDecimal getPrecioCompra() { return precioCompra; }
    public void setPrecioCompra(BigDecimal precioCompra) { this.precioCompra = precioCompra; }
    public BigDecimal getPrecioVenta() { return precioVenta; }
    public void setPrecioVenta(BigDecimal precioVenta) { this.precioVenta = precioVenta; }
    public Long getCantidadVendida() { return cantidadVendida; }
    public void setCantidadVendida(Long cantidadVendida) { this.cantidadVendida = cantidadVendida; }
    public BigDecimal getTotalVendido() { return totalVendido; }
    public void setTotalVendido(BigDecimal totalVendido) { this.totalVendido = totalVendido; }
}