#!/usr/bin/env bash
# Rollback en EC2: vuelve a un commit estable y reconstruye contenedores.
#
# Uso:
#   bash scripts/rollback-ec2.sh              # último deploy exitoso (.deploy/last-good-commit)
#   bash scripts/rollback-ec2.sh --previous     # commit anterior al último deploy (.deploy/previous-commit)
#   bash scripts/rollback-ec2.sh abc1234        # commit específico
#   bash scripts/rollback-ec2.sh HEAD~1         # un commit atrás en el historial local
#
set -euo pipefail

APP_DIR="${APP_DIR:-/home/ubuntu/CloudDent}"
DEPLOY_DIR="$APP_DIR/.deploy"
BRANCH="${DEPLOY_BRANCH:-main}"
FRONTEND_URL="${ROLLBACK_FRONTEND_URL:-http://localhost:8086}"
BACKEND_HEALTH_URL="${ROLLBACK_BACKEND_HEALTH_URL:-http://localhost:8092/actuator/health}"

cd "$APP_DIR"
mkdir -p "$DEPLOY_DIR"

resolve_target() {
  local arg="${1:-}"

  if [ -n "$arg" ]; then
    case "$arg" in
      --previous)
        if [ -f "$DEPLOY_DIR/previous-commit" ]; then
          cat "$DEPLOY_DIR/previous-commit"
          return
        fi
        echo "No existe $DEPLOY_DIR/previous-commit" >&2
        exit 1
        ;;
      --last-good)
        if [ -f "$DEPLOY_DIR/last-good-commit" ]; then
          cat "$DEPLOY_DIR/last-good-commit"
          return
        fi
        echo "No existe $DEPLOY_DIR/last-good-commit" >&2
        exit 1
        ;;
      *)
        echo "$arg"
        return
        ;;
    esac
  fi

  if [ -f "$DEPLOY_DIR/last-good-commit" ]; then
    cat "$DEPLOY_DIR/last-good-commit"
    return
  fi

  if [ -f "$DEPLOY_DIR/previous-commit" ]; then
    cat "$DEPLOY_DIR/previous-commit"
    return
  fi

  echo "HEAD~1"
}

wait_for_health() {
  local attempts="${ROLLBACK_HEALTH_ATTEMPTS:-30}"
  local i=1

  echo "Esperando health del backend..."
  while [ "$i" -le "$attempts" ]; do
    if curl -sf "$BACKEND_HEALTH_URL" >/dev/null; then
      echo "Backend OK"
      break
    fi
    if [ "$i" -eq "$attempts" ]; then
      echo "ERROR: backend no respondió en $BACKEND_HEALTH_URL" >&2
      docker compose ps
      docker compose logs backend --tail 50
      exit 1
    fi
    sleep 2
    i=$((i + 1))
  done

  echo "Verificando frontend..."
  if ! curl -sf "$FRONTEND_URL" >/dev/null; then
    echo "ERROR: frontend no respondió en $FRONTEND_URL" >&2
    docker compose ps
    docker compose logs frontend --tail 30
    exit 1
  fi
  echo "Frontend OK"
}

TARGET="$(resolve_target "${1:-}")"
CURRENT="$(git rev-parse HEAD)"

echo "=========================================="
echo " CloudDent — Rollback"
echo " Commit actual:  $CURRENT"
echo " Objetivo:       $TARGET"
echo " Directorio:     $APP_DIR"
echo "=========================================="

git fetch origin "$BRANCH"
git reset --hard "$TARGET"

docker compose up -d --build
wait_for_health

git rev-parse HEAD > "$DEPLOY_DIR/last-good-commit"

echo "Rollback completado en $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
echo "Commit activo: $(git log -1 --oneline)"
