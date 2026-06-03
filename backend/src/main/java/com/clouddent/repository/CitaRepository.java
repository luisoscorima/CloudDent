package com.clouddent.repository;

import com.clouddent.entity.Cita;
import com.clouddent.entity.EstadoCita;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

public interface CitaRepository extends JpaRepository<Cita, Long> {

    @Query("""
            SELECT c FROM Cita c
            JOIN FETCH c.paciente
            JOIN FETCH c.odontologo
            WHERE c.fecha = :fecha
              AND (:odontologoId IS NULL OR c.odontologo.id = :odontologoId)
            ORDER BY c.hora ASC
            """)
    List<Cita> findByFechaAndOdontologo(@Param("fecha") LocalDate fecha,
                                        @Param("odontologoId") Long odontologoId);

    @Query("""
            SELECT c FROM Cita c
            JOIN FETCH c.paciente
            JOIN FETCH c.odontologo
            WHERE c.id = :id
            """)
    Optional<Cita> findByIdWithRelations(@Param("id") Long id);

    boolean existsByOdontologoIdAndFechaAndHoraAndEstadoNot(
            Long odontologoId, LocalDate fecha, LocalTime hora, EstadoCita estado);

    boolean existsByOdontologoIdAndFechaAndHoraAndEstadoNotAndIdNot(
            Long odontologoId, LocalDate fecha, LocalTime hora, EstadoCita estado, Long id);

    long countByFechaAndEstado(LocalDate fecha, EstadoCita estado);

    long countByFecha(LocalDate fecha);

    boolean existsByPacienteIdAndEstadoNot(Long pacienteId, EstadoCita estado);
}
