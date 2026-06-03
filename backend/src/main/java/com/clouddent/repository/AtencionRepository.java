package com.clouddent.repository;

import com.clouddent.entity.Atencion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface AtencionRepository extends JpaRepository<Atencion, Long> {

    @Query("""
            SELECT a FROM Atencion a
            JOIN FETCH a.odontologo
            WHERE a.paciente.id = :pacienteId
            ORDER BY a.fecha DESC, a.hora DESC
            """)
    List<Atencion> findByPacienteIdOrderByFechaDesc(@Param("pacienteId") Long pacienteId);

    @Query("""
            SELECT a FROM Atencion a
            JOIN FETCH a.paciente
            JOIN FETCH a.odontologo
            WHERE a.id = :id
            """)
    Optional<Atencion> findByIdWithRelations(@Param("id") Long id);

    boolean existsByCitaId(Long citaId);
}
