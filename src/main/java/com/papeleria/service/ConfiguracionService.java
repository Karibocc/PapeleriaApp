package com.papeleria.service;

import com.papeleria.entity.Configuracion;
import com.papeleria.exception.ResourceNotFoundException;
import com.papeleria.repository.ConfiguracionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class ConfiguracionService {

    @Autowired
    private ConfiguracionRepository configuracionRepository;

    public List<Configuracion> listarTodas() {
        return configuracionRepository.findAll();
    }

    public Configuracion obtenerPorClave(String clave) {
        return configuracionRepository.findByClave(clave)
                .orElseThrow(() -> new ResourceNotFoundException("Configuración no encontrada con clave: " + clave));
    }

    @Transactional
    public Configuracion guardar(Configuracion configuracion) {
        return configuracionRepository.save(configuracion);
    }

    @Transactional
    public Configuracion actualizar(String clave, String nuevoValor) {
        Configuracion config = obtenerPorClave(clave);
        config.setValor(nuevoValor);
        return configuracionRepository.save(config);
    }

    @Transactional
    public void eliminar(String clave) {
        Configuracion config = obtenerPorClave(clave);
        configuracionRepository.delete(config);
    }
}
