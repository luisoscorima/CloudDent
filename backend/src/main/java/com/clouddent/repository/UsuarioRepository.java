package com.clouddent.repository;

import com.clouddent.entity.NombreRol;
import com.clouddent.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByUsername(String username);

    @Query("SELECT DISTINCT u FROM Usuario u JOIN u.roles r WHERE r.nombre = :rol AND u.activo = true")
    List<Usuario> findByRolNombre(@Param("rol") NombreRol rol);
}
