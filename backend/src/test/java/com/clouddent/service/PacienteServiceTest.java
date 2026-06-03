package com.clouddent.service;

import com.clouddent.dto.PacienteRequest;
import com.clouddent.entity.EstadoCita;
import com.clouddent.entity.Paciente;
import com.clouddent.exception.BusinessException;
import com.clouddent.repository.CitaRepository;
import com.clouddent.repository.PacienteRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PacienteServiceTest {

    @Mock
    private PacienteRepository pacienteRepository;

    @Mock
    private CitaRepository citaRepository;

    @InjectMocks
    private PacienteService pacienteService;

    @Test
    void crear_conDniDuplicado_lanzaBusinessException() {
        PacienteRequest request = new PacienteRequest();
        request.setNombres("Ana");
        request.setApellidos("Lopez");
        request.setDni("12345678");

        when(pacienteRepository.existsByDni("12345678")).thenReturn(true);

        assertThatThrownBy(() -> pacienteService.crear(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("12345678");
    }

    @Test
    void eliminar_conCitasActivas_lanzaBusinessException() {
        Paciente paciente = new Paciente();
        paciente.setId(1L);

        when(pacienteRepository.findById(1L)).thenReturn(Optional.of(paciente));
        when(citaRepository.existsByPacienteIdAndEstadoNot(1L, EstadoCita.CANCELADA)).thenReturn(true);

        assertThatThrownBy(() -> pacienteService.eliminar(1L))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("citas activas");
    }

    @Test
    void eliminar_sinCitasActivas_eliminaPaciente() {
        Paciente paciente = new Paciente();
        paciente.setId(1L);

        when(pacienteRepository.findById(1L)).thenReturn(Optional.of(paciente));
        when(citaRepository.existsByPacienteIdAndEstadoNot(1L, EstadoCita.CANCELADA)).thenReturn(false);

        pacienteService.eliminar(1L);

        verify(pacienteRepository).delete(paciente);
    }
}
