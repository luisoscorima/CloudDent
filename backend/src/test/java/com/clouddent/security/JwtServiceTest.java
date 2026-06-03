package com.clouddent.security;

import com.clouddent.config.JwtProperties;
import com.clouddent.entity.Usuario;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceTest {

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        JwtProperties properties = new JwtProperties();
        properties.setSecret("TestSecretKeyParaCloudDentMinimo32Chars!!");
        properties.setExpirationMs(3_600_000);
        jwtService = new JwtService(properties);
    }

    @Test
    void generateToken_extraeUsernameYRoles() {
        String token = jwtService.generateToken("admin", List.of("ADMINISTRADOR"));

        assertThat(jwtService.extractUsername(token)).isEqualTo("admin");
        assertThat(jwtService.extractRoles(token)).containsExactly("ADMINISTRADOR");
    }

    @Test
    void isTokenValid_retornaTrueParaUsuarioCorrecto() {
        String token = jwtService.generateToken("recepcionista", List.of("RECEPCIONISTA"));
        Usuario usuario = new Usuario();
        usuario.setUsername("recepcionista");
        CustomUserDetails userDetails = new CustomUserDetails(usuario);

        assertThat(jwtService.isTokenValid(token, userDetails)).isTrue();
    }

    @Test
    void isTokenValid_retornaFalseParaUsuarioIncorrecto() {
        String token = jwtService.generateToken("admin", List.of("ADMINISTRADOR"));
        Usuario usuario = new Usuario();
        usuario.setUsername("otro");
        CustomUserDetails userDetails = new CustomUserDetails(usuario);

        assertThat(jwtService.isTokenValid(token, userDetails)).isFalse();
    }
}
