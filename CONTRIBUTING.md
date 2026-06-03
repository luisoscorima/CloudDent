# Guía de contribución — CloudDent

## Flujo de cambios

1. Crear rama desde `main`: `feature/nombre` o `fix/nombre`.
2. Desarrollar y ejecutar tests localmente:
   - Backend: `cd backend && mvn test`
   - Frontend: `cd frontend && npm test`
3. Actualizar [`CHANGELOG.md`](CHANGELOG.md) si el cambio es visible (app, infra o docs).
4. Abrir Pull Request hacia `main` (usa la plantilla de PR).
5. Esperar CI verde (jobs `backend` y `frontend`).
6. Merge → despliegue automático a EC2 (workflow `Deploy EC2`).

## Tipos de cambio

| Tipo | Ejemplos | Documentar en |
|------|----------|---------------|
| Aplicación | API, servicios, UI React | CHANGELOG → Added/Changed/Fixed |
| Infraestructura | Docker, EC2, GitHub Actions | CHANGELOG → Infrastructure |
| Documentación | README, guías | CHANGELOG → Changed |

## Ramas

- `main`: producción; protegida (PR obligatorio + CI verde).
- `feature/*`: nuevas funcionalidades.
- `fix/*`: correcciones.

## Commits

Mensajes claros en español o inglés. Ejemplo: `feat: agregar filtro de citas por estado`.

## Branch protection (configurar en GitHub)

Settings → Branches → Add rule para `main`:

- Require a pull request before merging
- Require status checks to pass: `backend`, `frontend`
