package com.papeleria.service;

import com.papeleria.entity.MovimientoInventario;
import com.papeleria.repository.MovimientoInventarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MovimientoInventarioService {

    @Autowired
    private MovimientoInventarioRepository movimientoRepository;

    @Transactional
    public MovimientoInventario registrarMovimiento(MovimientoInventario movimiento) {
        return movimientoRepository.save(movimiento);
    }
}