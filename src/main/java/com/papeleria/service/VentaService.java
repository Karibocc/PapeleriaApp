package com.papeleria.service;

import com.papeleria.dto.FacturaDTO;
import com.papeleria.dto.TopProductoDTO;
import com.papeleria.dto.VentaRequestDTO;
import com.papeleria.entity.*;
import com.papeleria.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
public class VentaService {

    @Autowired
    private VentaRepository ventaRepository;
    
    @Autowired
    private ProductoRepository productoRepository;
    
    @Autowired
    private ClienteRepository clienteRepository;
    
    @Autowired
    private UsuarioRepository usuarioRepository;
    
    @Autowired
    private DetalleVentaRepository detalleVentaRepository;

    // ==================== MÉTODOS PARA DASHBOARD ====================

    @Transactional(readOnly = true)
    public Map<String, Object> obtenerResumenDashboard() {
        LocalDate ahora = LocalDate.now();
        LocalDateTime inicioMes = LocalDate.of(ahora.getYear(), ahora.getMonth(), 1).atStartOfDay();
        LocalDateTime finMes = LocalDate.of(ahora.getYear(), ahora.getMonth(), ahora.lengthOfMonth()).atTime(LocalTime.MAX);
        
        BigDecimal totalVentasMes = ventaRepository.sumTotalVentasPorFecha(inicioMes, finMes);
        Long cantidadVentasMes = ventaRepository.countVentasPorFecha(inicioMes, finMes);
        BigDecimal utilidadMes = ventaRepository.sumUtilidadPorFecha(inicioMes, finMes);
        
        Map<String, Object> resumen = new HashMap<>();
        resumen.put("totalVentasMes", totalVentasMes != null ? totalVentasMes : BigDecimal.ZERO);
        resumen.put("cantidadVentasMes", cantidadVentasMes != null ? cantidadVentasMes : 0L);
        resumen.put("utilidadMes", utilidadMes != null ? utilidadMes : BigDecimal.ZERO);
        
        System.out.println("=== RESUMEN DASHBOARD ===");
        System.out.println("Total ventas mes: " + totalVentasMes);
        System.out.println("Cantidad ventas mes: " + cantidadVentasMes);
        System.out.println("Utilidad mes: " + utilidadMes);
        
        return resumen;
    }

    @Transactional(readOnly = true)
    public List<Venta> obtenerVentasUltimos7Dias() {
        LocalDateTime inicio = LocalDate.now().minusDays(7).atStartOfDay();
        LocalDateTime fin = LocalDate.now().atTime(LocalTime.MAX);
        List<Venta> ventas = ventaRepository.findVentasPorFecha(inicio, fin);
        System.out.println("Ventas últimos 7 días: " + ventas.size());
        return ventas;
    }

    @Transactional(readOnly = true)
    public Map<LocalDate, BigDecimal> obtenerUtilidadPorDiaUltimos7Dias() {
        Map<LocalDate, BigDecimal> utilidadPorDia = new LinkedHashMap<>();
        LocalDate hoy = LocalDate.now();
        
        for (int i = 7; i >= 0; i--) {
            LocalDate dia = hoy.minusDays(i);
            LocalDateTime inicio = dia.atStartOfDay();
            LocalDateTime fin = dia.atTime(LocalTime.MAX);
            BigDecimal utilidad = ventaRepository.sumUtilidadPorFecha(inicio, fin);
            utilidadPorDia.put(dia, utilidad != null ? utilidad : BigDecimal.ZERO);
        }
        return utilidadPorDia;
    }

    // Método necesario para DashboardRestController
    @Transactional(readOnly = true)
    public List<Object[]> obtenerTopProductosRaw(LocalDateTime inicio, LocalDateTime fin) {
        return ventaRepository.findProductosMasVendidos(inicio, fin, 5);
    }

    // ==================== MÉTODOS EXISTENTES ACTUALIZADOS ====================

    @Transactional(readOnly = true)
    public List<Venta> listarTodas() {
        return ventaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Venta obtenerPorId(Integer id) {
        return ventaRepository.findById(id).orElse(null);
    }

    @Transactional(readOnly = true)
    public List<Venta> obtenerVentasPorFechas(LocalDateTime inicio, LocalDateTime fin) {
        return ventaRepository.findVentasPorFecha(inicio, fin);
    }

    @Transactional(readOnly = true)
    public List<Venta> obtenerVentasPorCliente(Integer idCliente) {
        return ventaRepository.findByClienteIdCliente(idCliente);
    }

    @Transactional(readOnly = true)
    public List<Venta> obtenerVentasPorUsuario(Integer idUsuario) {
        return ventaRepository.findByUsuarioIdUsuario(idUsuario);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> obtenerTotalesDelDia() {
        LocalDateTime inicio = LocalDate.now().atStartOfDay();
        LocalDateTime fin = LocalDate.now().atTime(LocalTime.MAX);
        BigDecimal totalVentas = ventaRepository.sumTotalVentasPorFecha(inicio, fin);
        Long cantidadVentas = ventaRepository.countVentasPorFecha(inicio, fin);
        
        Map<String, Object> resultado = new HashMap<>();
        resultado.put("totalVentas", totalVentas != null ? totalVentas : BigDecimal.ZERO);
        resultado.put("cantidadVentas", cantidadVentas != null ? cantidadVentas : 0L);
        resultado.put("fecha", LocalDate.now().toString());
        return resultado;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> obtenerTotalesDelMes() {
        LocalDate ahora = LocalDate.now();
        LocalDateTime inicio = LocalDate.of(ahora.getYear(), ahora.getMonth(), 1).atStartOfDay();
        LocalDateTime fin = LocalDate.of(ahora.getYear(), ahora.getMonth(), ahora.lengthOfMonth()).atTime(LocalTime.MAX);
        
        BigDecimal totalVentas = ventaRepository.sumTotalVentasPorFecha(inicio, fin);
        Long cantidadVentas = ventaRepository.countVentasPorFecha(inicio, fin);
        
        Map<String, Object> resultado = new HashMap<>();
        resultado.put("totalVentas", totalVentas != null ? totalVentas : BigDecimal.ZERO);
        resultado.put("cantidadVentas", cantidadVentas != null ? cantidadVentas : 0L);
        resultado.put("mes", ahora.getMonth().toString());
        resultado.put("ano", ahora.getYear());
        return resultado;
    }

    @Transactional(readOnly = true)
    public BigDecimal obtenerUtilidadDelMes() {
        LocalDate ahora = LocalDate.now();
        LocalDateTime inicio = LocalDate.of(ahora.getYear(), ahora.getMonth(), 1).atStartOfDay();
        LocalDateTime fin = LocalDate.of(ahora.getYear(), ahora.getMonth(), ahora.lengthOfMonth()).atTime(LocalTime.MAX);
        BigDecimal utilidad = ventaRepository.sumUtilidadPorFecha(inicio, fin);
        return utilidad != null ? utilidad : BigDecimal.ZERO;
    }

    // NUEVO MÉTODO PARA UTILIDAD POR PERÍODO PERSONALIZADO (Útil para reportes)
    @Transactional(readOnly = true)
    public BigDecimal obtenerUtilidadPorPeriodo(LocalDate fechaInicio, LocalDate fechaFin) {
        LocalDateTime inicio = fechaInicio.atStartOfDay();
        LocalDateTime fin = fechaFin.atTime(LocalTime.MAX);
        BigDecimal utilidad = ventaRepository.sumUtilidadPorFecha(inicio, fin);
        return utilidad != null ? utilidad : BigDecimal.ZERO;
    }

    // ==================== FACTURACIÓN Y VENTAS ====================

    @Transactional(readOnly = true)
    public FacturaDTO obtenerFactura(Integer idVenta) {
        Venta venta = ventaRepository.findById(idVenta)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada con id: " + idVenta));
        
        FacturaDTO factura = new FacturaDTO();
        factura.setIdVenta(Long.valueOf(venta.getIdVenta()));
        factura.setFechaEmision(venta.getFechaHora());
        factura.setMetodoPago(venta.getMetodoPago());
        factura.setDescuento(venta.getDescuento());
        factura.setImpuesto(venta.getImpuesto());
        factura.setMontoPagado(venta.getMontoPagado());
        factura.setObservaciones(venta.getObservacion());
        
        factura.setNombreNegocio("Papelería App");
        factura.setNitNegocio("900.000.000-1");
        factura.setTelefonoNegocio("300 000 0000");
        factura.setCorreoNegocio("ventas@papeapp.com");
        factura.setDireccionNegocio("Calle Principal #123");
        
        if (venta.getCliente() != null) {
            factura.setIdCliente(venta.getCliente().getIdCliente());
            factura.setNombreCliente(venta.getCliente().getNombre());
            factura.setTelefonoCliente(venta.getCliente().getTelefono());
            factura.setDireccionCliente(venta.getCliente().getDireccion());
        } else {
            factura.setNombreCliente("Cliente Mostrador");
        }
        
        if (venta.getUsuario() != null) {
            factura.setNombreVendedor(venta.getUsuario().getNombreCompleto());
        }
        
        List<FacturaDTO.DetalleFacturaDTO> detallesDTO = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        
        List<DetalleVenta> detalles = detalleVentaRepository.findByVentaIdVenta(idVenta);
        for (DetalleVenta detalle : detalles) {
            FacturaDTO.DetalleFacturaDTO detalleDTO = new FacturaDTO.DetalleFacturaDTO();
            detalleDTO.setIdProducto(detalle.getProducto().getIdProducto());
            detalleDTO.setCodigoBarras(detalle.getProducto().getCodigoBarras());
            detalleDTO.setNombreProducto(detalle.getProducto().getNombre());
            detalleDTO.setCantidad(detalle.getCantidad());
            detalleDTO.setPrecioUnitario(detalle.getPrecioUnitario());
            detalleDTO.setDescuentoLinea(detalle.getDescuento());
            
            BigDecimal subtotalLinea = detalle.getPrecioUnitario().multiply(BigDecimal.valueOf(detalle.getCantidad()));
            detalleDTO.setSubtotalLinea(subtotalLinea);
            
            detallesDTO.add(detalleDTO);
            subtotal = subtotal.add(subtotalLinea);
        }
        
        factura.setDetalles(detallesDTO);
        factura.setSubtotal(subtotal);
        BigDecimal total = subtotal.add(venta.getImpuesto()).subtract(venta.getDescuento());
        factura.setTotal(total);
        factura.setCambio(venta.getMontoPagado().subtract(total));
        
        return factura;
    }

    @Transactional
    public Venta registrarVenta(VentaRequestDTO request) {
        System.out.println("=== REGISTRANDO VENTA ===");
        System.out.println("Descuento recibido: " + request.getDescuento());
        System.out.println("Impuesto recibido: " + request.getImpuesto());
        System.out.println("MontoPagado recibido: " + request.getMontoPagado());
        
        BigDecimal subtotalCalculado = BigDecimal.ZERO;
        for (VentaRequestDTO.DetalleDTO detalleDTO : request.getDetalles()) {
            Producto producto = productoRepository.findById(detalleDTO.getIdProducto()).orElse(null);
            if (producto != null) {
                BigDecimal itemTotal = producto.getPrecioVenta().multiply(BigDecimal.valueOf(detalleDTO.getCantidad()));
                subtotalCalculado = subtotalCalculado.add(itemTotal);
                System.out.println("Producto: " + producto.getNombre() + " - Cantidad: " + detalleDTO.getCantidad() + " - Subtotal linea: " + itemTotal);
            }
        }
        
        BigDecimal ivaPorcentaje = new BigDecimal("0.19");
        BigDecimal impuestoCalculado = subtotalCalculado.multiply(ivaPorcentaje).setScale(2, RoundingMode.HALF_UP);
        
        System.out.println("Subtotal calculado: " + subtotalCalculado);
        System.out.println("Impuesto calculado (19%): " + impuestoCalculado);
        
        Venta venta = new Venta();
        venta.setFechaHora(LocalDateTime.now());
        venta.setDescuento(request.getDescuento() != null ? request.getDescuento() : BigDecimal.ZERO);
        venta.setImpuesto(impuestoCalculado);
        venta.setMontoPagado(request.getMontoPagado() != null ? request.getMontoPagado() : BigDecimal.ZERO);
        venta.setMetodoPago(request.getMetodoPago());
        venta.setObservacion(request.getObservacion());

        if (request.getIdCliente() != null && request.getIdCliente() > 0) {
            Cliente cliente = clienteRepository.findById(request.getIdCliente()).orElse(null);
            venta.setCliente(cliente);
        }

        Usuario usuario = usuarioRepository.findById(request.getIdUsuario()).orElse(null);
        venta.setUsuario(usuario);
        
        venta.setEstado(null);

        Venta ventaGuardada = ventaRepository.save(venta);
        System.out.println("Venta guardada con ID: " + ventaGuardada.getIdVenta());

        for (VentaRequestDTO.DetalleDTO detalleDTO : request.getDetalles()) {
            Producto producto = productoRepository.findById(detalleDTO.getIdProducto()).orElse(null);
            
            if (producto == null) {
                throw new RuntimeException("Producto no encontrado: " + detalleDTO.getIdProducto());
            }
            
            if (producto.getStockActual() < detalleDTO.getCantidad()) {
                throw new RuntimeException("Stock insuficiente para el producto: " + producto.getNombre());
            }

            DetalleVenta detalle = new DetalleVenta();
            detalle.setVenta(ventaGuardada);
            detalle.setProducto(producto);
            detalle.setCantidad(detalleDTO.getCantidad());
            detalle.setPrecioUnitario(producto.getPrecioVenta());
            detalle.setDescuento(detalleDTO.getDescuento() != null ? detalleDTO.getDescuento() : BigDecimal.ZERO);
            
            detalleVentaRepository.save(detalle);
            
            int nuevoStock = producto.getStockActual() - detalleDTO.getCantidad();
            producto.setStockActual(nuevoStock);
            productoRepository.save(producto);
            
            System.out.println("Stock actualizado - Producto: " + producto.getNombre() + ", Stock restante: " + nuevoStock);
        }

        System.out.println("=== VENTA REGISTRADA EXITOSAMENTE ===");
        return ventaGuardada;
    }

    @Transactional
    public Venta anularVenta(Integer idVenta) {
        Venta venta = ventaRepository.findById(idVenta)
                .orElseThrow(() -> new RuntimeException("Venta no encontrada con id: " + idVenta));

        if (venta.getEstado() != null) {
            throw new IllegalStateException("La venta ya está anulada");
        }

        List<DetalleVenta> detalles = detalleVentaRepository.findByVentaIdVenta(idVenta);
        for (DetalleVenta detalle : detalles) {
            Producto producto = detalle.getProducto();
            int nuevoStock = producto.getStockActual() + detalle.getCantidad();
            producto.setStockActual(nuevoStock);
            productoRepository.save(producto);
        }

        return venta;
    }

    @Transactional(readOnly = true)
    public List<TopProductoDTO> obtenerTopProductos(LocalDate fechaInicio, LocalDate fechaFin) {
        LocalDateTime inicio = fechaInicio.atStartOfDay();
        LocalDateTime fin = fechaFin.atTime(LocalTime.MAX);
        return ventaRepository.findTopProductosEntreFechas(inicio, fin);
    }
}