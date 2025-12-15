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

if [ ! -f .env ]; then
  echo "Missing .env. Aborting."
  exit 1
fi

source .env

TS="$(date +%F_%H%M%S)"
OUT_DIR="$ROOT_DIR/backups/$TS"
mkdir -p "$OUT_DIR"

echo "Backing up MySQL database $DB_NAME ..."
$COMPOSE exec -T db mysqldump -uroot -p"$MYSQL_ROOT_PASSWORD" --single-transaction --routines --triggers "$DB_NAME" \
  > "$OUT_DIR/db.sql"

echo "Backing up uploaded files..."
tar -czf "$OUT_DIR/upload.tar.gz" -C "$ROOT_DIR/server" upload

echo "Backup created: $OUT_DIR"
