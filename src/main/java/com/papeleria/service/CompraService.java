package com.papeleria.service;

import com.papeleria.entity.*;
import com.papeleria.exception.ResourceNotFoundException;
import com.papeleria.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CompraService {

    @Autowired
    private CompraRepository compraRepository;
    
    @Autowired
    private DetalleCompraRepository detalleCompraRepository;
    
    @Autowired
    private ProveedorRepository proveedorRepository;
    
    @Autowired
    private ProductoRepository productoRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;

    public List<Map<String, Object>> listarTodas() {
        try {
            List<Compra> compras = compraRepository.findAllOrderByFechaDesc();
            List<Map<String, Object>> result = new ArrayList<>();
            
            for (Compra compra : compras) {
                Map<String, Object> map = new HashMap<>();
                map.put("idCompra", compra.getIdCompra());
                map.put("fechaHora", compra.getFechaHora());
                map.put("numeroFactura", compra.getNumeroFactura());
                map.put("subtotal", compra.getSubtotal());
                map.put("impuesto", compra.getImpuesto());
                map.put("descuento", compra.getDescuento());
                map.put("total", compra.getTotal());
                map.put("observacion", compra.getObservacion());
                
                if (compra.getProveedor() != null) {
                    Map<String, Object> proveedorMap = new HashMap<>();
                    proveedorMap.put("idProveedor", compra.getProveedor().getIdProveedor());
                    proveedorMap.put("nombre", compra.getProveedor().getNombre());
                    proveedorMap.put("nit", compra.getProveedor().getNit());
                    map.put("proveedor", proveedorMap);
                }
                
                result.add(map);
            }
            return result;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Error al listar compras: " + e.getMessage());
        }
    }

    public Compra obtenerPorId(Integer id) {
        return compraRepository.findById(id).orElse(null);
    }

    public List<Compra> obtenerComprasPorFechas(LocalDateTime inicio, LocalDateTime fin) {
        return compraRepository.findComprasPorFecha(inicio, fin);
    }

    public List<Compra> obtenerComprasPorProveedor(Integer idProveedor) {
        return compraRepository.findByProveedorIdProveedor(idProveedor);
    }

    @Transactional
    public Compra registrarCompra(Integer idProveedor, Integer idUsuario, String numeroFactura,
                                   BigDecimal descuento, BigDecimal impuesto, String observacion,
                                   List<DetalleCompraRequest> detalles) {

        Proveedor proveedor = proveedorRepository.findById(idProveedor)
                .orElseThrow(() -> new RuntimeException("Proveedor no encontrado"));

        Usuario usuario = usuarioRepository.findById(idUsuario)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Compra compra = new Compra();
        compra.setFechaHora(LocalDateTime.now());
        compra.setNumeroFactura(numeroFactura);
        compra.setDescuento(descuento != null ? descuento : BigDecimal.ZERO);
        compra.setImpuesto(impuesto != null ? impuesto : BigDecimal.ZERO);
        compra.setObservacion(observacion);
        compra.setProveedor(proveedor);
        compra.setUsuario(usuario);

        BigDecimal subtotal = BigDecimal.ZERO;

        for (DetalleCompraRequest detalleReq : detalles) {
            Producto producto = productoRepository.findById(detalleReq.getIdProducto())
                    .orElseThrow(() -> new RuntimeException("Producto no encontrado: " + detalleReq.getIdProducto()));

            BigDecimal precioUnitario = detalleReq.getPrecioUnitario();
            Integer cantidad = detalleReq.getCantidad();
            BigDecimal descuentoLinea = detalleReq.getDescuento() != null ? detalleReq.getDescuento() : BigDecimal.ZERO;
            BigDecimal subtotalLinea = precioUnitario.multiply(BigDecimal.valueOf(cantidad)).subtract(descuentoLinea);

            DetalleCompra detalle = new DetalleCompra();
            detalle.setProducto(producto);
            detalle.setCantidad(cantidad);
            detalle.setPrecioUnitario(precioUnitario);
            detalle.setDescuento(descuentoLinea);
            detalle.setSubtotal(subtotalLinea);
            detalle.setCompra(compra);

            compra.getDetalles().add(detalle);
            subtotal = subtotal.add(subtotalLinea);

            int nuevoStock = producto.getStockActual() + cantidad;
            producto.setStockActual(nuevoStock);
            productoRepository.save(producto);
        }

        compra.setSubtotal(subtotal);
        BigDecimal total = subtotal.add(compra.getImpuesto()).subtract(compra.getDescuento());
        compra.setTotal(total);

        return compraRepository.save(compra);
    }

    @Transactional
    public void anularCompra(Integer idCompra) {
        Compra compra = obtenerPorId(idCompra);
        if (compra == null) {
            throw new RuntimeException("Compra no encontrada");
        }

        for (DetalleCompra detalle : detalleCompraRepository.findByCompraIdCompra(idCompra)) {
            Producto producto = detalle.getProducto();
            int nuevoStock = producto.getStockActual() - detalle.getCantidad();
            if (nuevoStock < 0) {
                nuevoStock = 0;
            }
            producto.setStockActual(nuevoStock);
            productoRepository.save(producto);
        }

        compraRepository.delete(compra);
    }

    public static class DetalleCompraRequest {
        private Integer idProducto;
        private Integer cantidad;
        private BigDecimal precioUnitario;
        private BigDecimal descuento;

        public Integer getIdProducto() { return idProducto; }
        public void setIdProducto(Integer idProducto) { this.idProducto = idProducto; }
        public Integer getCantidad() { return cantidad; }
        public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
        public BigDecimal getPrecioUnitario() { return precioUnitario; }
        public void setPrecioUnitario(BigDecimal precioUnitario) { this.precioUnitario = precioUnitario; }
        public BigDecimal getDescuento() { return descuento; }
        public void setDescuento(BigDecimal descuento) { this.descuento = descuento; }
    }
}