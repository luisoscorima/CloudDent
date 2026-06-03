package com.clouddent.controller;

import com.clouddent.dto.DashboardResponse;
import com.clouddent.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','RECEPCIONISTA','ODONTOLOGO')")
    public ResponseEntity<DashboardResponse> resumen() {
        return ResponseEntity.ok(dashboardService.obtenerResumen());
    }
}
