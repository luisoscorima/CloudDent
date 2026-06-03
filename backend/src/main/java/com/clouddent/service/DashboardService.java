package com.clouddent.service;

import com.clouddent.dto.DashboardResponse;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
public class DashboardService {

    private final PacienteService pacienteService;
    private final CitaService citaService;

    public DashboardService(PacienteService pacienteService, CitaService citaService) {
        this.pacienteService = pacienteService;
        this.citaService = citaService;
    }

    public DashboardResponse obtenerResumen() {
        LocalDate hoy = LocalDate.now();
        DashboardResponse response = new DashboardResponse();
        response.setTotalPacientes(pacienteService.contarTotal());
        response.setCitasHoy(citaService.contarCitasDelDia(hoy));
        response.setCitasConfirmadasHoy(citaService.contarCitasConfirmadasDelDia(hoy));
        return response;
    }
}
