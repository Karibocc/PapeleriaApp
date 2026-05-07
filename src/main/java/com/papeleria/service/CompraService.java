package com.papeleria.service;

import com.papeleria.dto.CompraRequestDTO;
import com.papeleria.entity.*;
import com.papeleria.exception.ResourceNotFoundException;
import com.papeleria.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class CompraService {

    @Autowired
    private CompraRepository compraRepository;
    @Autowired
    private ProveedorRepository proveedorRepository;
    @Autowired
    private ProductoRepository productoRepository;
    @Autowired
    private UsuarioRepository usuarioRepository;
    @Autowired
    private EstadoDocumentoRepository estadoDocumentoRepository;
    @Autowired
    private TipoMovimientoRepository tipoMovimientoRepository;
    @Autowired
    private OrigenMovimientoRepository origenMovimientoRepository;
    @Autowired
    private MovimientoInventarioRepository movimientoInventarioRepository;

    public List<Compra> listarTodas() {
        return compraRepository.findAll();
    }

    public Compra obtenerPorId(Integer id) {
        return compraRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Compra no encontrada con id: " + id));
    }

    @Transactional
    public Compra registrarCompra(CompraRequestDTO request) {
        Compra compra = new Compra();
        compra.setFechaHora(LocalDateTime.now());
        compra.setNumeroFactura(request.getNumeroFactura());
        compra.setImpuesto(request.getImpuesto());
        compra.setObservacion(request.getObservacion());

        Proveedor proveedor = proveedorRepository.findById(request.getIdProveedor())
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado"));
        compra.setProveedor(proveedor);

        Usuario usuario = usuarioRepository.findById(request.getIdUsuario())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        compra.setUsuario(usuario);

        // Estado por defecto: "registrada" (buscamos el ID en la tabla estado_documento)
        EstadoDocumento estadoRegistrada = estadoDocumentoRepository.findByNombre("registrada")
                .orElseThrow(() -> new ResourceNotFoundException("Estado 'registrada' no encontrado"));
        compra.setEstado(estadoRegistrada);

        List<DetalleCompra> detalles = new ArrayList<>();
        for (CompraRequestDTO.DetalleDTO detalleDTO : request.getDetalles()) {
            Producto producto = productoRepository.findById(detalleDTO.getIdProducto())
                    .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado"));

            DetalleCompra detalle = new DetalleCompra();
            detalle.setProducto(producto);
            detalle.setCantidad(detalleDTO.getCantidad());
            detalle.setCostoUnitario(detalleDTO.getCostoUnitario());
            detalle.setCompra(compra);
            detalles.add(detalle);
        }
        compra.setDetalles(detalles);

        compra = compraRepository.save(compra);

        // Obtener tipos de movimiento y origen
        TipoMovimiento tipoEntrada = tipoMovimientoRepository.findByNombre("entrada")
                .orElseThrow(() -> new ResourceNotFoundException("Tipo movimiento 'entrada' no encontrado"));
        OrigenMovimiento origenCompra = origenMovimientoRepository.findByNombre("compra")
                .orElseThrow(() -> new ResourceNotFoundException("Origen movimiento 'compra' no encontrado"));

        // Actualizar stock y generar movimientos
        for (DetalleCompra detalle : compra.getDetalles()) {
            Producto producto = detalle.getProducto();
            int stockAnterior = producto.getStockActual();
            int nuevaCantidad = stockAnterior + detalle.getCantidad();
            producto.setStockActual(nuevaCantidad);
            productoRepository.save(producto);

            MovimientoInventario movimiento = new MovimientoInventario();
            movimiento.setProducto(producto);
            movimiento.setTipoMovimiento(tipoEntrada);
            movimiento.setOrigenMovimiento(origenCompra);
            movimiento.setCompra(compra);   // en lugar de setReferenciaId
            movimiento.setCantidad(detalle.getCantidad());
            movimiento.setStockAnterior(stockAnterior);
            movimiento.setStockPosterior(nuevaCantidad);
            movimiento.setCostoUnitario(detalle.getCostoUnitario());
            movimiento.setUsuario(usuario);
            movimiento.setObservacion("Compra #" + compra.getIdCompra());
            movimientoInventarioRepository.save(movimiento);
        }

        return compra;
    }

    @Transactional
    public Compra anularCompra(Integer idCompra) {
        Compra compra = obtenerPorId(idCompra);
        EstadoDocumento estadoAnulada = estadoDocumentoRepository.findByNombre("anulada")
                .orElseThrow(() -> new ResourceNotFoundException("Estado 'anulada' no encontrado"));
        if (compra.getEstado().getNombre().equals("anulada")) {
            throw new IllegalStateException("La compra ya está anulada");
        }

        TipoMovimiento tipoSalida = tipoMovimientoRepository.findByNombre("salida")
                .orElseThrow(() -> new ResourceNotFoundException("Tipo movimiento 'salida' no encontrado"));
        OrigenMovimiento origenDevolucionCompra = origenMovimientoRepository.findByNombre("devolucion_compra")
                .orElseThrow(() -> new ResourceNotFoundException("Origen movimiento 'devolucion_compra' no encontrado"));

        // Revertir stock
        for (DetalleCompra detalle : compra.getDetalles()) {
            Producto producto = detalle.getProducto();
            int stockAnterior = producto.getStockActual();
            int nuevaCantidad = stockAnterior - detalle.getCantidad();
            producto.setStockActual(nuevaCantidad);
            productoRepository.save(producto);

            MovimientoInventario movimiento = new MovimientoInventario();
            movimiento.setProducto(producto);
            movimiento.setTipoMovimiento(tipoSalida);
            movimiento.setOrigenMovimiento(origenDevolucionCompra);
            movimiento.setCompra(compra);
            movimiento.setCantidad(detalle.getCantidad());
            movimiento.setStockAnterior(stockAnterior);
            movimiento.setStockPosterior(nuevaCantidad);
            movimiento.setCostoUnitario(detalle.getCostoUnitario());
            movimiento.setUsuario(compra.getUsuario());
            movimiento.setObservacion("Anulación de compra #" + compra.getIdCompra());
            movimientoInventarioRepository.save(movimiento);
        }

        compra.setEstado(estadoAnulada);
        return compraRepository.save(compra);
    }

    @Transactional
    public void eliminarCompra(Integer idCompra) {
        Compra compra = obtenerPorId(idCompra);
        if (!compra.getEstado().getNombre().equals("anulada")) {
            throw new IllegalStateException("Solo se pueden eliminar compras anuladas");
        }
        compraRepository.delete(compra);
    }
}