#!/bin/sh
set -e

DB_PORT_VALUE="${DB_PORT:-3306}"

if [ -n "${DB_HOST}" ]; then
  until nc -z "${DB_HOST}" "${DB_PORT_VALUE}"; do
    sleep 1
  done
fi

echo "Running migrations..."
python manage.py migrate --noinput

if [ "${AUTO_INIT_ADMIN:-0}" = "1" ]; then
  echo "Initializing admin user..."
  python manage.py init_admin
fi

exec gunicorn server.wsgi:application \
  --bind 0.0.0.0:8000 \
  --workers "${GUNICORN_WORKERS:-2}" \
  --timeout 120
