package com.papeleria.patterns.creational;

import com.papeleria.dto.FacturaDTO;
import com.papeleria.entity.Cliente;
import com.papeleria.entity.DetalleVenta;
import com.papeleria.entity.Usuario;
import com.papeleria.entity.Venta;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class FacturaBuilder {

    private Long idFactura;
    private Long idVenta;
    private String numeroFactura;
    private LocalDateTime fechaEmision;
    private String nombreNegocio;
    private String nitNegocio;
    private String telefonoNegocio;
    private String correoNegocio;
    private String direccionNegocio;
    private Integer idCliente;
    private String nombreCliente;
    private String correoCliente;
    private String telefonoCliente;
    private String direccionCliente;
    private String nombreVendedor;
    private List<FacturaDTO.DetalleFacturaDTO> detalles = new ArrayList<>();
    private BigDecimal subtotal = BigDecimal.ZERO;
    private BigDecimal descuento = BigDecimal.ZERO;
    private BigDecimal impuesto = BigDecimal.ZERO;
    private BigDecimal total = BigDecimal.ZERO;
    private BigDecimal montoPagado = BigDecimal.ZERO;
    private BigDecimal cambio = BigDecimal.ZERO;
    private String metodoPago;
    private String observaciones;

    // Métodos fluidos
    public FacturaBuilder conIdFactura(Long idFactura) { this.idFactura = idFactura; return this; }
    public FacturaBuilder conIdVenta(Long idVenta) { this.idVenta = idVenta; return this; }
    public FacturaBuilder conNumeroFactura(String numeroFactura) { this.numeroFactura = numeroFactura; return this; }
    public FacturaBuilder conFechaEmision(LocalDateTime fechaEmision) { this.fechaEmision = fechaEmision; return this; }

    public FacturaBuilder conDatosNegocio(String nombre, String nit, String telefono, String correo, String direccion) {
        this.nombreNegocio = nombre;
        this.nitNegocio = nit;
        this.telefonoNegocio = telefono;
        this.correoNegocio = correo;
        this.direccionNegocio = direccion;
        return this;
    }

    public FacturaBuilder conCliente(Cliente cliente) {
        if (cliente != null) {
            this.idCliente = cliente.getIdCliente();
            this.nombreCliente = cliente.getNombre();
            this.correoCliente = cliente.getCorreo();
            this.telefonoCliente = cliente.getTelefono();
            this.direccionCliente = cliente.getDireccion();
        }
        return this;
    }

    public FacturaBuilder conVendedor(Usuario usuario) {
        if (usuario != null) {
            this.nombreVendedor = usuario.getNombreCompleto();
        }
        return this;
    }

    public FacturaBuilder agregarDetalle(FacturaDTO.DetalleFacturaDTO detalle) {
        this.detalles.add(detalle);
        return this;
    }

    public FacturaBuilder agregarDetalleDesdeDetalleVenta(DetalleVenta detalleVenta) {
        FacturaDTO.DetalleFacturaDTO dto = new FacturaDTO.DetalleFacturaDTO();
        dto.setIdProducto(detalleVenta.getProducto().getIdProducto());
        dto.setCodigoBarras(detalleVenta.getProducto().getCodigoBarras());
        dto.setNombreProducto(detalleVenta.getProducto().getNombre());
        dto.setCantidad(detalleVenta.getCantidad());
        dto.setPrecioUnitario(detalleVenta.getPrecioUnitario());
        dto.setDescuentoLinea(detalleVenta.getDescuento());
        dto.setSubtotalLinea(detalleVenta.getPrecioUnitario()
                .multiply(BigDecimal.valueOf(detalleVenta.getCantidad()))
                .subtract(detalleVenta.getDescuento()));
        return agregarDetalle(dto);
    }

    public FacturaBuilder conSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; return this; }
    public FacturaBuilder conDescuento(BigDecimal descuento) { this.descuento = descuento; return this; }
    public FacturaBuilder conImpuesto(BigDecimal impuesto) { this.impuesto = impuesto; return this; }
    public FacturaBuilder conTotal(BigDecimal total) { this.total = total; return this; }
    public FacturaBuilder conMontoPagado(BigDecimal montoPagado) { this.montoPagado = montoPagado; return this; }
    public FacturaBuilder conCambio(BigDecimal cambio) { this.cambio = cambio; return this; }
    public FacturaBuilder conMetodoPago(String metodoPago) { this.metodoPago = metodoPago; return this; }
    public FacturaBuilder conObservaciones(String observaciones) { this.observaciones = observaciones; return this; }

    public FacturaDTO build() {
        FacturaDTO dto = new FacturaDTO();
        dto.setIdFactura(idFactura);
        dto.setIdVenta(idVenta);
        dto.setNumeroFactura(numeroFactura);
        dto.setFechaEmision(fechaEmision != null ? fechaEmision : LocalDateTime.now());
        dto.setNombreNegocio(nombreNegocio);
        dto.setNitNegocio(nitNegocio);
        dto.setTelefonoNegocio(telefonoNegocio);
        dto.setCorreoNegocio(correoNegocio);
        dto.setDireccionNegocio(direccionNegocio);
        dto.setIdCliente(idCliente);
        dto.setNombreCliente(nombreCliente);
        dto.setCorreoCliente(correoCliente);
        dto.setTelefonoCliente(telefonoCliente);
        dto.setDireccionCliente(direccionCliente);
        dto.setNombreVendedor(nombreVendedor);
        dto.setDetalles(detalles);
        dto.setSubtotal(subtotal);
        dto.setDescuento(descuento);
        dto.setImpuesto(impuesto);
        dto.setTotal(total);
        dto.setMontoPagado(montoPagado);
        dto.setCambio(cambio);
        dto.setMetodoPago(metodoPago);
        dto.setObservaciones(observaciones);
        return dto;
    }

    // Método estático para construir desde una venta (requiere ConfigManager)
    public static FacturaDTO fromVenta(Venta venta, ConfigManager config) {
        FacturaBuilder builder = new FacturaBuilder()
                .conIdVenta(venta.getIdVenta().longValue())
                .conNumeroFactura("FAC-" + venta.getIdVenta())
                .conFechaEmision(venta.getFechaHora())
                .conDatosNegocio(
                        config.getValor("nombre_negocio"),
                        config.getValor("nit_negocio"),
                        config.getValor("telefono"),
                        config.getValor("correo_negocio"),
                        config.getValor("direccion_negocio")
                )
                .conCliente(venta.getCliente())
                .conVendedor(venta.getUsuario())
                .conDescuento(venta.getDescuento())
                .conImpuesto(venta.getImpuesto())
                .conMontoPagado(venta.getMontoPagado())
                .conMetodoPago(venta.getMetodoPago() != null ? venta.getMetodoPago().name() : "efectivo")
                .conObservaciones(venta.getObservacion());

        for (DetalleVenta dv : venta.getDetalles()) {
            builder.agregarDetalleDesdeDetalleVenta(dv);
        }

        BigDecimal subtotalCalc = builder.detalles.stream()
                .map(FacturaDTO.DetalleFacturaDTO::getSubtotalLinea)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        builder.conSubtotal(subtotalCalc);
        BigDecimal totalCalc = subtotalCalc.add(venta.getImpuesto()).subtract(venta.getDescuento());
        builder.conTotal(totalCalc);
        builder.conCambio(venta.getMontoPagado().subtract(totalCalc));

        return builder.build();
    }
}