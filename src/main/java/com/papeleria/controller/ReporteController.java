package com.papeleria.controller;

import com.papeleria.dto.*;
import com.papeleria.entity.Producto;
import com.papeleria.entity.Venta;
import com.papeleria.entity.Compra;
import com.papeleria.patterns.creational.ReporteFactory;
import com.papeleria.repository.ProductoRepository;
import com.papeleria.repository.VentaRepository;
import com.papeleria.repository.CompraRepository;
import com.papeleria.service.ReporteService;
import com.papeleria.service.patterns.bridge.FormatoExcel;
import com.papeleria.service.patterns.bridge.FormatoPDF;
import com.papeleria.service.patterns.bridge.Reporte;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reportes")
@PreAuthorize("hasAnyRole('ADMIN', 'VENDEDOR', 'COMPRAS')")
public class ReporteController {

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private CompraRepository compraRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private ReporteService reporteService;

    @GetMapping("/ventas")
    public ResponseEntity<?> getReporteVentas(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        try {
            List<ReporteVentaDTO> reportes = reporteService.reporteVentasPorPeriodo(inicio, fin);
            return ResponseEntity.ok(reportes);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al generar reporte de ventas: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/compras")
    public ResponseEntity<?> getReporteCompras(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        try {
            List<ReporteCompraDTO> reportes = reporteService.getReporteCompras(inicio, fin);
            return ResponseEntity.ok(reportes);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al generar reporte de compras: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/productos/mas-vendidos")
    public ResponseEntity<?> getProductosMasVendidos(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin,
            @RequestParam(defaultValue = "10") int limit) {
        try {
            List<ReporteProductoDTO> reportes = reporteService.getProductosMasVendidos(inicio, fin, limit);
            return ResponseEntity.ok(reportes);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al generar reporte de productos más vendidos: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/productos/stock-bajo")
    public ResponseEntity<?> getProductosConStockBajo() {
        try {
            List<ReporteProductoDTO> reportes = reporteService.getProductosConStockBajo();
            return ResponseEntity.ok(reportes);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al generar reporte de productos con stock bajo: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/inventario")
    public ResponseEntity<?> getInventarioCompleto() {
        try {
            List<ReporteProductoDTO> reportes = reporteService.getInventarioCompleto();
            return ResponseEntity.ok(reportes);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al generar reporte de inventario: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/utilidad/mensual/{year}")
    public ResponseEntity<?> getUtilidadPorMes(@PathVariable int year) {
        try {
            List<ReporteUtilidadDTO> reportes = reporteService.getUtilidadPorMes(year);
            return ResponseEntity.ok(reportes);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al generar reporte de utilidad mensual: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/utilidad/rango")
    public ResponseEntity<?> getUtilidadPorRango(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        try {
            ReporteUtilidadDTO reporte = reporteService.getUtilidadPorRango(inicio, fin);
            return ResponseEntity.ok(reporte);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al generar reporte de utilidad: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/resumen")
    public ResponseEntity<?> getResumen() {
        try {
            Map<String, Object> resumen = reporteService.getResumen();
            return ResponseEntity.ok(resumen);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al generar resumen: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    @GetMapping("/ventas/pdf")
    public ResponseEntity<byte[]> reporteVentasPdf(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {

        List<Venta> ventas = ventaRepository.findByFechaHoraBetween(
                inicio.atStartOfDay(),
                fin.atTime(LocalTime.MAX)
        );

        Reporte reporte = ReporteFactory.crearReporteVentas(new FormatoPDF(), ventas);
        byte[] pdf = reporte.generar();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("inline", "reporte_ventas.pdf");
        return ResponseEntity.ok().headers(headers).body(pdf);
    }

    @GetMapping("/ventas/excel")
    public ResponseEntity<byte[]> reporteVentasExcel(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {

        List<Venta> ventas = ventaRepository.findByFechaHoraBetween(
                inicio.atStartOfDay(),
                fin.atTime(LocalTime.MAX)
        );

        Reporte reporte = ReporteFactory.crearReporteVentas(new FormatoExcel(), ventas);
        byte[] excel = reporte.generar();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "reporte_ventas.xlsx");
        return ResponseEntity.ok().headers(headers).body(excel);
    }

    @GetMapping("/inventario/pdf")
    public ResponseEntity<byte[]> reporteInventarioPdf() {
        List<Producto> productos = productoRepository.findAll();
        Reporte reporte = ReporteFactory.crearReporteInventario(new FormatoPDF(), productos);
        byte[] pdf = reporte.generar();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("inline", "reporte_inventario.pdf");
        return ResponseEntity.ok().headers(headers).body(pdf);
    }

    @GetMapping("/inventario/excel")
    public ResponseEntity<byte[]> reporteInventarioExcel() {
        List<Producto> productos = productoRepository.findAll();
        Reporte reporte = ReporteFactory.crearReporteInventario(new FormatoExcel(), productos);
        byte[] excel = reporte.generar();

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
        headers.setContentDispositionFormData("attachment", "reporte_inventario.xlsx");
        return ResponseEntity.ok().headers(headers).body(excel);
    }

    @GetMapping("/utilidades")
    public ResponseEntity<?> reporteUtilidades(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        try {
            List<ReporteVentaDTO> reportes = reporteService.reporteVentasPorPeriodo(inicio, fin);
            return ResponseEntity.ok(reportes);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Error al generar reporte de utilidades: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}