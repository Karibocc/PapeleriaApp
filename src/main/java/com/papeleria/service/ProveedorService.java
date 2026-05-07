package com.papeleria.service;

import com.papeleria.entity.Proveedor;
import com.papeleria.exception.ResourceNotFoundException;
import com.papeleria.repository.ProveedorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProveedorService {

    @Autowired
    private ProveedorRepository proveedorRepository;

    public List<Proveedor> listarTodos() {
        return proveedorRepository.findAll();
    }

    public Proveedor obtenerPorId(Integer id) {
        return proveedorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado con id: " + id));
    }

    public Proveedor obtenerPorNit(String nit) {
        return proveedorRepository.findByNit(nit)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado con NIT: " + nit));
    }

    @Transactional
    public Proveedor guardar(Proveedor proveedor) {
        // Validación opcional: evitar duplicados de NIT
        if (proveedor.getNit() != null && !proveedor.getNit().isEmpty()) {
            proveedorRepository.findByNit(proveedor.getNit()).ifPresent(p -> {
                throw new IllegalArgumentException("Ya existe un proveedor con el NIT: " + proveedor.getNit());
            });
        }
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
        return proveedorRepository.save(proveedor);
    }

    @Transactional
    public void eliminar(Integer id) {
        Proveedor proveedor = obtenerPorId(id);
        // Podrías verificar si tiene compras asociadas antes de eliminar
        proveedorRepository.delete(proveedor);
    }
}