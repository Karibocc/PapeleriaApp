package com.papeleria.controller;

import com.papeleria.entity.Proveedor;
import com.papeleria.service.ProveedorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/proveedores")
public class ProveedorController {

    @Autowired
    private ProveedorService proveedorService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'COMPRAS')")
    public ResponseEntity<?> listar() {
        try {
            List<Proveedor> proveedores = proveedorService.listarTodos();
            return ResponseEntity.ok(proveedores);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al listar proveedores: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/activos")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMPRAS')")
    public ResponseEntity<?> listarActivos() {
        try {
            List<Proveedor> proveedores = proveedorService.listarActivos();
            return ResponseEntity.ok(proveedores);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al listar proveedores activos: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMPRAS')")
    public ResponseEntity<?> obtenerPorId(@PathVariable Integer id) {
        try {
            Proveedor proveedor = proveedorService.obtenerPorId(id);
            return ResponseEntity.ok(proveedor);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Proveedor no encontrado");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @GetMapping("/nit/{nit}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMPRAS')")
    public ResponseEntity<?> obtenerPorNit(@PathVariable String nit) {
        try {
            Proveedor proveedor = proveedorService.obtenerPorNit(nit);
            return ResponseEntity.ok(proveedor);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Proveedor no encontrado con NIT: " + nit);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @GetMapping("/buscar/nombre/{nombre}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMPRAS')")
    public ResponseEntity<?> buscarPorNombre(@PathVariable String nombre) {
        try {
            List<Proveedor> proveedores = proveedorService.buscarPorNombre(nombre);
            return ResponseEntity.ok(proveedores);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al buscar proveedores: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/buscar/contacto/{contacto}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMPRAS')")
    public ResponseEntity<?> buscarPorContacto(@PathVariable String contacto) {
        try {
            List<Proveedor> proveedores = proveedorService.buscarPorContacto(contacto);
            return ResponseEntity.ok(proveedores);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al buscar proveedores por contacto: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'COMPRAS')")
    public ResponseEntity<?> crear(@Valid @RequestBody Map<String, Object> proveedorData) {
        try {
            System.out.println("=== CREAR PROVEEDOR ===");
            System.out.println("Datos recibidos: " + proveedorData);
            
            String nombre = (String) proveedorData.get("nombre");
            String nit = (String) proveedorData.get("nit");
            String contacto = (String) proveedorData.get("contacto");
            String telefono = (String) proveedorData.get("telefono");
            String correo = (String) proveedorData.get("correo");
            String direccion = (String) proveedorData.get("direccion");
            String estadoStr = (String) proveedorData.get("estado");

            if (nombre == null || nombre.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "El nombre del proveedor es obligatorio");
                return ResponseEntity.badRequest().body(error);
            }

            if (nit != null && !nit.isEmpty() && proveedorService.existeNit(nit)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Ya existe un proveedor con este NIT");
                return ResponseEntity.badRequest().body(error);
            }

            Proveedor nuevoProveedor = new Proveedor();
            nuevoProveedor.setNombre(nombre);
            nuevoProveedor.setNit(nit);
            nuevoProveedor.setContacto(contacto);
            nuevoProveedor.setTelefono(telefono);
            nuevoProveedor.setCorreo(correo);
            nuevoProveedor.setDireccion(direccion);
            
            if (estadoStr != null && estadoStr.equalsIgnoreCase("inactivo")) {
                nuevoProveedor.setEstado("inactivo");
            } else {
                nuevoProveedor.setEstado("activo");
            }

            Proveedor guardado = proveedorService.guardar(nuevoProveedor);
            System.out.println("Proveedor guardado con ID: " + guardado.getIdProveedor());
            return new ResponseEntity<>(guardado, HttpStatus.CREATED);

        } catch (Exception e) {
            System.err.println("Error al crear proveedor: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al crear el proveedor: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMPRAS')")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Map<String, Object> proveedorData) {
        try {
            Proveedor proveedorExistente = proveedorService.obtenerPorId(id);

            String nombre = (String) proveedorData.get("nombre");
            String nit = (String) proveedorData.get("nit");
            String contacto = (String) proveedorData.get("contacto");
            String telefono = (String) proveedorData.get("telefono");
            String correo = (String) proveedorData.get("correo");
            String direccion = (String) proveedorData.get("direccion");
            String estadoStr = (String) proveedorData.get("estado");

            if (nombre != null && !nombre.trim().isEmpty()) {
                proveedorExistente.setNombre(nombre);
            }

            if (nit != null && !nit.equals(proveedorExistente.getNit())) {
                if (proveedorService.existeNit(nit)) {
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "Ya existe un proveedor con este NIT");
                    return ResponseEntity.badRequest().body(error);
                }
                proveedorExistente.setNit(nit);
            }

            if (contacto != null) {
                proveedorExistente.setContacto(contacto);
            }

            if (telefono != null) {
                proveedorExistente.setTelefono(telefono);
            }

            if (correo != null) {
                proveedorExistente.setCorreo(correo);
            }

            if (direccion != null) {
                proveedorExistente.setDireccion(direccion);
            }

            if (estadoStr != null) {
                if (estadoStr.equalsIgnoreCase("inactivo")) {
                    proveedorExistente.setEstado("inactivo");
                } else if (estadoStr.equalsIgnoreCase("activo")) {
                    proveedorExistente.setEstado("activo");
                }
            }

            Proveedor actualizado = proveedorService.actualizar(id, proveedorExistente);
            return ResponseEntity.ok(actualizado);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al actualizar el proveedor: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMPRAS')")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            Proveedor proveedor = proveedorService.obtenerPorId(id);
            if (proveedor == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Proveedor no encontrado");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            proveedorService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al eliminar el proveedor: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PatchMapping("/{id}/desactivar")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMPRAS')")
    public ResponseEntity<?> desactivar(@PathVariable Integer id) {
        try {
            Proveedor proveedor = proveedorService.desactivar(id);
            if (proveedor == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Proveedor no encontrado");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            return ResponseEntity.ok(proveedor);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al desactivar el proveedor: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PatchMapping("/{id}/activar")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMPRAS')")
    public ResponseEntity<?> activar(@PathVariable Integer id) {
        try {
            Proveedor proveedor = proveedorService.activar(id);
            if (proveedor == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Proveedor no encontrado");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
            return ResponseEntity.ok(proveedor);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al activar el proveedor: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}