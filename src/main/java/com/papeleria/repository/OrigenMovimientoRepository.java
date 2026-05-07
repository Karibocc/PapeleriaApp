package com.papeleria.repository;

import com.papeleria.entity.OrigenMovimiento;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OrigenMovimientoRepository extends JpaRepository<OrigenMovimiento, Integer> {
    Optional<OrigenMovimiento> findByNombre(String nombre);
}
