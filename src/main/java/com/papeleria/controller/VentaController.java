package com.papeleria.controller;

import com.papeleria.dto.TopProductoDTO;
import com.papeleria.dto.VentaRequestDTO;
import com.papeleria.entity.Venta;
import com.papeleria.service.VentaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/ventas")
public class VentaController {

    @Autowired
    private VentaService ventaService;

    @PostMapping
    public ResponseEntity<Venta> registrarVenta(@Valid @RequestBody VentaRequestDTO request) {
        Venta venta = ventaService.registrarVenta(request);
        return new ResponseEntity<>(venta, HttpStatus.CREATED);
    }

    @GetMapping("/top-productos")
    public ResponseEntity<List<TopProductoDTO>> getTopProductos(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {

        if (inicio == null) {
            inicio = LocalDate.now().minusDays(30);
        }
        if (fin == null) {
            fin = LocalDate.now();
        }

        List<TopProductoDTO> topProductos = ventaService.obtenerTopProductos(inicio, fin);
        return ResponseEntity.ok(topProductos);
    }
}