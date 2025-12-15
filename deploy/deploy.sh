#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [ ! -f .env ]; then
  echo "Missing .env. Creating from .env.example ..."
  cp .env.example .env
  echo "Created .env. Please edit it before deploying: nano .env"
  exit 1
fi

set -a
source .env
set +a

if [ -z "${MYSQL_ROOT_PASSWORD:-}" ] || [ "${MYSQL_ROOT_PASSWORD}" = "change-me" ]; then
  echo "ERROR: MYSQL_ROOT_PASSWORD is not set or still 'change-me'. Please edit .env."
  exit 1
fi

if [ -z "${DJANGO_SECRET_KEY:-}" ] || [ "${DJANGO_SECRET_KEY}" = "change-me" ]; then
  echo "ERROR: DJANGO_SECRET_KEY is not set or still 'change-me'. Please edit .env."
  exit 1
fi

if [ -z "${SITE_HOST:-}" ]; then
  echo "ERROR: SITE_HOST is empty. Please edit .env."
  exit 1
fi

echo "Pull/build and start containers..."
docker compose up -d --build

echo "Waiting for db healthcheck..."
DB_CID="$(docker compose ps -q db || true)"
if [ -n "$DB_CID" ]; then
  for i in $(seq 1 120); do
    STATUS="$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}unknown{{end}}' "$DB_CID" 2>/dev/null || echo unknown)"
    if [ "$STATUS" = "healthy" ]; then
      echo "db is healthy."
      break
    fi
    if [ "$i" -eq 120 ]; then
      echo "WARNING: db healthcheck not healthy after 120s (status=$STATUS). You can still check logs: docker compose logs -f --tail=200 db"
    fi
    sleep 1
  done
fi

echo "\nCurrent status:"
docker compose ps

ADMIN_BASE="${NEXT_PUBLIC_ADMIN_BASE_PATH:-/panel}"
ADMIN_BASE="${ADMIN_BASE%/}"
if [ -z "$ADMIN_BASE" ]; then ADMIN_BASE="/panel"; fi

echo "\nAccess URLs:"
echo "  Frontend:     http://${SITE_HOST}/"
echo "  Admin:        http://${SITE_HOST}${ADMIN_BASE}"
echo "  Admin login:  http://${SITE_HOST}${ADMIN_BASE}Login"

echo "\nUseful commands:"
echo "  docker compose logs -f --tail=200 nginx"
echo "  docker compose logs -f --tail=200 web"
echo "  docker compose logs -f --tail=200 api"
echo "  docker compose logs -f --tail=200 db"
