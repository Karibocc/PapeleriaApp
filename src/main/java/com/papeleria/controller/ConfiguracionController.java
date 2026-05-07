package com.papeleria.controller;

import com.papeleria.entity.Configuracion;
import com.papeleria.service.ConfiguracionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/configuraciones")
public class ConfiguracionController {

    @Autowired
    private ConfiguracionService configuracionService;

    // Obtener todas las configuraciones
    @GetMapping
    public List<Configuracion> listarConfiguraciones() {
        return configuracionService.listarTodas();
    }

    // Obtener una configuración por su clave
    @GetMapping("/{clave}")
    public ResponseEntity<Configuracion> obtenerPorClave(@PathVariable String clave) {
        Configuracion config = configuracionService.obtenerPorClave(clave);
        return ResponseEntity.ok(config);
    }

    // Crear o actualizar una configuración
    @PostMapping
    public ResponseEntity<Configuracion> guardarConfiguracion(@Valid @RequestBody Configuracion configuracion) {
        Configuracion guardada = configuracionService.guardar(configuracion);
        return ResponseEntity.ok(guardada);
    }

    // Actualizar el valor de una configuración por su clave
    @PutMapping("/{clave}")
    public ResponseEntity<Configuracion> actualizarValor(@PathVariable String clave,
                                                         @RequestBody Map<String, String> body) {
        String nuevoValor = body.get("valor");
        Configuracion actualizada = configuracionService.actualizar(clave, nuevoValor);
        return ResponseEntity.ok(actualizada);
    }

    // Eliminar una configuración
    @DeleteMapping("/{clave}")
    public ResponseEntity<Void> eliminarConfiguracion(@PathVariable String clave) {
        configuracionService.eliminar(clave);
        return ResponseEntity.noContent().build();
    }
}