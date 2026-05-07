package com.papeleria.service;

import com.papeleria.dto.TopProductoDTO;
import com.papeleria.dto.VentaRequestDTO;
import com.papeleria.entity.*;
import com.papeleria.exception.ResourceNotFoundException;
import com.papeleria.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.papeleria.service.TicketPrintService;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

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
    private MetodoPagoRepository metodoPagoRepository;
    @Autowired
    private EstadoDocumentoRepository estadoDocumentoRepository;
    @Autowired
    private TipoMovimientoRepository tipoMovimientoRepository;
    @Autowired
    private OrigenMovimientoRepository origenMovimientoRepository;
    @Autowired
    private MovimientoInventarioRepository movimientoInventarioRepository;

    @Autowired
    private TicketPrintService ticketPrintService;  // Inyección del servicio de impresión

    @Transactional
    public Venta registrarVenta(VentaRequestDTO request) {
        Venta venta = new Venta();
        venta.setFechaHora(LocalDateTime.now());
        venta.setDescuento(request.getDescuento());
        venta.setImpuesto(request.getImpuesto());
        venta.setMontoPagado(request.getMontoPagado());

        // Método de pago
        MetodoPago metodoPago = metodoPagoRepository.findByNombre(request.getMetodoPago().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Método de pago no encontrado: " + request.getMetodoPago()));
        venta.setMetodoPago(metodoPago);

        if (request.getIdCliente() != null) {
            Cliente cliente = clienteRepository.findById(request.getIdCliente())
                    .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado"));
            venta.setCliente(cliente);
        }

        Usuario usuario = usuarioRepository.findById(request.getIdUsuario())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        venta.setUsuario(usuario);

        // Estado por defecto: "registrada"
        EstadoDocumento estadoRegistrada = estadoDocumentoRepository.findByNombre("registrada")
                .orElseThrow(() -> new ResourceNotFoundException("Estado 'registrada' no encontrado"));
        venta.setEstado(estadoRegistrada);
        venta.setObservacion(request.getObservacion());

        BigDecimal subtotal = BigDecimal.ZERO;

        for (VentaRequestDTO.DetalleDTO detalleDTO : request.getDetalles()) {
            Producto producto = productoRepository.findById(detalleDTO.getIdProducto())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

            if (producto.getStockActual() < detalleDTO.getCantidad()) {
                throw new IllegalArgumentException("Stock insuficiente para: " + producto.getNombre());
            }

            DetalleVenta detalle = new DetalleVenta();
            detalle.setProducto(producto);
            detalle.setCantidad(detalleDTO.getCantidad());
            detalle.setPrecioUnitario(producto.getPrecioVenta());
            detalle.setDescuento(detalleDTO.getDescuento() != null ? detalleDTO.getDescuento() : BigDecimal.ZERO);
            detalle.setVenta(venta);
            venta.getDetalles().add(detalle);

            // Actualizar stock
            int stockAnterior = producto.getStockActual();
            int nuevaCantidad = stockAnterior - detalleDTO.getCantidad();
            producto.setStockActual(nuevaCantidad);
            productoRepository.save(producto);

            // Registrar movimiento de inventario (salida por venta)
            TipoMovimiento tipoSalida = tipoMovimientoRepository.findByNombre("salida")
                    .orElseThrow(() -> new ResourceNotFoundException("Tipo movimiento 'salida' no encontrado"));
            OrigenMovimiento origenVenta = origenMovimientoRepository.findByNombre("venta")
                    .orElseThrow(() -> new ResourceNotFoundException("Origen movimiento 'venta' no encontrado"));

            MovimientoInventario movimiento = new MovimientoInventario();
            movimiento.setProducto(producto);
            movimiento.setTipoMovimiento(tipoSalida);
            movimiento.setOrigenMovimiento(origenVenta);
            movimiento.setVenta(venta);
            movimiento.setCantidad(detalleDTO.getCantidad());
            movimiento.setStockAnterior(stockAnterior);
            movimiento.setStockPosterior(nuevaCantidad);
            movimiento.setCostoUnitario(producto.getPrecioCompra());
            movimiento.setUsuario(usuario);
            movimiento.setObservacion("Venta #" + (venta.getIdVenta() != null ? venta.getIdVenta() : "pendiente"));
            movimientoInventarioRepository.save(movimiento);

            BigDecimal linea = producto.getPrecioVenta()
                    .multiply(BigDecimal.valueOf(detalleDTO.getCantidad()))
                    .subtract(detalle.getDescuento());
            subtotal = subtotal.add(linea);
        }

        BigDecimal total = subtotal.add(venta.getImpuesto()).subtract(venta.getDescuento());
        if (venta.getMontoPagado().compareTo(total) < 0) {
            throw new IllegalArgumentException("Monto pagado insuficiente. Total: " + total);
        }

        Venta ventaGuardada = ventaRepository.save(venta);

        // --- IMPRESIÓN AUTOMÁTICA DEL TICKET ---
        // Se ejecuta en un hilo separado para no bloquear la respuesta
        new Thread(() -> {
            try {
                ticketPrintService.printTicket(ventaGuardada);  // ✅ corregido: usa ticketPrintService
            } catch (Exception e) {
                System.err.println("Error al imprimir ticket: " + e.getMessage());
                e.printStackTrace();
            }
        }).start();

        return ventaGuardada;
    }

    @Transactional
    public Venta anularVenta(Integer idVenta) {
        Venta venta = ventaRepository.findById(idVenta)
                .orElseThrow(() -> new ResourceNotFoundException("Venta no encontrada con id: " + idVenta));

        EstadoDocumento estadoAnulada = estadoDocumentoRepository.findByNombre("anulada")
                .orElseThrow(() -> new ResourceNotFoundException("Estado 'anulada' no encontrado"));

        if (venta.getEstado().getNombre().equals("anulada")) {
            throw new IllegalStateException("La venta ya está anulada");
        }

        TipoMovimiento tipoEntrada = tipoMovimientoRepository.findByNombre("entrada")
                .orElseThrow(() -> new ResourceNotFoundException("Tipo movimiento 'entrada' no encontrado"));
        OrigenMovimiento origenDevolucionVenta = origenMovimientoRepository.findByNombre("devolucion_venta")
                .orElseThrow(() -> new ResourceNotFoundException("Origen movimiento 'devolucion_venta' no encontrado"));

        // Revertir stock y registrar movimientos
        for (DetalleVenta detalle : venta.getDetalles()) {
            Producto producto = detalle.getProducto();
            int stockAnterior = producto.getStockActual();
            int nuevaCantidad = stockAnterior + detalle.getCantidad();
            producto.setStockActual(nuevaCantidad);
            productoRepository.save(producto);

            MovimientoInventario movimiento = new MovimientoInventario();
            movimiento.setProducto(producto);
            movimiento.setTipoMovimiento(tipoEntrada);
            movimiento.setOrigenMovimiento(origenDevolucionVenta);
            movimiento.setVenta(venta);
            movimiento.setCantidad(detalle.getCantidad());
            movimiento.setStockAnterior(stockAnterior);
            movimiento.setStockPosterior(nuevaCantidad);
            movimiento.setCostoUnitario(detalle.getPrecioUnitario());
            movimiento.setUsuario(venta.getUsuario());
            movimiento.setObservacion("Anulación de venta #" + venta.getIdVenta());
            movimientoInventarioRepository.save(movimiento);
        }

        venta.setEstado(estadoAnulada);
        return ventaRepository.save(venta);
    }

    /**
     * Obtiene los productos más vendidos en un rango de fechas.
     * @param fechaInicio fecha inicial (incluida)
     * @param fechaFin fecha final (incluida)
     * @return lista de TopProductoDTO ordenada por cantidad vendida descendente
     */
    public List<TopProductoDTO> obtenerTopProductos(LocalDate fechaInicio, LocalDate fechaFin) {
        LocalDateTime inicio = fechaInicio.atStartOfDay();
        LocalDateTime fin = fechaFin.atTime(LocalTime.MAX);
        return ventaRepository.findTopProductosEntreFechas(inicio, fin);
    }
}