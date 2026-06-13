#!/bin/bash
# Применить одну или все SQL-миграции к self-hosted Supabase
# Использование:
#   bash migrate.sh                        # все миграции
#   bash migrate.sh 0002_avatars_storage   # конкретная (без .sql)

set -euo pipefail

WORKDIR="$(cd "$(dirname "$0")/.." && pwd)"
MIGRATIONS_DIR="$(dirname "$WORKDIR")/supabase/migrations"
FILTER="${1:-}"

cd "$WORKDIR"

if [[ ! -f ".env" ]]; then
  echo "❌ .env не найден"
  exit 1
fi

source .env

run_migration() {
  local file="$1"
  echo "  → $(basename "$file")..."
  docker compose exec -T db psql -U postgres -d "${POSTGRES_DB:-postgres}" < "$file"
}

if [[ -n "$FILTER" ]]; then
  FILE="$MIGRATIONS_DIR/${FILTER}.sql"
  if [[ ! -f "$FILE" ]]; then
    echo "❌ Файл не найден: $FILE"
    exit 1
  fi
  run_migration "$FILE"
else
  echo "Применяю все миграции из $MIGRATIONS_DIR..."
  for f in "$MIGRATIONS_DIR"/*.sql; do
    run_migration "$f"
  done
fi

echo "✅ Готово"
