package com.papeleria.patterns.creational;

import com.papeleria.entity.Configuracion;
import com.papeleria.repository.ConfiguracionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import java.util.HashMap;
import java.util.Map;

@Component
public class ConfigManager {

    private static ConfigManager instance;
    private Map<String, String> configMap = new HashMap<>();

    @Autowired
    private ConfiguracionRepository configuracionRepository;

    @PostConstruct
    public void init() {
        loadFromDatabase();
        instance = this;
    }

    private void loadFromDatabase() {
        if (configuracionRepository != null) {
            configuracionRepository.findAll().forEach(c -> configMap.put(c.getClave(), c.getValor()));
        }
    }

    public static ConfigManager getInstance() {
        if (instance == null) {
            throw new IllegalStateException("ConfigManager no ha sido inicializado por Spring");
        }
        return instance;
    }

    public String getValor(String clave) {
        return configMap.getOrDefault(clave, "");
    }

    public void actualizarConfig(String clave, String valor) {
        configMap.put(clave, valor);
        // Opcional: persistir en BD si se tiene el repositorio
        if (configuracionRepository != null) {
            Configuracion config = configuracionRepository.findByClave(clave).orElse(new Configuracion());
            config.setClave(clave);
            config.setValor(valor);
            configuracionRepository.save(config);
        }
    }
}