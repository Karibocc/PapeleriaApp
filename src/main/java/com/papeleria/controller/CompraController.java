package com.papeleria.controller;

import com.papeleria.entity.Compra;
import com.papeleria.service.CompraService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.math.BigDecimal;

@RestController
@RequestMapping("/api/compras")
public class CompraController {

    @Autowired
    private CompraService compraService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'COMPRAS')")
    public ResponseEntity<?> listarCompras() {
        try {
            List<Map<String, Object>> compras = compraService.listarTodas();
            return ResponseEntity.ok(compras);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al listar compras: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMPRAS')")
    public ResponseEntity<?> obtenerCompra(@PathVariable Integer id) {
        try {
            Compra compra = compraService.obtenerPorId(id);
            if (compra != null) {
                return ResponseEntity.ok(compra);
            } else {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Compra no encontrada");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener compra: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/fechas")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMPRAS')")
    public ResponseEntity<?> getComprasPorFechas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime fin) {
        try {
            List<Compra> compras = compraService.obtenerComprasPorFechas(inicio, fin);
            return ResponseEntity.ok(compras);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener compras por fechas: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/proveedor/{idProveedor}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMPRAS')")
    public ResponseEntity<?> getComprasPorProveedor(@PathVariable Integer idProveedor) {
        try {
            List<Compra> compras = compraService.obtenerComprasPorProveedor(idProveedor);
            return ResponseEntity.ok(compras);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al obtener compras del proveedor: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'COMPRAS')")
    public ResponseEntity<?> registrarCompra(@RequestBody Map<String, Object> compraData) {
        try {
            System.out.println("=== REGISTRAR COMPRA ===");
            System.out.println("Datos recibidos: " + compraData);

            Integer idProveedor = null;
            if (compraData.get("idProveedor") != null) {
                idProveedor = compraData.get("idProveedor") instanceof Integer ? 
                    (Integer) compraData.get("idProveedor") : 
                    Integer.parseInt(compraData.get("idProveedor").toString());
            }
            
            Integer idUsuario = null;
            if (compraData.get("idUsuario") != null) {
                idUsuario = compraData.get("idUsuario") instanceof Integer ? 
                    (Integer) compraData.get("idUsuario") : 
                    Integer.parseInt(compraData.get("idUsuario").toString());
            }
            
            String numeroFactura = (String) compraData.get("numeroFactura");
            String observacion = (String) compraData.get("observacion");

            BigDecimal descuento = compraData.get("descuento") != null ?
                    new BigDecimal(compraData.get("descuento").toString()) : BigDecimal.ZERO;
            BigDecimal impuesto = compraData.get("impuesto") != null ?
                    new BigDecimal(compraData.get("impuesto").toString()) : BigDecimal.ZERO;

            List<Map<String, Object>> detallesRaw = (List<Map<String, Object>>) compraData.get("detalles");
            java.util.ArrayList<CompraService.DetalleCompraRequest> detalles = new java.util.ArrayList<>();

            if (detallesRaw != null) {
                for (Map<String, Object> detalleRaw : detallesRaw) {
                    if (detalleRaw != null) {
                        CompraService.DetalleCompraRequest detalle = new CompraService.DetalleCompraRequest();
                        Object idProductoObj = detalleRaw.get("idProducto");
                        Object cantidadObj = detalleRaw.get("cantidad");
                        Object precioUnitarioObj = detalleRaw.get("precioUnitario");
                        Object descuentoObj = detalleRaw.get("descuento");
                        
                        if (idProductoObj != null && cantidadObj != null && precioUnitarioObj != null) {
                            detalle.setIdProducto(idProductoObj instanceof Integer ? (Integer) idProductoObj : Integer.parseInt(idProductoObj.toString()));
                            detalle.setCantidad(cantidadObj instanceof Integer ? (Integer) cantidadObj : Integer.parseInt(cantidadObj.toString()));
                            detalle.setPrecioUnitario(new BigDecimal(precioUnitarioObj.toString()));
                            if (descuentoObj != null) {
                                detalle.setDescuento(new BigDecimal(descuentoObj.toString()));
                            }
                            detalles.add(detalle);
                        }
                    }
                }
            }

            if (idProveedor == null) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "El proveedor es obligatorio");
                return ResponseEntity.badRequest().body(error);
            }

            if (detalles.isEmpty()) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Debe agregar al menos un producto");
                return ResponseEntity.badRequest().body(error);
            }

            if (idUsuario == null) {
                idUsuario = 1;
            }

            Compra compra = compraService.registrarCompra(idProveedor, idUsuario, numeroFactura,
                    descuento, impuesto, observacion, detalles);

            return ResponseEntity.status(HttpStatus.CREATED).body(compra);

        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al registrar la compra: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COMPRAS')")
    public ResponseEntity<?> anularCompra(@PathVariable Integer id) {
        try {
            compraService.anularCompra(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Compra anulada exitosamente");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al anular la compra: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}