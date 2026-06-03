# CloudDent MVP — Versión 1

Sistema web SaaS para clínicas odontológicas. Arquitectura de tres capas:

- **Back-End:** Java 17, Spring Boot 3, Spring Security JWT, Spring Data JPA
- **Front-End:** React, Tailwind CSS, Axios
- **Base de Datos:** PostgreSQL
- **Infraestructura:** Docker Compose

## Trazabilidad Product Backlog

| HU | Como | Estado | Implementación |
|----|------|--------|----------------|
| HU01 | Usuario | Cumple | Login JWT, `AuthContext`, rutas protegidas |
| HU02 | Administrador | Cumple | `UsuarioController`, `UsuariosAdminPage`, menú por rol |
| HU03 | Recepcionista | Cumple | `POST /api/pacientes`, formulario alta |
| HU04 | Usuario (admin/recep.) | Cumple | `PUT /api/pacientes` — edición por ADMIN y RECEPCIONISTA; odontólogo solo lectura + ficha |
| HU05 | Odontólogo | Cumple | Entidad `Atencion`, `GET /api/pacientes/{id}/historial`, `PacienteDetallePage` |
| HU06 | Recepcionista | Cumple | `POST /api/citas`, agenda |
| HU07 | Usuario | Cumple | `PUT` y `PATCH .../cancelar` citas |
| HU08 | Sistema | Cumple | Colores por estado en listas; filtros en Agenda; leyenda visual |

## Estructura del proyecto

```
CloudDent/
├── backend/
├── frontend/
├── docker-compose.yml
└── *.html (mockups de referencia)
```

## Requisitos

- Java 17+
- Maven 3.9+
- Node.js 20+
- Docker y Docker Compose (opcional)

## Usuarios demo

Contraseña: `Admin123!`

| Usuario | Rol | Módulos visibles |
|---------|-----|------------------|
| `admin` | ADMINISTRADOR | Panel, Pacientes, Agenda, Usuarios |
| `odontologo` | ODONTOLOGO | Panel, Pacientes (lectura + ficha), Agenda |
| `recepcionista` | RECEPCIONISTA | Panel, Pacientes (CRUD), Agenda |

## Despliegue con Docker

```bash
cp .env.example .env
docker compose up --build
```

- Frontend: http://localhost
- API: http://localhost:8080
- Swagger: http://localhost:8080/swagger-ui.html

## Desarrollo local

### PostgreSQL

```bash
docker run -d --name clouddent-pg \
  -e POSTGRES_DB=clouddent \
  -e POSTGRES_USER=clouddent \
  -e POSTGRES_PASSWORD=clouddent123 \
  -p 5432:5432 postgres:16-alpine
```

### Back-End

```powershell
$env:JAVA_HOME="C:\Program Files\Java\jdk-23"
cd backend
& "C:\Program Files\NetBeans-25\netbeans\java\maven\bin\mvn.cmd" spring-boot:run
```

### Front-End

```bash
cd frontend
npm install
npm run dev
```

## API principal

| Método | Endpoint | Roles |
|--------|----------|-------|
| POST | `/api/auth/login` | Público |
| GET | `/api/auth/me` | Autenticado |
| GET/POST/PUT/DELETE | `/api/pacientes` | Ver controlador |
| GET | `/api/pacientes/{id}/historial` | ADMIN, RECEP, ODONTO |
| POST | `/api/pacientes/{id}/atenciones` | ADMIN, ODONTO |
| PUT | `/api/atenciones/{id}` | ADMIN, ODONTO |
| GET/POST/PUT | `/api/citas` | ADMIN, RECEP, ODONTO |
| PATCH | `/api/citas/{id}/cancelar` | ADMIN, RECEP, ODONTO |
| GET/POST/PUT | `/api/usuarios` | ADMIN |
| GET | `/api/roles` | ADMIN |
| GET | `/api/odontologos` | Autenticado |
| GET | `/api/dashboard` | Autenticado |

Cabecera en rutas protegidas: `Authorization: Bearer <token>`

## HU04 — Permisos de edición de pacientes

La historia indica "Usuario" en sentido de personal de clínica con permiso de actualización de datos de contacto:

- **ADMINISTRADOR** y **RECEPCIONISTA:** crear, editar y eliminar pacientes.
- **ODONTOLOGO:** consultar listado y ficha clínica (HU05); no edita datos demográficos (evita conflictos de datos maestros).

## Estados de cita (HU08)

| Estado | Color UI | Descripción |
|--------|----------|-------------|
| `PENDIENTE` | Ámbar | Cita agendada, sin confirmar |
| `CONFIRMADA` | Verde | Paciente confirmó asistencia |
| `CANCELADA` | Rojo | Cita anulada |
| `ATENDIDA` | Cyan | Atención realizada; genera registro en historial clínico automáticamente |

## Licencia

Proyecto académico / MVP.
