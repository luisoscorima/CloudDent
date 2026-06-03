# Changelog

Formato basado en [Keep a Changelog](https://keepachangelog.com/es-ES/).

## [Unreleased]

### Added
- Pruebas unitarias e integración backend (JUnit, Mockito, H2).
- Pruebas frontend con Vitest y Testing Library.
- CI con GitHub Actions (`ci.yml`).
- CD a EC2 con Docker Compose (`deploy.yml` + `scripts/deploy-ec2.sh`).
- Documentación de control de cambios (`CONTRIBUTING.md`, `docs/CALENDARIO.md`).

### Infrastructure
- Workflow de despliegue SSH a EC2 en push a `main`.
- Perfil `test` con H2 en memoria para tests backend.

## [1.0.0] - 2026-06-03

### Added
- MVP CloudDent: auth JWT, pacientes, citas, usuarios, dashboard.
- Stack: Spring Boot 3, React, PostgreSQL, Docker Compose.
