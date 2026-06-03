package com.clouddent.service;

import com.clouddent.dto.RolResponse;
import com.clouddent.dto.UsuarioAdminRequest;
import com.clouddent.dto.UsuarioAdminResponse;
import com.clouddent.dto.UsuarioResponse;
import com.clouddent.entity.NombreRol;
import com.clouddent.entity.Rol;
import com.clouddent.entity.Usuario;
import com.clouddent.exception.BusinessException;
import com.clouddent.exception.ResourceNotFoundException;
import com.clouddent.mapper.EntityMapper;
import com.clouddent.repository.RolRepository;
import com.clouddent.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          RolRepository rolRepository,
                          PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UsuarioResponse> listarOdontologos() {
        return usuarioRepository.findByRolNombre(NombreRol.ODONTOLOGO).stream()
                .map(EntityMapper::toUsuarioResponse)
                .toList();
    }

    public List<UsuarioAdminResponse> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(this::toAdminResponse)
                .toList();
    }

    public UsuarioAdminResponse obtener(Long id) {
        return toAdminResponse(buscarEntidad(id));
    }

    @Transactional
    public UsuarioAdminResponse crear(UsuarioAdminRequest request) {
        if (usuarioRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new BusinessException("El nombre de usuario ya existe");
        }
        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new BusinessException("La contraseña es obligatoria al crear un usuario");
        }

        Usuario usuario = new Usuario();
        aplicarDatos(usuario, request, true);
        return toAdminResponse(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioAdminResponse actualizar(Long id, UsuarioAdminRequest request) {
        Usuario usuario = buscarEntidad(id);

        usuarioRepository.findByUsername(request.getUsername())
                .filter(u -> !u.getId().equals(id))
                .ifPresent(u -> {
                    throw new BusinessException("El nombre de usuario ya está en uso");
                });

        aplicarDatos(usuario, request, false);
        return toAdminResponse(usuarioRepository.save(usuario));
    }

    public List<RolResponse> listarRoles() {
        return rolRepository.findAll().stream()
                .map(r -> new RolResponse(r.getId(), r.getNombre().name()))
                .toList();
    }

    private Usuario buscarEntidad(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + id));
    }

    private void aplicarDatos(Usuario usuario, UsuarioAdminRequest request, boolean esCreacion) {
        usuario.setUsername(request.getUsername());
        usuario.setNombres(request.getNombres());
        usuario.setApellidos(request.getApellidos());
        usuario.setEmail(request.getEmail());
        usuario.setActivo(request.isActivo());

        if (esCreacion || (request.getPassword() != null && !request.getPassword().isBlank())) {
            usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        usuario.setRoles(resolverRoles(request.getRoles()));
    }

    private Set<Rol> resolverRoles(List<NombreRol> nombresRoles) {
        Set<Rol> roles = new HashSet<>();
        for (NombreRol nombre : nombresRoles) {
            Rol rol = rolRepository.findByNombre(nombre)
                    .orElseThrow(() -> new BusinessException("Rol no encontrado: " + nombre));
            roles.add(rol);
        }
        return roles;
    }

    private UsuarioAdminResponse toAdminResponse(Usuario usuario) {
        UsuarioAdminResponse response = new UsuarioAdminResponse();
        response.setId(usuario.getId());
        response.setUsername(usuario.getUsername());
        response.setNombres(usuario.getNombres());
        response.setApellidos(usuario.getApellidos());
        response.setEmail(usuario.getEmail());
        response.setActivo(usuario.isActivo());
        response.setRoles(usuario.getRoles().stream()
                .map(r -> r.getNombre().name())
                .collect(Collectors.toList()));
        return response;
    }
}
