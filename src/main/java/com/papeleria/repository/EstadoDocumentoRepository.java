package com.papeleria.repository;

import com.papeleria.entity.EstadoDocumento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EstadoDocumentoRepository extends JpaRepository<EstadoDocumento, Integer> {
    Optional<EstadoDocumento> findByNombre(String nombre);
}