#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

COMPOSE=""
if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE="docker-compose"
else
  echo "ERROR: docker compose / docker-compose not found. Please install Docker and Compose."
  exit 1
fi

NON_INTERACTIVE="0"
OVERRIDE_SITE_HOST=""
while [ $# -gt 0 ]; do
  case "$1" in
    --host|--domain)
      OVERRIDE_SITE_HOST="${2:-}"
      shift 2
      ;;
    --non-interactive)
      NON_INTERACTIVE="1"
      shift
      ;;
    -h|--help)
      echo "Usage: bash deploy/update.sh [--host <domain>] [--non-interactive]"
      echo "Examples:"
      echo "  bash deploy/update.sh --host boutiquemark.shop"
      echo "  SITE_HOST=example.com bash deploy/update.sh"
      exit 0
      ;;
    *)
      echo "Unknown argument: $1"
      exit 1
      ;;
  esac
done

echo "Fetching latest code..."
if [ -d .git ]; then
  git pull
else
  echo "Not a git repo. Please update code manually (upload new zip or git clone)."
fi

set -a
if [ -f .env ]; then
  source .env
fi
set +a

if [ -n "$OVERRIDE_SITE_HOST" ]; then
  SITE_HOST="$OVERRIDE_SITE_HOST"
fi

if [ -z "${SITE_HOST:-}" ] && [ "$NON_INTERACTIVE" != "1" ]; then
  read -r -p "Enter domain for this update (SITE_HOST): " SITE_HOST
fi

if [ -n "${SITE_HOST:-}" ]; then
  SITE_HOST="${SITE_HOST#http://}"
  SITE_HOST="${SITE_HOST#https://}"
  SITE_HOST="${SITE_HOST%%/*}"
  export SITE_HOST

  if [ -z "${PUBLIC_BASE_URL:-}" ]; then
    PUBLIC_BASE_URL="https://${SITE_HOST}"
  fi
  export PUBLIC_BASE_URL

  if [ -z "${DJANGO_BASE_HOST_URL:-}" ]; then
    DJANGO_BASE_HOST_URL="$PUBLIC_BASE_URL"
  fi
  export DJANGO_BASE_HOST_URL

  if [ -z "${NEXT_PUBLIC_BASE_URL:-}" ]; then
    NEXT_PUBLIC_BASE_URL="$PUBLIC_BASE_URL"
  fi
  export NEXT_PUBLIC_BASE_URL

  if [ -z "${NEXT_PUBLIC_DJANGO_BASE_URL:-}" ]; then
    NEXT_PUBLIC_DJANGO_BASE_URL="$PUBLIC_BASE_URL"
  fi
  export NEXT_PUBLIC_DJANGO_BASE_URL

  if [ -z "${DJANGO_ALLOWED_HOSTS:-}" ]; then
    DJANGO_ALLOWED_HOSTS="${SITE_HOST},www.${SITE_HOST},localhost,127.0.0.1"
  fi
  export DJANGO_ALLOWED_HOSTS
fi

echo "Rebuilding and restarting..."
$COMPOSE up -d --build

echo "Waiting for db healthcheck..."
DB_CID="$($COMPOSE ps -q db || true)"
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

$COMPOSE ps

if [ -n "${SITE_HOST:-}" ]; then
  ADMIN_BASE="${NEXT_PUBLIC_ADMIN_BASE_PATH:-/panel}"
  ADMIN_BASE="${ADMIN_BASE%/}"
  if [ -z "$ADMIN_BASE" ]; then ADMIN_BASE="/panel"; fi
  echo "\nAccess URLs:"
  echo "  Frontend:     http://${SITE_HOST}/"
  echo "  Admin:        http://${SITE_HOST}${ADMIN_BASE}"
  echo "  Admin login:  http://${SITE_HOST}${ADMIN_BASE}Login"
fi
