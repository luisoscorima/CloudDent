#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/home/ubuntu/CloudDent}"
DEPLOY_DIR="$APP_DIR/.deploy"
BRANCH="${DEPLOY_BRANCH:-main}"
FRONTEND_URL="${DEPLOY_FRONTEND_URL:-http://localhost:8086}"
BACKEND_HEALTH_URL="${DEPLOY_BACKEND_HEALTH_URL:-http://localhost:8092/actuator/health}"

cd "$APP_DIR"
mkdir -p "$DEPLOY_DIR"

# Guardar commit en producción antes de actualizar (para rollback).
git rev-parse HEAD > "$DEPLOY_DIR/previous-commit"

if [ "${SKIP_GIT_PULL:-}" != "1" ]; then
  git fetch origin "$BRANCH"
  git reset --hard "origin/$BRANCH"
fi

docker compose pull --ignore-buildable 2>/dev/null || true
docker compose up -d --build

wait_for_health() {
  local attempts="${DEPLOY_HEALTH_ATTEMPTS:-30}"
  local i=1

  while [ "$i" -le "$attempts" ]; do
    if curl -sf "$BACKEND_HEALTH_URL" >/dev/null && curl -sf "$FRONTEND_URL" >/dev/null; then
      return 0
    fi
    sleep 2
    i=$((i + 1))
  done
  return 1
}

if ! wait_for_health; then
  echo "ERROR: deploy falló healthcheck. Ejecutando rollback automático..." >&2
  bash "$APP_DIR/scripts/rollback-ec2.sh" --previous
  exit 1
fi

git rev-parse HEAD > "$DEPLOY_DIR/last-good-commit"
docker image prune -f

echo "Deploy completado en $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "Commit activo: $(git log -1 --oneline)"
