package com.clouddent.service;

import com.clouddent.dto.AtencionRequest;
import com.clouddent.dto.AtencionResponse;
import com.clouddent.entity.Atencion;
import com.clouddent.entity.Cita;
import com.clouddent.entity.NombreRol;
import com.clouddent.entity.Paciente;
import com.clouddent.entity.Usuario;
import com.clouddent.exception.BusinessException;
import com.clouddent.exception.ResourceNotFoundException;
import com.clouddent.repository.AtencionRepository;
import com.clouddent.repository.CitaRepository;
import com.clouddent.repository.PacienteRepository;
import com.clouddent.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AtencionService {

    private final AtencionRepository atencionRepository;
    private final PacienteRepository pacienteRepository;
    private final UsuarioRepository usuarioRepository;
    private final CitaRepository citaRepository;

    public AtencionService(AtencionRepository atencionRepository,
                           PacienteRepository pacienteRepository,
                           UsuarioRepository usuarioRepository,
                           CitaRepository citaRepository) {
        this.atencionRepository = atencionRepository;
        this.pacienteRepository = pacienteRepository;
        this.usuarioRepository = usuarioRepository;
        this.citaRepository = citaRepository;
    }

    public List<AtencionResponse> listarHistorial(Long pacienteId) {
        pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente no encontrado"));
        return atencionRepository.findByPacienteIdOrderByFechaDesc(pacienteId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AtencionResponse crear(Long pacienteId, AtencionRequest request) {
        Paciente paciente = pacienteRepository.findById(pacienteId)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente no encontrado"));

        Atencion atencion = new Atencion();
        atencion.setPaciente(paciente);
        aplicarDatos(atencion, request);
        Atencion guardada = atencionRepository.save(atencion);
        return toResponse(atencionRepository.findByIdWithRelations(guardada.getId()).orElse(guardada));
    }

    @Transactional
    public AtencionResponse actualizar(Long id, AtencionRequest request) {
        Atencion atencion = atencionRepository.findByIdWithRelations(id)
                .orElseThrow(() -> new ResourceNotFoundException("Atención no encontrada"));
        aplicarDatos(atencion, request);
        atencionRepository.save(atencion);
        return toResponse(atencion);
    }

    /** Crea atención automática al marcar una cita como ATENDIDA (si no existe ya). */
    @Transactional
    public void crearDesdeCitaAtendida(Cita cita) {
        if (cita.getId() != null && atencionRepository.existsByCitaId(cita.getId())) {
            return;
        }
        Atencion atencion = new Atencion();
        atencion.setPaciente(cita.getPaciente());
        atencion.setOdontologo(cita.getOdontologo());
        atencion.setCita(cita);
        atencion.setFecha(cita.getFecha());
        atencion.setHora(cita.getHora());
        atencion.setTratamiento(cita.getMotivo());
        atencion.setDiagnostico("Atención registrada desde cita");
        atencionRepository.save(atencion);
    }

    private void aplicarDatos(Atencion atencion, AtencionRequest request) {
        atencion.setFecha(request.getFecha());
        atencion.setHora(request.getHora());
        atencion.setDiagnostico(request.getDiagnostico());
        atencion.setObservaciones(request.getObservaciones());
        atencion.setTratamiento(request.getTratamiento());

        Long odontologoId = request.getOdontologoId() != null
                ? request.getOdontologoId()
                : (atencion.getOdontologo() != null ? atencion.getOdontologo().getId() : null);

        if (odontologoId == null) {
            throw new BusinessException("El odontólogo es obligatorio");
        }

        Usuario odontologo = usuarioRepository.findById(odontologoId)
                .orElseThrow(() -> new ResourceNotFoundException("Odontólogo no encontrado"));

        boolean esOdontologo = odontologo.getRoles().stream()
                .anyMatch(r -> r.getNombre() == NombreRol.ODONTOLOGO || r.getNombre() == NombreRol.ADMINISTRADOR);
        if (!esOdontologo) {
            throw new BusinessException("El usuario no puede registrar atenciones clínicas");
        }
        atencion.setOdontologo(odontologo);

        if (request.getCitaId() != null) {
            Cita cita = citaRepository.findById(request.getCitaId())
                    .orElseThrow(() -> new ResourceNotFoundException("Cita no encontrada"));
            atencion.setCita(cita);
        }
    }

    private AtencionResponse toResponse(Atencion atencion) {
        AtencionResponse response = new AtencionResponse();
        response.setId(atencion.getId());
        response.setFecha(atencion.getFecha());
        response.setHora(atencion.getHora());
        response.setDiagnostico(atencion.getDiagnostico());
        response.setObservaciones(atencion.getObservaciones());
        response.setTratamiento(atencion.getTratamiento());
        response.setPacienteId(atencion.getPaciente().getId());
        response.setOdontologoId(atencion.getOdontologo().getId());
        response.setOdontologoNombre(atencion.getOdontologo().getNombres() + " "
                + atencion.getOdontologo().getApellidos());
        if (atencion.getCita() != null) {
            response.setCitaId(atencion.getCita().getId());
        }
        return response;
    }
}
