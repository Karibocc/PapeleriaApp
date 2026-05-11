package com.papeleria.service;

import com.papeleria.entity.Cliente;
import com.papeleria.exception.ResourceNotFoundException;
import com.papeleria.repository.ClienteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    public List<Cliente> listarTodos() {
        return clienteRepository.findAll();
    }

    public List<Cliente> listarActivos() {
        return clienteRepository.findByActivoTrue();
    }

    public Cliente obtenerPorId(Integer id) {
        return clienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con id: " + id));
    }

    public Cliente obtenerPorDocumento(String documento) {
        return clienteRepository.findByDocumento(documento).orElse(null);
    }

    public boolean existeDocumento(String documento) {
        if (documento == null || documento.isEmpty()) {
            return false;
        }
        return clienteRepository.existsByDocumento(documento);
    }

    public List<Cliente> buscarPorNombre(String nombre) {
        return clienteRepository.buscarPorNombre(nombre);
    }

    public List<Cliente> buscarPorDocumento(String documento) {
        return clienteRepository.buscarPorDocumento(documento);
    }

    @Transactional
    public Cliente guardar(Cliente cliente) {
        if (cliente.getIdCliente() == null) {
            cliente.setFechaCreacion(LocalDateTime.now());
        }
        cliente.setFechaActualizacion(LocalDateTime.now());
        return clienteRepository.save(cliente);
    }

    @Transactional
    public Cliente actualizar(Integer id, Cliente clienteActualizado) {
        Cliente cliente = obtenerPorId(id);
        cliente.setNombre(clienteActualizado.getNombre());
        cliente.setDocumento(clienteActualizado.getDocumento());
        cliente.setEmail(clienteActualizado.getEmail());
        cliente.setTelefono(clienteActualizado.getTelefono());
        cliente.setDireccion(clienteActualizado.getDireccion());
        cliente.setActivo(clienteActualizado.getActivo());
        cliente.setFechaActualizacion(LocalDateTime.now());
        return clienteRepository.save(cliente);
    }

    @Transactional
    public void eliminar(Integer id) {
        Cliente cliente = obtenerPorId(id);
        clienteRepository.delete(cliente);
    }

    @Transactional
    public Cliente desactivar(Integer id) {
        Cliente cliente = obtenerPorId(id);
        cliente.setActivo(false);
        cliente.setFechaActualizacion(LocalDateTime.now());
        return clienteRepository.save(cliente);
    }

    @Transactional
    public Cliente activar(Integer id) {
        Cliente cliente = obtenerPorId(id);
        cliente.setActivo(true);
        cliente.setFechaActualizacion(LocalDateTime.now());
        return clienteRepository.save(cliente);
    }
}