package com.clouddent.service;

import com.clouddent.dto.CitaRequest;
import com.clouddent.entity.EstadoCita;
import com.clouddent.exception.BusinessException;
import com.clouddent.repository.CitaRepository;
import com.clouddent.repository.PacienteRepository;
import com.clouddent.repository.UsuarioRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CitaServiceTest {

    @Mock
    private CitaRepository citaRepository;

    @Mock
    private PacienteRepository pacienteRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private AtencionService atencionService;

    @InjectMocks
    private CitaService citaService;

    @Test
    void crear_conHorarioOcupado_lanzaBusinessException() {
        CitaRequest request = new CitaRequest();
        request.setFecha(LocalDate.of(2026, 6, 10));
        request.setHora(LocalTime.of(10, 0));
        request.setPacienteId(1L);
        request.setOdontologoId(2L);

        when(citaRepository.existsByOdontologoIdAndFechaAndHoraAndEstadoNot(
                eq(2L), eq(request.getFecha()), eq(request.getHora()), eq(EstadoCita.CANCELADA)))
                .thenReturn(true);

        assertThatThrownBy(() -> citaService.crear(request))
                .isInstanceOf(BusinessException.class)
                .hasMessageContaining("horario");
    }
}
