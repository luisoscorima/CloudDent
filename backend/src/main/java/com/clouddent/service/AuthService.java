package com.clouddent.service;

import com.clouddent.config.JwtProperties;
import com.clouddent.dto.LoginRequest;
import com.clouddent.dto.LoginResponse;
import com.clouddent.dto.UsuarioResponse;
import com.clouddent.entity.Usuario;
import com.clouddent.exception.ResourceNotFoundException;
import com.clouddent.mapper.EntityMapper;
import com.clouddent.repository.UsuarioRepository;
import com.clouddent.security.CustomUserDetails;
import com.clouddent.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final UsuarioRepository usuarioRepository;

    public AuthService(AuthenticationManager authenticationManager,
                       JwtService jwtService,
                       JwtProperties jwtProperties,
                       UsuarioRepository usuarioRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.jwtProperties = jwtProperties;
        this.usuarioRepository = usuarioRepository;
    }

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Usuario usuario = userDetails.getUsuario();

        var roles = usuario.getRoles().stream()
                .map(rol -> rol.getNombre().name())
                .collect(Collectors.toList());

        String token = jwtService.generateToken(usuario.getUsername(), roles);

        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setExpiraEn(jwtProperties.getExpirationMs());
        response.setUsuario(EntityMapper.toUsuarioResponse(usuario));
        return response;
    }

    public UsuarioResponse getCurrentUser(String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        return EntityMapper.toUsuarioResponse(usuario);
    }
}
