#!/bin/sh
set -euo pipefail

echo "=== Moodscaparr Entrypoint ==="

echo "Running database migrations..."
if ! npx prisma migrate deploy; then
  echo "Migration failed" >&2
  exit 1
fi
echo "Migrations complete."

echo "Starting application server..."
exec node server.js
