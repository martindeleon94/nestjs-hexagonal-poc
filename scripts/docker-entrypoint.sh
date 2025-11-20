#!/bin/sh
set -e

echo "Starting NestJS application initialization..."

# Verificar que DATABASE_URL existe
if [ -z "$DATABASE_URL" ]; then
  echo "ERROR: DATABASE_URL is not set"
  exit 1
fi

echo "DATABASE_URL is configured"

# Ejecutar migraciones de Prisma
echo "Running database migrations..."
npx prisma migrate deploy

# Verificar que las migraciones se aplicaron correctamente
if [ $? -eq 0 ]; then
  echo "Migrations applied successfully"
else
  echo "ERROR: Migrations failed"
  exit 1
fi

echo "Starting application..."
exec node dist/src/main.js
