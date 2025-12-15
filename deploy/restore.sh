#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [ $# -ne 1 ]; then
  echo "Usage: bash deploy/restore.sh <backup_dir>"
  echo "Example: bash deploy/restore.sh backups/2025-12-13_120000"
  exit 1
fi

BACKUP_DIR="$1"

if [ ! -d "$BACKUP_DIR" ]; then
  echo "Backup dir not found: $BACKUP_DIR"
  exit 1
fi

BACKUP_REAL="$(cd "$BACKUP_DIR" && pwd)"
BACKUPS_ROOT="$(cd "$ROOT_DIR/backups" 2>/dev/null && pwd || true)"
if [ -z "$BACKUPS_ROOT" ] || [ "${BACKUP_REAL#${BACKUPS_ROOT}/}" = "$BACKUP_REAL" ]; then
  echo "ERROR: For safety, backup_dir must be under: $ROOT_DIR/backups"
  echo "Example: bash deploy/restore.sh backups/2025-12-13_120000"
  exit 1
fi

if [ ! -f .env ]; then
  echo "Missing .env. Aborting."
  exit 1
fi

if [ ! -f "$BACKUP_DIR/db.sql" ]; then
  echo "Missing $BACKUP_DIR/db.sql"
  exit 1
fi

if [ ! -f "$BACKUP_DIR/upload.tar.gz" ]; then
  echo "Missing $BACKUP_DIR/upload.tar.gz"
  exit 1
fi

source .env

echo "Restoring database $DB_NAME ..."
cat "$BACKUP_DIR/db.sql" | docker compose exec -T db mysql -uroot -p"$MYSQL_ROOT_PASSWORD" "$DB_NAME"

echo "Restoring upload directory..."
if [ "${RESTORE_FORCE:-0}" != "1" ]; then
  echo "ERROR: This will overwrite existing server/upload. Re-run with RESTORE_FORCE=1 to continue."
  echo "Example: RESTORE_FORCE=1 bash deploy/restore.sh $BACKUP_DIR"
  exit 1
fi

if [ -d "$ROOT_DIR/server/upload" ]; then
  TS="$(date +%F_%H%M%S)"
  mv "$ROOT_DIR/server/upload" "$ROOT_DIR/server/upload.bak_$TS"
  echo "Existing upload moved to: server/upload.bak_$TS"
fi

tar -xzf "$BACKUP_DIR/upload.tar.gz" -C "$ROOT_DIR/server"

echo "Done. Restarting containers..."
docker compose up -d
