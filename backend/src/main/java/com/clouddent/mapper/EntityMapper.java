package com.clouddent.mapper;

import com.clouddent.dto.CitaResponse;
import com.clouddent.dto.PacienteResponse;
import com.clouddent.dto.UsuarioResponse;
import com.clouddent.entity.Cita;
import com.clouddent.entity.Paciente;
import com.clouddent.entity.Usuario;

import java.util.List;
import java.util.stream.Collectors;

public final class EntityMapper {

    private EntityMapper() {
    }

    public static UsuarioResponse toUsuarioResponse(Usuario usuario) {
        UsuarioResponse response = new UsuarioResponse();
        response.setId(usuario.getId());
        response.setUsername(usuario.getUsername());
        response.setNombres(usuario.getNombres());
        response.setApellidos(usuario.getApellidos());
        response.setEmail(usuario.getEmail());
        response.setRoles(usuario.getRoles().stream()
                .map(rol -> rol.getNombre().name())
                .collect(Collectors.toList()));
        return response;
    }

    public static PacienteResponse toPacienteResponse(Paciente paciente) {
        PacienteResponse response = new PacienteResponse();
        response.setId(paciente.getId());
        response.setNombres(paciente.getNombres());
        response.setApellidos(paciente.getApellidos());
        response.setDni(paciente.getDni());
        response.setTelefono(paciente.getTelefono());
        response.setEmail(paciente.getEmail());
        response.setFechaNacimiento(paciente.getFechaNacimiento());
        return response;
    }

    public static CitaResponse toCitaResponse(Cita cita) {
        CitaResponse response = new CitaResponse();
        response.setId(cita.getId());
        response.setFecha(cita.getFecha());
        response.setHora(cita.getHora());
        response.setMotivo(cita.getMotivo());
        response.setEstado(cita.getEstado());
        response.setPacienteId(cita.getPaciente().getId());
        response.setPacienteNombre(cita.getPaciente().getNombres() + " " + cita.getPaciente().getApellidos());
        response.setOdontologoId(cita.getOdontologo().getId());
        response.setOdontologoNombre(cita.getOdontologo().getNombres() + " " + cita.getOdontologo().getApellidos());
        return response;
    }
}
