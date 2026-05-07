package com.papeleria.repository;

import com.papeleria.entity.TipoMovimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TipoMovimientoRepository extends JpaRepository<TipoMovimiento, Integer> {
    Optional<TipoMovimiento> findByNombre(String nombre);
}