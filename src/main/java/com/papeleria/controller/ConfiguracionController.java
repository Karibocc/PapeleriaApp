package com.papeleria.controller;

import com.papeleria.entity.Configuracion;
import com.papeleria.service.ConfiguracionService;
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
@RequestMapping("/api/configuracion")
@PreAuthorize("hasRole('ADMIN')")
public class ConfiguracionController {

    @Autowired
    private ConfiguracionService configuracionService;

    @GetMapping
    public ResponseEntity<?> listarConfiguraciones() {
        try {
            List<Configuracion> configs = configuracionService.listarTodas();
            return ResponseEntity.ok(configs);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al listar configuraciones: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/mapa")
    public ResponseEntity<?> obtenerMapa() {
        try {
            Map<String, String> configs = configuracionService.obtenerTodasComoMapa();
            return ResponseEntity.ok(configs);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener configuraciones: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/{clave}")
    public ResponseEntity<?> obtenerPorClave(@PathVariable String clave) {
        try {
            Configuracion config = configuracionService.obtenerPorClave(clave);
            return ResponseEntity.ok(config);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Configuración no encontrada");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @PostMapping
    public ResponseEntity<?> guardarConfiguracion(@Valid @RequestBody Configuracion configuracion) {
        try {
            Configuracion guardada = configuracionService.guardar(configuracion);
            return new ResponseEntity<>(guardada, HttpStatus.CREATED);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al guardar configuración: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PutMapping("/{clave}")
    public ResponseEntity<?> actualizarValor(@PathVariable String clave,
                                             @RequestBody Map<String, String> body) {
        try {
            String nuevoValor = body.get("valor");
            if (nuevoValor == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "El valor es requerido");
                return ResponseEntity.badRequest().body(error);
            }
            Configuracion actualizada = configuracionService.actualizar(clave, nuevoValor);
            return ResponseEntity.ok(actualizada);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al actualizar configuración: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/{clave}")
    public ResponseEntity<?> eliminarConfiguracion(@PathVariable String clave) {
        try {
            configuracionService.eliminar(clave);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al eliminar configuración: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/iva")
    public ResponseEntity<?> getIva() {
        try {
            int iva = configuracionService.getIvaPorcentaje();
            Map<String, Integer> response = new HashMap<>();
            response.put("iva", iva);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener IVA: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/empresa")
    public ResponseEntity<?> getInfoEmpresa() {
        try {
            Map<String, String> empresa = new HashMap<>();
            empresa.put("nombre", configuracionService.getNombreNegocio());
            empresa.put("nit", configuracionService.getNitNegocio());
            empresa.put("telefono", configuracionService.getTelefonoNegocio());
            empresa.put("correo", configuracionService.getCorreoNegocio());
            empresa.put("direccion", configuracionService.getDireccionNegocio());
            return ResponseEntity.ok(empresa);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener información de la empresa: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping("/inicializar")
    public ResponseEntity<?> inicializar() {
        try {
            configuracionService.inicializarConfiguraciones();
            Map<String, String> response = new HashMap<>();
            response.put("message", "Configuraciones inicializadas exitosamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al inicializar configuraciones: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}