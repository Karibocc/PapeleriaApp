package com.papeleria.repository;

import com.papeleria.entity.EstadoDocumento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface EstadoDocumentoRepository extends JpaRepository<EstadoDocumento, Integer> {
    Optional<EstadoDocumento> findByNombre(String nombre);
}