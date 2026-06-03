package com.clouddent.service;

import com.clouddent.dto.CitaRequest;
import com.clouddent.dto.CitaResponse;
import com.clouddent.entity.Cita;
import com.clouddent.entity.EstadoCita;
import com.clouddent.entity.NombreRol;
import com.clouddent.entity.Paciente;
import com.clouddent.entity.Usuario;
import com.clouddent.exception.BusinessException;
import com.clouddent.exception.ResourceNotFoundException;
import com.clouddent.mapper.EntityMapper;
import com.clouddent.repository.CitaRepository;
import com.clouddent.repository.PacienteRepository;
import com.clouddent.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class CitaService {

    private final CitaRepository citaRepository;
    private final PacienteRepository pacienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final AtencionService atencionService;

    public CitaService(CitaRepository citaRepository,
                       PacienteRepository pacienteRepository,
                       UsuarioRepository usuarioRepository,
                       AtencionService atencionService) {
        this.citaRepository = citaRepository;
        this.pacienteRepository = pacienteRepository;
        this.usuarioRepository = usuarioRepository;
        this.atencionService = atencionService;
    }

    public List<CitaResponse> listarPorFecha(LocalDate fecha, Long odontologoId) {
        return citaRepository.findByFechaAndOdontologo(fecha, odontologoId).stream()
                .map(EntityMapper::toCitaResponse)
                .toList();
    }

    public CitaResponse obtener(Long id) {
        Cita cita = citaRepository.findByIdWithRelations(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cita no encontrada con id: " + id));
        return EntityMapper.toCitaResponse(cita);
    }

    @Transactional
    public CitaResponse crear(CitaRequest request) {
        validarHorarioDisponible(request.getOdontologoId(), request.getFecha(), request.getHora(), null);
        Cita cita = new Cita();
        aplicarDatos(cita, request);
        cita.setEstado(EstadoCita.PENDIENTE);
        Cita guardada = citaRepository.save(cita);
        return obtener(guardada.getId());
    }

    @Transactional
    public CitaResponse actualizar(Long id, CitaRequest request) {
        Cita cita = citaRepository.findByIdWithRelations(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cita no encontrada con id: " + id));

        if (cita.getEstado() == EstadoCita.CANCELADA) {
            throw new BusinessException("No se puede modificar una cita cancelada");
        }

        validarHorarioDisponible(request.getOdontologoId(), request.getFecha(), request.getHora(), id);
        aplicarDatos(cita, request);

        if (request.getEstado() != null) {
            validarTransicionEstado(cita.getEstado(), request.getEstado());
            cita.setEstado(request.getEstado());
        }

        citaRepository.save(cita);

        if (request.getEstado() == EstadoCita.ATENDIDA) {
            atencionService.crearDesdeCitaAtendida(cita);
        }

        return obtener(id);
    }

    @Transactional
    public CitaResponse cancelar(Long id) {
        Cita cita = citaRepository.findByIdWithRelations(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cita no encontrada con id: " + id));

        if (cita.getEstado() != EstadoCita.PENDIENTE && cita.getEstado() != EstadoCita.CONFIRMADA) {
            throw new BusinessException("Solo se pueden cancelar citas pendientes o confirmadas");
        }

        cita.setEstado(EstadoCita.CANCELADA);
        citaRepository.save(cita);
        return EntityMapper.toCitaResponse(cita);
    }

    public long contarCitasDelDia(LocalDate fecha) {
        return citaRepository.countByFecha(fecha);
    }

    public long contarCitasConfirmadasDelDia(LocalDate fecha) {
        return citaRepository.countByFechaAndEstado(fecha, EstadoCita.CONFIRMADA);
    }

    private void aplicarDatos(Cita cita, CitaRequest request) {
        Paciente paciente = pacienteRepository.findById(request.getPacienteId())
                .orElseThrow(() -> new ResourceNotFoundException("Paciente no encontrado"));
        Usuario odontologo = usuarioRepository.findById(request.getOdontologoId())
                .orElseThrow(() -> new ResourceNotFoundException("Odontólogo no encontrado"));

        boolean esOdontologo = odontologo.getRoles().stream()
                .anyMatch(r -> r.getNombre() == NombreRol.ODONTOLOGO);
        if (!esOdontologo) {
            throw new BusinessException("El usuario seleccionado no es odontólogo");
        }

        cita.setFecha(request.getFecha());
        cita.setHora(request.getHora());
        cita.setMotivo(request.getMotivo());
        cita.setPaciente(paciente);
        cita.setOdontologo(odontologo);
    }

    private void validarHorarioDisponible(Long odontologoId, LocalDate fecha,
                                          java.time.LocalTime hora, Long citaId) {
        boolean ocupado = citaId == null
                ? citaRepository.existsByOdontologoIdAndFechaAndHoraAndEstadoNot(
                odontologoId, fecha, hora, EstadoCita.CANCELADA)
                : citaRepository.existsByOdontologoIdAndFechaAndHoraAndEstadoNotAndIdNot(
                odontologoId, fecha, hora, EstadoCita.CANCELADA, citaId);

        if (ocupado) {
            throw new BusinessException("El odontólogo ya tiene una cita en ese horario");
        }
    }

    private void validarTransicionEstado(EstadoCita actual, EstadoCita nuevo) {
        if (actual == nuevo) {
            return;
        }
        boolean valida = switch (actual) {
            case PENDIENTE -> nuevo == EstadoCita.CONFIRMADA || nuevo == EstadoCita.CANCELADA;
            case CONFIRMADA -> nuevo == EstadoCita.ATENDIDA || nuevo == EstadoCita.CANCELADA;
            case ATENDIDA, CANCELADA -> false;
        };
        if (!valida) {
            throw new BusinessException("Transición de estado no permitida: " + actual + " -> " + nuevo);
        }
    }
}
