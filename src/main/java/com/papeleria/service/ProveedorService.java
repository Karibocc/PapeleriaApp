package com.papeleria.service;

import com.papeleria.entity.Proveedor;
import com.papeleria.exception.ResourceNotFoundException;
import com.papeleria.repository.ProveedorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ProveedorService {

    @Autowired
    private ProveedorRepository proveedorRepository;

    public List<Proveedor> listarTodos() {
        return proveedorRepository.findAll();
    }

    public List<Proveedor> listarActivos() {
        return proveedorRepository.findByEstado("activo");
    }

    public Proveedor obtenerPorId(Integer id) {
        return proveedorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado con id: " + id));
    }

    public Proveedor obtenerPorNit(String nit) {
        return proveedorRepository.findByNit(nit)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado con NIT: " + nit));
    }

    public boolean existeNit(String nit) {
        if (nit == null || nit.isEmpty()) {
            return false;
        }
        return proveedorRepository.existsByNit(nit);
    }

    public List<Proveedor> buscarPorNombre(String nombre) {
        return proveedorRepository.buscarPorNombre(nombre);
    }

    public List<Proveedor> buscarPorContacto(String contacto) {
        return proveedorRepository.buscarPorContacto(contacto);
    }

    @Transactional
    public Proveedor guardar(Proveedor proveedor) {
        if (proveedor.getNit() != null && !proveedor.getNit().isEmpty()) {
            if (proveedorRepository.existsByNit(proveedor.getNit())) {
                throw new IllegalArgumentException("Ya existe un proveedor con el NIT: " + proveedor.getNit());
            }
        }
        if (proveedor.getIdProveedor() == null) {
            proveedor.setFechaCreacion(LocalDateTime.now());
        }
        proveedor.setFechaActualizacion(LocalDateTime.now());
        return proveedorRepository.save(proveedor);
    }

    @Transactional
    public Proveedor actualizar(Integer id, Proveedor proveedorActualizado) {
        Proveedor proveedor = obtenerPorId(id);
        proveedor.setNombre(proveedorActualizado.getNombre());
        proveedor.setNit(proveedorActualizado.getNit());
        proveedor.setContacto(proveedorActualizado.getContacto());
        proveedor.setTelefono(proveedorActualizado.getTelefono());
        proveedor.setCorreo(proveedorActualizado.getCorreo());
        proveedor.setDireccion(proveedorActualizado.getDireccion());
        proveedor.setEstado(proveedorActualizado.getEstado());
        proveedor.setFechaActualizacion(LocalDateTime.now());
        return proveedorRepository.save(proveedor);
    }

    @Transactional
    public void eliminar(Integer id) {
        Proveedor proveedor = obtenerPorId(id);
        proveedorRepository.delete(proveedor);
    }

    @Transactional
    public Proveedor desactivar(Integer id) {
        Proveedor proveedor = obtenerPorId(id);
        proveedor.setEstado("inactivo");
        proveedor.setFechaActualizacion(LocalDateTime.now());
        return proveedorRepository.save(proveedor);
    }

    @Transactional
    public Proveedor activar(Integer id) {
        Proveedor proveedor = obtenerPorId(id);
        proveedor.setEstado("activo");
        proveedor.setFechaActualizacion(LocalDateTime.now());
        return proveedorRepository.save(proveedor);
    }
}