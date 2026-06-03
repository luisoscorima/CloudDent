#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/home/ubuntu/clouddent}"
BRANCH="${DEPLOY_BRANCH:-main}"

cd "$APP_DIR"

# Si se invoca desde GitHub Actions, el workflow ya hizo fetch/reset.
if [ "${SKIP_GIT_PULL:-}" != "1" ]; then
  git fetch origin "$BRANCH"
  git reset --hard "origin/$BRANCH"
fi

docker compose pull --ignore-buildable 2>/dev/null || true
docker compose up -d --build
docker image prune -f

echo "Deploy completado en $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
