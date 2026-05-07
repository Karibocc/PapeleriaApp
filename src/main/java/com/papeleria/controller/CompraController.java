package com.papeleria.controller;

import com.papeleria.dto.CompraRequestDTO;
import com.papeleria.entity.Compra;
import com.papeleria.service.CompraService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/api/compras")
public class CompraController {

    @Autowired
    private CompraService compraService;

    // Registrar una nueva compra
    @PostMapping
    public ResponseEntity<Compra> registrarCompra(@Valid @RequestBody CompraRequestDTO request) {
        Compra nuevaCompra = compraService.registrarCompra(request);
        return new ResponseEntity<>(nuevaCompra, HttpStatus.CREATED);
    }

    // Listar todas las compras
    @GetMapping
    public List<Compra> listarCompras() {
        return compraService.listarTodas();
    }

    // Obtener una compra por ID
    @GetMapping("/{id}")
    public ResponseEntity<Compra> obtenerCompra(@PathVariable Integer id) {
        Compra compra = compraService.obtenerPorId(id);
        return ResponseEntity.ok(compra);
    }

    // Anular una compra (devuelve el stock y cambia estado)
    @PutMapping("/{id}/anular")
    public ResponseEntity<Compra> anularCompra(@PathVariable Integer id) {
        Compra compraAnulada = compraService.anularCompra(id);
        return ResponseEntity.ok(compraAnulada);
    }

    // Eliminar una compra (solo si no tiene detalles asociados o está anulada)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarCompra(@PathVariable Integer id) {
        compraService.eliminarCompra(id);
        return ResponseEntity.noContent().build();
    }
}