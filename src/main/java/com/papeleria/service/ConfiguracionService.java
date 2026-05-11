package com.papeleria.service;

import com.papeleria.entity.Configuracion;
import com.papeleria.exception.ResourceNotFoundException;
import com.papeleria.repository.ConfiguracionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

    public String getValor(String clave, String defaultValue) {
        try {
            Configuracion config = obtenerPorClave(clave);
            return config != null ? config.getValor() : defaultValue;
        } catch (ResourceNotFoundException e) {
            return defaultValue;
        }
    }

    public Map<String, String> obtenerTodasComoMapa() {
        Map<String, String> mapa = new HashMap<>();
        List<Configuracion> configs = configuracionRepository.findAll();
        for (Configuracion config : configs) {
            mapa.put(config.getClave(), config.getValor());
        }
        return mapa;
    }

    public Integer getIvaPorcentaje() {
        String ivaStr = getValor("iva_porcentaje", "19");
        try {
            return Integer.parseInt(ivaStr);
        } catch (NumberFormatException e) {
            return 19;
        }
    }

    public String getNombreNegocio() {
        return getValor("nombre_negocio", "Papelería App");
    }

    public String getNitNegocio() {
        return getValor("nit_negocio", "");
    }

    public String getTelefonoNegocio() {
        return getValor("telefono", "");
    }

    public String getCorreoNegocio() {
        return getValor("correo_negocio", "");
    }

    public String getDireccionNegocio() {
        return getValor("direccion_negocio", "");
    }

    @Transactional
    public Configuracion guardar(Configuracion configuracion) {
        Configuracion existente = null;
        try {
            existente = obtenerPorClave(configuracion.getClave());
        } catch (ResourceNotFoundException e) {
            // No existe, se creará uno nuevo
        }
        
        if (existente != null) {
            existente.setValor(configuracion.getValor());
            existente.setDescripcion(configuracion.getDescripcion());
            existente.setFechaActualizacion(LocalDateTime.now());
            return configuracionRepository.save(existente);
        }
        
        configuracion.setFechaActualizacion(LocalDateTime.now());
        return configuracionRepository.save(configuracion);
    }

    @Transactional
    public Configuracion actualizar(String clave, String nuevoValor) {
        Configuracion config = obtenerPorClave(clave);
        config.setValor(nuevoValor);
        config.setFechaActualizacion(LocalDateTime.now());
        return configuracionRepository.save(config);
    }

    @Transactional
    public void eliminar(String clave) {
        Configuracion config = obtenerPorClave(clave);
        configuracionRepository.delete(config);
    }

    @Transactional
    public void inicializarConfiguraciones() {
        String[][] configs = {
            {"nombre_negocio", "Papelería App", "Nombre del negocio"},
            {"nit_negocio", "900.000.000-1", "NIT o identificación del negocio"},
            {"telefono", "300 000 0000", "Teléfono de contacto"},
            {"correo_negocio", "contacto@papeleriaapp.com", "Correo del negocio"},
            {"direccion_negocio", "Calle Principal #123", "Dirección del negocio"},
            {"iva_porcentaje", "19", "Porcentaje de IVA"},
            {"iva_incluido", "false", "Indica si el precio ya incluye IVA"},
            {"impresora_default", "ticket", "Tipo de impresión por defecto"}
        };

        for (String[] config : configs) {
            try {
                obtenerPorClave(config[0]);
            } catch (ResourceNotFoundException e) {
                Configuracion nueva = new Configuracion();
                nueva.setClave(config[0]);
                nueva.setValor(config[1]);
                nueva.setDescripcion(config[2]);
                configuracionRepository.save(nueva);
            }
        }
    }
}