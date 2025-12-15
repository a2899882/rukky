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
      echo "Usage: bash deploy/deploy.sh [--host <domain>] [--non-interactive]"
      echo "Examples:"
      echo "  bash deploy/deploy.sh --host boutiquemark.shop"
      echo "  SITE_HOST=example.com bash deploy/deploy.sh"
      exit 0
      ;;
    *)
      echo "Unknown argument: $1"
      exit 1
      ;;
  esac
done

if [ ! -f .env ]; then
  echo "Missing .env. Creating from .env.example ..."
  cp .env.example .env
  echo "Created .env. Please edit it before deploying: nano .env"
  exit 1
fi

set -a
source .env
set +a

if [ -n "$OVERRIDE_SITE_HOST" ]; then
  SITE_HOST="$OVERRIDE_SITE_HOST"
fi

if [ -z "${SITE_HOST:-}" ] && [ "$NON_INTERACTIVE" != "1" ]; then
  read -r -p "Enter domain for this deployment (SITE_HOST): " SITE_HOST
fi

if [ -z "${SITE_HOST:-}" ]; then
  echo "ERROR: SITE_HOST is empty. Please set it in .env or pass --host."
  exit 1
fi

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

if [ -z "${MYSQL_ROOT_PASSWORD:-}" ] || [ "${MYSQL_ROOT_PASSWORD}" = "change-me" ]; then
  echo "ERROR: MYSQL_ROOT_PASSWORD is not set or still 'change-me'. Please edit .env."
  exit 1
fi

if [ -z "${DJANGO_SECRET_KEY:-}" ] || [ "${DJANGO_SECRET_KEY}" = "change-me" ]; then
  echo "ERROR: DJANGO_SECRET_KEY is not set or still 'change-me'. Please edit .env."
  exit 1
fi

if [ "${AUTO_INIT_ADMIN:-0}" = "1" ]; then
  if [ -z "${ADMIN_USERNAME:-}" ]; then
    echo "ERROR: AUTO_INIT_ADMIN=1 but ADMIN_USERNAME is empty. Please edit .env."
    exit 1
  fi
  if [ -z "${ADMIN_PASSWORD:-}" ] || [ "${ADMIN_PASSWORD}" = "change-me" ]; then
    echo "ERROR: AUTO_INIT_ADMIN=1 but ADMIN_PASSWORD is not set or still 'change-me'. Please edit .env."
    exit 1
  fi
fi

if [ -n "${SMTP_SERVER:-}" ] && [ -n "${SENDER_EMAIL:-}" ]; then
  if [ -z "${SENDER_PASS:-}" ] || [ "${SENDER_PASS}" = "change-me" ]; then
    echo "ERROR: SMTP is configured but SENDER_PASS is not set or still 'change-me'. Please edit .env."
    exit 1
  fi
fi

echo "Pull/build and start containers..."
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
    if [ "$i" -eq 120 ]; then
      echo "WARNING: db healthcheck not healthy after 120s (status=$STATUS). You can still check logs: $COMPOSE logs -f --tail=200 db"
    fi
    sleep 1
  done
fi

echo "\nCurrent status:"
$COMPOSE ps

ADMIN_BASE="${NEXT_PUBLIC_ADMIN_BASE_PATH:-/panel}"
ADMIN_BASE="${ADMIN_BASE%/}"
if [ -z "$ADMIN_BASE" ]; then ADMIN_BASE="/panel"; fi

echo "\nAccess URLs:"
echo "  Frontend:     http://${SITE_HOST}/"
echo "  Admin:        http://${SITE_HOST}${ADMIN_BASE}"
echo "  Admin login:  http://${SITE_HOST}${ADMIN_BASE}Login"

echo "\nUseful commands:"
echo "  $COMPOSE logs -f --tail=200 nginx"
echo "  $COMPOSE logs -f --tail=200 web"
echo "  $COMPOSE logs -f --tail=200 api"
echo "  $COMPOSE logs -f --tail=200 db"
