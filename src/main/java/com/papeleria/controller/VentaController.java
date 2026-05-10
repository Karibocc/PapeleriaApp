package com.papeleria.controller;

import com.papeleria.dto.FacturaDTO;
import com.papeleria.dto.TopProductoDTO;
import com.papeleria.dto.VentaRequestDTO;
import com.papeleria.entity.Venta;
import com.papeleria.service.VentaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ventas")
public class VentaController {

    @Autowired
    private VentaService ventaService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDEDOR')")
    public ResponseEntity<?> listarVentas() {
        try {
            List<Venta> ventas = ventaService.listarTodas();
            return ResponseEntity.ok(ventas);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al listar ventas: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDEDOR')")
    public ResponseEntity<?> obtenerVentaPorId(@PathVariable Integer id) {
        try {
            Venta venta = ventaService.obtenerPorId(id);
            if (venta != null) {
                return ResponseEntity.ok(venta);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Venta no encontrada");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener venta: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/factura/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDEDOR')")
    public ResponseEntity<?> obtenerFactura(@PathVariable Integer id) {
        try {
            FacturaDTO factura = ventaService.obtenerFactura(id);
            return ResponseEntity.ok(factura);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener factura: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDEDOR')")
    public ResponseEntity<?> registrarVenta(@Valid @RequestBody VentaRequestDTO request) {
        try {
            Venta venta = ventaService.registrarVenta(request);
            return new ResponseEntity<>(venta, HttpStatus.CREATED);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al registrar la venta: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/top-productos")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDEDOR')")
    public ResponseEntity<?> getTopProductos(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {

        try {
            if (inicio == null) {
                inicio = LocalDate.now().minusDays(30);
            }
            if (fin == null) {
                fin = LocalDate.now();
            }

            List<TopProductoDTO> topProductos = ventaService.obtenerTopProductos(inicio, fin);
            return ResponseEntity.ok(topProductos);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener top productos: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/reporte/fechas")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDEDOR')")
    public ResponseEntity<?> getVentasPorFechas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        try {
            List<Venta> ventas = ventaService.obtenerVentasPorFechas(inicio, fin);
            return ResponseEntity.ok(ventas);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener ventas por fechas: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/cliente/{idCliente}")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDEDOR')")
    public ResponseEntity<?> getVentasPorCliente(@PathVariable Integer idCliente) {
        try {
            List<Venta> ventas = ventaService.obtenerVentasPorCliente(idCliente);
            return ResponseEntity.ok(ventas);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener ventas del cliente: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/usuario/{idUsuario}")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDEDOR')")
    public ResponseEntity<?> getVentasPorUsuario(@PathVariable Integer idUsuario) {
        try {
            List<Venta> ventas = ventaService.obtenerVentasPorUsuario(idUsuario);
            return ResponseEntity.ok(ventas);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener ventas del usuario: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/totales/dia")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDEDOR')")
    public ResponseEntity<?> getTotalesDia() {
        try {
            Map<String, Object> totales = ventaService.obtenerTotalesDelDia();
            return ResponseEntity.ok(totales);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener totales del día: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/totales/mes")
    @PreAuthorize("hasAnyRole('ADMIN', 'VENDEDOR')")
    public ResponseEntity<?> getTotalesMes() {
        try {
            Map<String, Object> totales = ventaService.obtenerTotalesDelMes();
            return ResponseEntity.ok(totales);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener totales del mes: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}