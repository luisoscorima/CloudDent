package com.clouddent.config;

import com.clouddent.entity.Atencion;
import com.clouddent.entity.Cita;
import com.clouddent.entity.EstadoCita;
import com.clouddent.entity.NombreRol;
import com.clouddent.entity.Paciente;
import com.clouddent.entity.Rol;
import com.clouddent.entity.Usuario;
import com.clouddent.repository.AtencionRepository;
import com.clouddent.repository.CitaRepository;
import com.clouddent.repository.PacienteRepository;
import com.clouddent.repository.RolRepository;
import com.clouddent.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RolRepository rolRepository;
    private final UsuarioRepository usuarioRepository;
    private final PacienteRepository pacienteRepository;
    private final CitaRepository citaRepository;
    private final AtencionRepository atencionRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(RolRepository rolRepository,
                           UsuarioRepository usuarioRepository,
                           PacienteRepository pacienteRepository,
                           CitaRepository citaRepository,
                           AtencionRepository atencionRepository,
                           PasswordEncoder passwordEncoder) {
        this.rolRepository = rolRepository;
        this.usuarioRepository = usuarioRepository;
        this.pacienteRepository = pacienteRepository;
        this.citaRepository = citaRepository;
        this.atencionRepository = atencionRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (rolRepository.count() > 0) {
            return;
        }

        Rol adminRol = crearRol(NombreRol.ADMINISTRADOR);
        Rol odontoRol = crearRol(NombreRol.ODONTOLOGO);
        Rol recepRol = crearRol(NombreRol.RECEPCIONISTA);

        String password = passwordEncoder.encode("Admin123!");

        Usuario admin = crearUsuario("admin", password, "Carlos", "Mendoza",
                "admin@clouddent.com", Set.of(adminRol));
        Usuario odonto = crearUsuario("odontologo", password, "Ana", "Torres",
                "ana@clouddent.com", Set.of(odontoRol));
        Usuario recep = crearUsuario("recepcionista", password, "María", "López",
                "maria@clouddent.com", Set.of(recepRol));

        Paciente p1 = crearPaciente("Luisa", "Márquez", "45678901",
                "987654321", "luisa@email.com", LocalDate.of(1990, 5, 15));
        Paciente p2 = crearPaciente("Carlos", "Rodríguez", "12345678",
                "912345678", "carlos@email.com", LocalDate.of(1985, 3, 20));
        Paciente p3 = crearPaciente("María", "Fernández", "87654321",
                "923456789", "maria.f@email.com", LocalDate.of(1992, 8, 10));

        LocalDate hoy = LocalDate.now();
        crearCita(hoy, LocalTime.of(9, 0), "Limpieza + Evaluación", EstadoCita.CONFIRMADA, p2, odonto);
        crearCita(hoy, LocalTime.of(10, 30), "Revisión Ortodoncia", EstadoCita.PENDIENTE, p3, odonto);
        crearCita(hoy.plusDays(1), LocalTime.of(15, 0), "Tratamiento Caries", EstadoCita.PENDIENTE, p1, odonto);

        crearAtencion(LocalDate.of(2024, 10, 24), LocalTime.of(9, 0),
                "Consulta General", "Evaluación caries 4.4. Se programa restauración.",
                "Restauración programada", p1, odonto, null);
        crearAtencion(LocalDate.of(2024, 3, 10), LocalTime.of(11, 0),
                "Limpieza Dental", "Profilaxis completa. Sin observaciones.",
                "Profilaxis", p1, odonto, null);
        crearAtencion(LocalDate.of(2023, 9, 15), LocalTime.of(14, 30),
                "Extracción 3.8", "Cordal inferior izquierdo. Cicatrización normal.",
                "Extracción cordal", p1, odonto, null);
    }

    private Rol crearRol(NombreRol nombre) {
        Rol rol = new Rol();
        rol.setNombre(nombre);
        return rolRepository.save(rol);
    }

    private Usuario crearUsuario(String username, String password, String nombres,
                               String apellidos, String email, Set<Rol> roles) {
        Usuario usuario = new Usuario();
        usuario.setUsername(username);
        usuario.setPassword(password);
        usuario.setNombres(nombres);
        usuario.setApellidos(apellidos);
        usuario.setEmail(email);
        usuario.setRoles(roles);
        return usuarioRepository.save(usuario);
    }

    private Paciente crearPaciente(String nombres, String apellidos, String dni,
                                   String telefono, String email, LocalDate fechaNac) {
        Paciente paciente = new Paciente();
        paciente.setNombres(nombres);
        paciente.setApellidos(apellidos);
        paciente.setDni(dni);
        paciente.setTelefono(telefono);
        paciente.setEmail(email);
        paciente.setFechaNacimiento(fechaNac);
        return pacienteRepository.save(paciente);
    }

    private void crearCita(LocalDate fecha, LocalTime hora, String motivo,
                           EstadoCita estado, Paciente paciente, Usuario odontologo) {
        Cita cita = new Cita();
        cita.setFecha(fecha);
        cita.setHora(hora);
        cita.setMotivo(motivo);
        cita.setEstado(estado);
        cita.setPaciente(paciente);
        cita.setOdontologo(odontologo);
        citaRepository.save(cita);
    }

    private void crearAtencion(LocalDate fecha, LocalTime hora, String diagnostico,
                               String observaciones, String tratamiento,
                               Paciente paciente, Usuario odontologo, Cita cita) {
        Atencion atencion = new Atencion();
        atencion.setFecha(fecha);
        atencion.setHora(hora);
        atencion.setDiagnostico(diagnostico);
        atencion.setObservaciones(observaciones);
        atencion.setTratamiento(tratamiento);
        atencion.setPaciente(paciente);
        atencion.setOdontologo(odontologo);
        atencion.setCita(cita);
        atencionRepository.save(atencion);
    }
}
