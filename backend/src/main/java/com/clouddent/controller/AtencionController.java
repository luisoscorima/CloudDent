package com.clouddent.controller;

import com.clouddent.dto.AtencionRequest;
import com.clouddent.dto.AtencionResponse;
import com.clouddent.service.AtencionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
public class AtencionController {

    private final AtencionService atencionService;

    public AtencionController(AtencionService atencionService) {
        this.atencionService = atencionService;
    }

    @GetMapping("/api/pacientes/{pacienteId}/historial")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','RECEPCIONISTA','ODONTOLOGO')")
    public ResponseEntity<List<AtencionResponse>> historial(@PathVariable Long pacienteId) {
        return ResponseEntity.ok(atencionService.listarHistorial(pacienteId));
    }

    @PostMapping("/api/pacientes/{pacienteId}/atenciones")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','ODONTOLOGO')")
    public ResponseEntity<AtencionResponse> crear(@PathVariable Long pacienteId,
                                                  @Valid @RequestBody AtencionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(atencionService.crear(pacienteId, request));
    }

    @PutMapping("/api/atenciones/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','ODONTOLOGO')")
    public ResponseEntity<AtencionResponse> actualizar(@PathVariable Long id,
                                                       @Valid @RequestBody AtencionRequest request) {
        return ResponseEntity.ok(atencionService.actualizar(id, request));
    }
}
