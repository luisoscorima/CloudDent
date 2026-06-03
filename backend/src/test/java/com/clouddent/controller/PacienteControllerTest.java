package com.clouddent.controller;

import com.clouddent.dto.PacienteRequest;
import com.clouddent.dto.PacienteResponse;
import com.clouddent.service.PacienteService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PacienteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PacienteService pacienteService;

    @Test
    @WithMockUser(roles = "ODONTOLOGO")
    void crear_comoOdontologo_retorna403() throws Exception {
        PacienteRequest request = pacienteValido();

        mockMvc.perform(post("/api/pacientes")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "RECEPCIONISTA")
    void crear_comoRecepcionista_retorna201() throws Exception {
        PacienteRequest request = pacienteValido();
        PacienteResponse response = new PacienteResponse();
        response.setId(1L);
        response.setDni(request.getDni());

        when(pacienteService.crear(any(PacienteRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/pacientes")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());
    }

    private PacienteRequest pacienteValido() {
        PacienteRequest request = new PacienteRequest();
        request.setNombres("Maria");
        request.setApellidos("Garcia");
        request.setDni("87654321");
        request.setEmail("maria@test.com");
        return request;
    }
}
