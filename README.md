# CloudDent MVP — Versión 1

UNIVERSIDAD TECNOLÓGICA DEL PERÚ

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
├── .github/workflows/   # CI y CD
├── docs/                # Calendario de cambios
├── scripts/             # deploy-ec2.sh
├── docker-compose.yml
└── *.html (mockups de referencia)
```

## Pruebas

```bash
# Backend (JUnit + H2 en memoria, perfil test)
cd backend && mvn test

# Frontend (Vitest)
cd frontend && npm test
```

Cobertura mínima: reglas de negocio (pacientes, citas, JWT), permisos por rol y flujo CRUD de paciente.

## CI/CD

| Workflow | Trigger | Acción |
|----------|---------|--------|
| [`ci.yml`](.github/workflows/ci.yml) | Push / PR a `main` | Tests + build backend y frontend |
| [`deploy.yml`](.github/workflows/deploy.yml) | Push a `main` o manual | Tests → SSH a EC2 → `docker compose up --build` |

### Branch protection (recomendado)

En GitHub → Settings → Branches → `main`:

- Require pull request before merging
- Require status checks: `backend`, `frontend`

Ver [`CONTRIBUTING.md`](CONTRIBUTING.md) para el flujo de cambios y [`docs/CALENDARIO.md`](docs/CALENDARIO.md) para hitos y ventanas de deploy.

### Despliegue EC2 (primera vez)

1. Instancia Ubuntu con Docker y Docker Compose.
2. Clonar el repo en `/home/ubuntu/CloudDent`.
3. Copiar `.env.example` → `.env` con valores de producción (`JWT_SECRET`, `DB_PASSWORD`, `CORS_ORIGINS` con tu dominio o IP pública).
4. `docker compose up --build -d`
5. Configurar secrets en GitHub: `EC2_HOST`, `EC2_USER`, `EC2_SSH_KEY`, `EC2_APP_DIR=/home/ubuntu/CloudDent`.

**Puertos en EC2** (evitan conflicto con Nginx Proxy Manager en 80/443):

| Servicio | Puerto host | Uso |
|----------|-------------|-----|
| Frontend | **8086** | Proxy en NPM → `http://localhost:8086` |
| Backend API | **8092** | Solo si necesitas Swagger directo; la UI usa `/api` vía frontend |
| PostgreSQL | *(interno)* | No expuesto al host |

En **Nginx Proxy Manager**, crear Proxy Host (ej. `clouddent.tudominio.com`) apuntando a `http://127.0.0.1:8086`.

Los siguientes deploys son automáticos al hacer merge a `main` (script [`scripts/deploy-ec2.sh`](scripts/deploy-ec2.sh)).

### Rollback en producción (EC2)

Si un deploy falla el healthcheck, `deploy-ec2.sh` intenta rollback automático al commit anterior.

Rollback manual en el servidor:

```bash
cd ~/CloudDent

# Al último deploy exitoso (recomendado)
bash scripts/rollback-ec2.sh

# Al commit previo al último deploy
bash scripts/rollback-ec2.sh --previous

# A un commit específico
bash scripts/rollback-ec2.sh abc1234
```

Los commits estables se guardan en `.deploy/last-good-commit` (no versionado en Git).

## Control de cambios

- [`CONTRIBUTING.md`](CONTRIBUTING.md) — flujo de ramas y PR
- [`CHANGELOG.md`](CHANGELOG.md) — registro de cambios (app, infra, docs)
- [`.github/pull_request_template.md`](.github/pull_request_template.md) — checklist en cada PR

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

- Frontend: http://localhost:8086
- API (directa): http://localhost:8092
- Swagger: http://localhost:8092/swagger-ui.html

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
