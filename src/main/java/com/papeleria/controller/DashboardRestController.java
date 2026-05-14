package com.papeleria.controller;

import com.papeleria.entity.Producto;
import com.papeleria.entity.Venta;
import com.papeleria.repository.ClienteRepository;
import com.papeleria.repository.ProductoRepository;
import com.papeleria.service.VentaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class DashboardRestController {

    @Autowired
    private VentaService ventaService;

    @Autowired
    private ProductoRepository productoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @GetMapping("/ventas/totales-mes")
    public Map<String, Object> getTotalesMes() {
        Map<String, Object> resumen = ventaService.obtenerResumenDashboard();
        Map<String, Object> response = new HashMap<>();
        response.put("totalVentas", resumen.get("totalVentasMes"));
        response.put("cantidadVentas", resumen.get("cantidadVentasMes"));
        return response;
    }

    @GetMapping("/ventas/ultimos-7-dias")
    public List<Map<String, Object>> getVentasUltimos7Dias() {
        List<Venta> ventas = ventaService.obtenerVentasUltimos7Dias();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        Map<String, BigDecimal> ventasPorFecha = new LinkedHashMap<>();
        for (int i = 7; i >= 0; i--) {
            String fecha = LocalDate.now().minusDays(i).format(formatter);
            ventasPorFecha.put(fecha, BigDecimal.ZERO);
        }
        for (Venta v : ventas) {
            String fecha = v.getFechaHora().format(formatter);
            BigDecimal total = v.getMontoPagado().subtract(v.getDescuento());
            ventasPorFecha.merge(fecha, total, BigDecimal::add);
        }
        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<String, BigDecimal> entry : ventasPorFecha.entrySet()) {
            Map<String, Object> item = new HashMap<>();
            item.put("fecha", entry.getKey());
            item.put("total", entry.getValue());
            result.add(item);
        }
        return result;
    }

    @GetMapping("/productos/top")
    public List<Map<String, Object>> getTopProductos() {
        LocalDateTime inicio = LocalDate.now().minusMonths(1).atStartOfDay();
        LocalDateTime fin = LocalDate.now().atTime(23, 59, 59);
        List<Object[]> top = ventaService.obtenerTopProductosRaw(inicio, fin);
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] obj : top) {
            Map<String, Object> item = new HashMap<>();
            item.put("nombre", obj[1]);
            item.put("cantidad", obj[3]);
            result.add(item);
        }
        return result;
    }

    @GetMapping("/utilidad/por-dia")
    public List<Map<String, Object>> getUtilidadPorDia() {
        Map<LocalDate, BigDecimal> utilidadPorDia = ventaService.obtenerUtilidadPorDiaUltimos7Dias();
        List<Map<String, Object>> result = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        for (Map.Entry<LocalDate, BigDecimal> entry : utilidadPorDia.entrySet()) {
            Map<String, Object> item = new HashMap<>();
            item.put("fecha", entry.getKey().format(formatter));
            item.put("utilidad", entry.getValue());
            result.add(item);
        }
        return result;
    }

    @GetMapping("/productos/stock-bajo")
    public List<Producto> getStockBajo() {
        return productoRepository.findByStockActualLessThanStockMinimo();
    }

    @GetMapping("/productos/total")
    public Map<String, Long> getTotalProductos() {
        return Collections.singletonMap("total", productoRepository.count());
    }

    @GetMapping("/clientes/total")
    public Map<String, Long> getTotalClientes() {
        return Collections.singletonMap("total", clienteRepository.count());
    }
}