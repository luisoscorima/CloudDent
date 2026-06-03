package com.clouddent.repository;

import com.clouddent.entity.Paciente;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PacienteRepository extends JpaRepository<Paciente, Long> {
    Optional<Paciente> findByDni(String dni);
    boolean existsByDni(String dni);

    @Query("""
            SELECT p FROM Paciente p
            WHERE LOWER(p.nombres) LIKE LOWER(CONCAT('%', :busqueda, '%'))
               OR LOWER(p.apellidos) LIKE LOWER(CONCAT('%', :busqueda, '%'))
               OR p.dni LIKE CONCAT('%', :busqueda, '%')
            """)
    Page<Paciente> buscar(@Param("busqueda") String busqueda, Pageable pageable);
}
