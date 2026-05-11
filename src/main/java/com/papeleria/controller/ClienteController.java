package com.papeleria.controller;

import com.papeleria.entity.Cliente;
import com.papeleria.service.ClienteService;
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
@RequestMapping("/api/clientes")
public class ClienteController {

    @Autowired
    private ClienteService clienteService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDEDOR')")
    public ResponseEntity<?> listar() {
        try {
            List<Cliente> clientes = clienteService.listarTodos();
            return ResponseEntity.ok(clientes);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al listar clientes: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/activos")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDEDOR')")
    public ResponseEntity<?> listarActivos() {
        try {
            List<Cliente> clientes = clienteService.listarActivos();
            return ResponseEntity.ok(clientes);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al listar clientes activos: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDEDOR')")
    public ResponseEntity<?> obtenerPorId(@PathVariable Integer id) {
        try {
            Cliente cliente = clienteService.obtenerPorId(id);
            return ResponseEntity.ok(cliente);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Cliente no encontrado");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @GetMapping("/documento/{documento}")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDEDOR')")
    public ResponseEntity<?> obtenerPorDocumento(@PathVariable String documento) {
        try {
            Cliente cliente = clienteService.obtenerPorDocumento(documento);
            if (cliente != null) {
                return ResponseEntity.ok(cliente);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Cliente no encontrado con documento: " + documento);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al buscar cliente: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/buscar/nombre/{nombre}")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDEDOR')")
    public ResponseEntity<?> buscarPorNombre(@PathVariable String nombre) {
        try {
            List<Cliente> clientes = clienteService.buscarPorNombre(nombre);
            return ResponseEntity.ok(clientes);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al buscar clientes: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDEDOR')")
    public ResponseEntity<?> crear(@Valid @RequestBody Map<String, Object> clienteData) {
        try {
            String nombre = (String) clienteData.get("nombre");
            String documento = (String) clienteData.get("documento");
            String email = (String) clienteData.get("email");
            String telefono = (String) clienteData.get("telefono");
            String direccion = (String) clienteData.get("direccion");
            Boolean activo = clienteData.get("activo") != null ? (Boolean) clienteData.get("activo") : true;

            if (nombre == null || nombre.trim().isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "El nombre del cliente es obligatorio");
                return ResponseEntity.badRequest().body(error);
            }

            if (documento != null && !documento.isEmpty() && clienteService.existeDocumento(documento)) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Ya existe un cliente con este documento");
                return ResponseEntity.badRequest().body(error);
            }

            Cliente nuevoCliente = new Cliente();
            nuevoCliente.setNombre(nombre);
            nuevoCliente.setDocumento(documento);
            nuevoCliente.setEmail(email);
            nuevoCliente.setTelefono(telefono);
            nuevoCliente.setDireccion(direccion);
            nuevoCliente.setActivo(activo);

            Cliente guardado = clienteService.guardar(nuevoCliente);
            return new ResponseEntity<>(guardado, HttpStatus.CREATED);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al crear el cliente: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDEDOR')")
    public ResponseEntity<?> actualizar(@PathVariable Integer id, @RequestBody Map<String, Object> clienteData) {
        try {
            Cliente clienteExistente = clienteService.obtenerPorId(id);

            String nombre = (String) clienteData.get("nombre");
            String documento = (String) clienteData.get("documento");
            String email = (String) clienteData.get("email");
            String telefono = (String) clienteData.get("telefono");
            String direccion = (String) clienteData.get("direccion");
            Boolean activo = clienteData.get("activo") != null ? (Boolean) clienteData.get("activo") : null;

            if (nombre != null && !nombre.trim().isEmpty()) {
                clienteExistente.setNombre(nombre);
            }

            if (documento != null && !documento.equals(clienteExistente.getDocumento())) {
                if (clienteService.existeDocumento(documento)) {
                    Map<String, String> error = new HashMap<>();
                    error.put("error", "Ya existe un cliente con este documento");
                    return ResponseEntity.badRequest().body(error);
                }
                clienteExistente.setDocumento(documento);
            }

            if (email != null) {
                clienteExistente.setEmail(email);
            }

            if (telefono != null) {
                clienteExistente.setTelefono(telefono);
            }

            if (direccion != null) {
                clienteExistente.setDireccion(direccion);
            }

            if (activo != null) {
                clienteExistente.setActivo(activo);
            }

            Cliente actualizado = clienteService.actualizar(id, clienteExistente);
            return ResponseEntity.ok(actualizado);

        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al actualizar el cliente: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDEDOR')")
    public ResponseEntity<?> eliminar(@PathVariable Integer id) {
        try {
            Cliente cliente = clienteService.obtenerPorId(id);
            if (cliente == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Cliente no encontrado");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            clienteService.eliminar(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al eliminar el cliente: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PatchMapping("/{id}/desactivar")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDEDOR')")
    public ResponseEntity<?> desactivar(@PathVariable Integer id) {
        try {
            Cliente cliente = clienteService.desactivar(id);
            return ResponseEntity.ok(cliente);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al desactivar el cliente: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PatchMapping("/{id}/activar")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDEDOR')")
    public ResponseEntity<?> activar(@PathVariable Integer id) {
        try {
            Cliente cliente = clienteService.activar(id);
            return ResponseEntity.ok(cliente);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al activar el cliente: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}