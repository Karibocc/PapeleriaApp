package com.papeleria.controller;

import com.papeleria.entity.Producto;
import com.papeleria.service.ProductoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import javax.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/productos")
@PreAuthorize("hasRole('ADMIN')")
public class ProductoController {

    @Autowired
    private ProductoService productoService;

    @GetMapping
    public ResponseEntity<List<Producto>> listar() {
        List<Producto> productos = productoService.listarTodos();
        return ResponseEntity.ok(productos);
    }

    @GetMapping("/activos")
    public ResponseEntity<List<Producto>> listarActivos() {
        List<Producto> productos = productoService.listarActivos();
        return ResponseEntity.ok(productos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Integer id) {
        try {
            Producto producto = productoService.obtenerPorId(id);
            return ResponseEntity.ok(producto);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Producto no encontrado");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<?> obtenerPorCodigo(@PathVariable String codigo) {
        try {
            Producto producto = productoService.obtenerPorCodigoBarras(codigo);
            return ResponseEntity.ok(producto);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Producto no encontrado con código: " + codigo);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @GetMapping("/buscar/nombre/{nombre}")
    public ResponseEntity<List<Producto>> buscarPorNombre(@PathVariable String nombre) {
        List<Producto> productos = productoService.buscarPorNombre(nombre);
        return ResponseEntity.ok(productos);
    }

    @GetMapping("/stock-bajo/{stockMinimo}")
    public ResponseEntity<List<Producto>> productosConStockBajo(@PathVariable Integer stockMinimo) {
        List<Producto> productos = productoService.productosConStockBajo(stockMinimo);
        return ResponseEntity.ok(productos);
    }

    @PostMapping
    public ResponseEntity<?> crear(@Valid @RequestBody Map<String, Object> productoData) {
        try {
            String nombre = (String) productoData.get("nombre");
            String descripcion = (String) productoData.get("descripcion");
            String codigoBarras = (String) productoData.get("codigoBarras");
            
            BigDecimal precioCompra = null;
            BigDecimal precioVenta = null;
            Integer stockActual = 0;
            Integer stockMinimo = 0;
            String unidadMedida = "unidad";
            
            if (productoData.get("precioCompra") != null) {
                precioCompra = new BigDecimal(productoData.get("precioCompra").toString());
            }
            if (productoData.get("precioVenta") != null) {
                precioVenta = new BigDecimal(productoData.get("precioVenta").toString());
            }
            if (productoData.get("stockActual") != null) {
                stockActual = Integer.parseInt(productoData.get("stockActual").toString());
            }
            if (productoData.get("stockMinimo") != null) {
                stockMinimo = Integer.parseInt(productoData.get("stockMinimo").toString());
            }
            if (productoData.get("unidadMedida") != null) {
                unidadMedida = (String) productoData.get("unidadMedida");
            }
            
            if (nombre == null || nombre.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "El nombre del producto es obligatorio");
                return ResponseEntity.badRequest().body(error);
            }
            
            if (precioVenta == null || precioVenta.doubleValue() <= 0) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "El precio de venta debe ser mayor a 0");
                return ResponseEntity.badRequest().body(error);
            }
            
            if (productoService.existeNombre(nombre)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Ya existe un producto con este nombre");
                return ResponseEntity.badRequest().body(error);
            }
            
            if (codigoBarras != null && !codigoBarras.isEmpty() && productoService.existeCodigoBarras(codigoBarras)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Ya existe un producto con este código de barras");
                return ResponseEntity.badRequest().body(error);
            }
            
            Producto nuevoProducto = new Producto();
            nuevoProducto.setNombre(nombre);
            nuevoProducto.setDescripcion(descripcion);
            nuevoProducto.setCodigoBarras(codigoBarras);
            nuevoProducto.setPrecioCompra(precioCompra);
            nuevoProducto.setPrecioVenta(precioVenta);
            nuevoProducto.setStockActual(stockActual);
            nuevoProducto.setStockMinimo(stockMinimo);
            nuevoProducto.setUnidadMedida(unidadMedida);
            nuevoProducto.setActivo(true);
            
            Producto guardado = productoService.guardar(nuevoProducto);
            return new ResponseEntity<>(guardado, HttpStatus.CREATED);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al crear el producto: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Map<String, Object> productoData) {
        try {
            Producto productoExistente = productoService.obtenerPorId(id);
            
            String nombre = (String) productoData.get("nombre");
            String descripcion = (String) productoData.get("descripcion");
            String codigoBarras = (String) productoData.get("codigoBarras");
            String unidadMedida = (String) productoData.get("unidadMedida");
            Boolean activo = productoData.get("activo") != null ? Boolean.parseBoolean(productoData.get("activo").toString()) : null;
            
            BigDecimal precioCompra = null;
            BigDecimal precioVenta = null;
            Integer stockActual = null;
            Integer stockMinimo = null;
            
            if (productoData.get("precioCompra") != null) {
                precioCompra = new BigDecimal(productoData.get("precioCompra").toString());
            }
            if (productoData.get("precioVenta") != null) {
                precioVenta = new BigDecimal(productoData.get("precioVenta").toString());
            }
            if (productoData.get("stockActual") != null) {
                stockActual = Integer.parseInt(productoData.get("stockActual").toString());
            }
            if (productoData.get("stockMinimo") != null) {
                stockMinimo = Integer.parseInt(productoData.get("stockMinimo").toString());
            }
            
            if (nombre != null && !nombre.equals(productoExistente.getNombre())) {
                if (productoService.existeNombre(nombre)) {
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "Ya existe un producto con este nombre");
                    return ResponseEntity.badRequest().body(error);
                }
                productoExistente.setNombre(nombre);
            }
            
            if (descripcion != null) {
                productoExistente.setDescripcion(descripcion);
            }
            
            if (codigoBarras != null && !codigoBarras.equals(productoExistente.getCodigoBarras())) {
                if (productoService.existeCodigoBarras(codigoBarras)) {
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "Ya existe un producto con este código de barras");
                    return ResponseEntity.badRequest().body(error);
                }
                productoExistente.setCodigoBarras(codigoBarras);
            }
            
            if (precioCompra != null) {
                productoExistente.setPrecioCompra(precioCompra);
            }
            
            if (precioVenta != null && precioVenta.doubleValue() > 0) {
                productoExistente.setPrecioVenta(precioVenta);
            }
            
            if (stockActual != null) {
                productoExistente.setStockActual(stockActual);
            }
            
            if (stockMinimo != null) {
                productoExistente.setStockMinimo(stockMinimo);
            }
            
            if (unidadMedida != null) {
                productoExistente.setUnidadMedida(unidadMedida);
            }
            
            if (activo != null) {
                productoExistente.setActivo(activo);
            }
            
            Producto actualizado = productoService.actualizar(id, productoExistente);
            return ResponseEntity.ok(actualizado);
            
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al actualizar el producto: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            productoService.obtenerPorId(id);
            productoService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al eliminar el producto: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @PatchMapping("/{id}/desactivar")
    public ResponseEntity<?> desactivar(@PathVariable Integer id) {
        try {
            Producto producto = productoService.desactivar(id);
            return ResponseEntity.ok(producto);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al desactivar el producto: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @PatchMapping("/{id}/activar")
    public ResponseEntity<?> activar(@PathVariable Integer id) {
        try {
            Producto producto = productoService.activar(id);
            return ResponseEntity.ok(producto);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al activar el producto: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @PatchMapping("/{id}/stock")
    public ResponseEntity<?> actualizarStock(@PathVariable Integer id, @RequestBody Map<String, Integer> stockData) {
        try {
            Integer cantidad = stockData.get("cantidad");
            if (cantidad == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "La cantidad es obligatoria");
                return ResponseEntity.badRequest().body(error);
            }
            Producto producto = productoService.actualizarStock(id, cantidad);
            return ResponseEntity.ok(producto);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al actualizar el stock: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}