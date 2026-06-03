package com.clouddent.service;

import com.clouddent.dto.PacienteRequest;
import com.clouddent.dto.PacienteResponse;
import com.clouddent.entity.EstadoCita;
import com.clouddent.entity.Paciente;
import com.clouddent.exception.BusinessException;
import com.clouddent.exception.ResourceNotFoundException;
import com.clouddent.mapper.EntityMapper;
import com.clouddent.repository.CitaRepository;
import com.clouddent.repository.PacienteRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PacienteService {

    private final PacienteRepository pacienteRepository;
    private final CitaRepository citaRepository;

    public PacienteService(PacienteRepository pacienteRepository, CitaRepository citaRepository) {
        this.pacienteRepository = pacienteRepository;
        this.citaRepository = citaRepository;
    }

    public Page<PacienteResponse> listar(String busqueda, Pageable pageable) {
        Page<Paciente> page = (busqueda == null || busqueda.isBlank())
                ? pacienteRepository.findAll(pageable)
                : pacienteRepository.buscar(busqueda.trim(), pageable);
        return page.map(EntityMapper::toPacienteResponse);
    }

    public PacienteResponse obtener(Long id) {
        return EntityMapper.toPacienteResponse(buscarEntidad(id));
    }

    @Transactional
    public PacienteResponse crear(PacienteRequest request) {
        if (pacienteRepository.existsByDni(request.getDni())) {
            throw new BusinessException("Ya existe un paciente con el DNI: " + request.getDni());
        }
        Paciente paciente = mapToEntity(new Paciente(), request);
        return EntityMapper.toPacienteResponse(pacienteRepository.save(paciente));
    }

    @Transactional
    public PacienteResponse actualizar(Long id, PacienteRequest request) {
        Paciente paciente = buscarEntidad(id);
        pacienteRepository.findByDni(request.getDni())
                .filter(p -> !p.getId().equals(id))
                .ifPresent(p -> {
                    throw new BusinessException("El DNI ya está registrado para otro paciente");
                });
        mapToEntity(paciente, request);
        return EntityMapper.toPacienteResponse(pacienteRepository.save(paciente));
    }

    @Transactional
    public void eliminar(Long id) {
        Paciente paciente = buscarEntidad(id);
        if (citaRepository.existsByPacienteIdAndEstadoNot(id, EstadoCita.CANCELADA)) {
            throw new BusinessException("No se puede eliminar: el paciente tiene citas activas");
        }
        pacienteRepository.delete(paciente);
    }

    public long contarTotal() {
        return pacienteRepository.count();
    }

    private Paciente buscarEntidad(Long id) {
        return pacienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente no encontrado con id: " + id));
    }

    private Paciente mapToEntity(Paciente paciente, PacienteRequest request) {
        paciente.setNombres(request.getNombres());
        paciente.setApellidos(request.getApellidos());
        paciente.setDni(request.getDni());
        paciente.setTelefono(request.getTelefono());
        paciente.setEmail(request.getEmail());
        paciente.setFechaNacimiento(request.getFechaNacimiento());
        return paciente;
    }
}
