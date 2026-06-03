# Calendario de cambios y despliegues — CloudDent

## Hitos del proyecto

| Fecha | Hito | Responsable |
|-------|------|-------------|
| 2026-06-03 | MVP v1.0 — funcionalidades HU01–HU08 | Equipo CloudDent |
| 2026-06-03 | CI/CD — tests automáticos + deploy EC2 | Equipo CloudDent |

## Ventanas de despliegue

| Evento | Cuándo | Acción |
|--------|--------|--------|
| Deploy automático | Merge a `main` | GitHub Actions ejecuta `Deploy EC2` |
| Redeploy manual | Cuando se requiera | Actions → Deploy EC2 → Run workflow |
| Mantenimiento EC2 | Coordinar con el equipo | Pausar merges; usar `workflow_dispatch` tras verificar |

## Registro de releases

Actualizar esta tabla al desplegar cambios relevantes en producción.

| Versión | Fecha deploy | Cambios principales | Responsable |
|---------|--------------|---------------------|-------------|
| 1.0.0 | Pendiente EC2 | MVP inicial | — |
| 1.1.0 | Tras merge CI/CD | Tests + pipelines + control de cambios | — |

## Notas

- Los cambios de **aplicación** e **infraestructura** deben reflejarse en [`CHANGELOG.md`](../CHANGELOG.md).
- El archivo `.env` en EC2 no se versiona; cambios de variables se documentan en el PR.
