package com.papeleria.service;

import com.papeleria.entity.Producto;
import com.papeleria.exception.ResourceNotFoundException;
import com.papeleria.repository.ProductoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProductoService {

    @Autowired
    private ProductoRepository productoRepository;

    public List<Producto> listarTodos() {
        return productoRepository.findAll();
    }

    public List<Producto> listarActivos() {
        return productoRepository.findByActivoTrue();
    }

    public Producto obtenerPorId(Integer id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con id: " + id));
    }

    public Producto obtenerPorCodigoBarras(String codigo) {
        return productoRepository.findByCodigoBarras(codigo)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado con código: " + codigo));
    }

    public boolean existeNombre(String nombre) {
        return productoRepository.existsByNombre(nombre);
    }

    public boolean existeCodigoBarras(String codigoBarras) {
        if (codigoBarras != null && !codigoBarras.isEmpty()) {
            return productoRepository.existsByCodigoBarras(codigoBarras);
        }
        return false;
    }

    public List<Producto> buscarPorNombre(String nombre) {
        return productoRepository.buscarPorNombre(nombre);
    }

    public List<Producto> productosConStockBajo(Integer stockMinimo) {
        return productoRepository.findProductosConStockBajo(stockMinimo);
    }

    @Transactional
    public Producto guardar(Producto producto) {
        if (producto.getIdProducto() == null) {
            producto.setFechaCreacion(LocalDateTime.now());
        }
        producto.setFechaActualizacion(LocalDateTime.now());
        return productoRepository.save(producto);
    }

    @Transactional
    public Producto actualizar(Integer id, Producto productoActualizado) {
        Producto producto = obtenerPorId(id);
        producto.setNombre(productoActualizado.getNombre());
        producto.setDescripcion(productoActualizado.getDescripcion());
        producto.setCategoria(productoActualizado.getCategoria());
        producto.setPrecioCompra(productoActualizado.getPrecioCompra());
        producto.setPrecioVenta(productoActualizado.getPrecioVenta());
        producto.setStockActual(productoActualizado.getStockActual());
        producto.setStockMinimo(productoActualizado.getStockMinimo());
        producto.setUnidadMedida(productoActualizado.getUnidadMedida());
        producto.setActivo(productoActualizado.getActivo());
        producto.setCodigoBarras(productoActualizado.getCodigoBarras());
        producto.setFechaActualizacion(LocalDateTime.now());
        return productoRepository.save(producto);
    }

    @Transactional
    public void eliminar(Integer id) {
        Producto producto = obtenerPorId(id);
        productoRepository.delete(producto);
    }

    @Transactional
    public Producto desactivar(Integer id) {
        Producto producto = obtenerPorId(id);
        producto.setActivo(false);
        producto.setFechaActualizacion(LocalDateTime.now());
        return productoRepository.save(producto);
    }

    @Transactional
    public Producto activar(Integer id) {
        Producto producto = obtenerPorId(id);
        producto.setActivo(true);
        producto.setFechaActualizacion(LocalDateTime.now());
        return productoRepository.save(producto);
    }

    @Transactional
    public Producto actualizarStock(Integer id, Integer cantidad) {
        Producto producto = obtenerPorId(id);
        int nuevoStock = producto.getStockActual() + cantidad;
        if (nuevoStock < 0) {
            throw new RuntimeException("Stock insuficiente. Stock actual: " + producto.getStockActual());
        }
        producto.setStockActual(nuevoStock);
        producto.setFechaActualizacion(LocalDateTime.now());
        return productoRepository.save(producto);
    }
}