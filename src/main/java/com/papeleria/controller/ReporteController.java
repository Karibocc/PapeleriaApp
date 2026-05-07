package com.papeleria.controller;

import com.papeleria.dto.ReporteVentaDTO;
import com.papeleria.dto.VentaRequestDTO;
import com.papeleria.entity.Producto;
import com.papeleria.entity.Venta;
import com.papeleria.patterns.creational.ReporteFactory;
import com.papeleria.repository.ProductoRepository;
import com.papeleria.repository.VentaRepository;
import com.papeleria.service.ReporteService;
import com.papeleria.service.patterns.bridge.FormatoExcel;
import com.papeleria.service.patterns.bridge.FormatoPDF;
import com.papeleria.service.patterns.bridge.Reporte;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api/reportes")
public class ReporteController {

    @Autowired
    private VentaRepository ventaRepository;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private ReporteService reporteService;

    // ========== REPORTE DE VENTAS EN PDF ==========
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

    // ========== REPORTE DE VENTAS EN EXCEL ==========
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

    // ========== REPORTE DE INVENTARIO EN PDF ==========
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

    // ========== REPORTE DE INVENTARIO EN EXCEL ==========
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

    // ========== REPORTE DE UTILIDADES (JSON) ==========
    @GetMapping("/utilidades")
    public List<ReporteVentaDTO> reporteUtilidades(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
        return reporteService.reporteVentasPorPeriodo(inicio, fin);
    }
}
