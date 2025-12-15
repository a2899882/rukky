#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "Fetching latest code..."
if [ -d .git ]; then
  git pull
else
  echo "Not a git repo. Please update code manually (upload new zip or git clone)."
fi

echo "Rebuilding and restarting..."
docker compose up -d --build

set -a
if [ -f .env ]; then
  source .env
fi
set +a

echo "Waiting for db healthcheck..."
DB_CID="$(docker compose ps -q db || true)"
if [ -n "$DB_CID" ]; then
  for i in $(seq 1 120); do
    STATUS="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}unknown{{end}}' "$DB_CID" 2>/dev/null || echo unknown)"
    if [ "$STATUS" = "healthy" ]; then
      echo "db is healthy."
      break
    fi
    sleep 1
  done
fi

docker compose ps

if [ -n "${SITE_HOST:-}" ]; then
  ADMIN_BASE="${NEXT_PUBLIC_ADMIN_BASE_PATH:-/panel}"
  ADMIN_BASE="${ADMIN_BASE%/}"
  if [ -z "$ADMIN_BASE" ]; then ADMIN_BASE="/panel"; fi
  echo "\nAccess URLs:"
  echo "  Frontend:     http://${SITE_HOST}/"
  echo "  Admin:        http://${SITE_HOST}${ADMIN_BASE}"
  echo "  Admin login:  http://${SITE_HOST}${ADMIN_BASE}Login"
fi
