#!/bin/bash
# Применить SQL-миграции OnFive к запущенному контейнеру Postgres
# Работает и под Coolify, и при ручном docker compose.
#
# Использование (на сервере, из любой папки):
#   bash migrate.sh                        # все миграции по порядку
#   bash migrate.sh 0002_avatars_storage   # конкретная (без .sql)
#
# Альтернатива: вставить SQL вручную в Supabase Studio → SQL Editor.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
MIGRATIONS_DIR="$REPO_ROOT/supabase/migrations"
FILTER="${1:-}"

# Находим контейнер Postgres по образу supabase/postgres
DB_CONTAINER="$(docker ps --filter "ancestor=supabase/postgres" --format '{{.Names}}' | head -n1)"
if [[ -z "$DB_CONTAINER" ]]; then
  # запасной поиск по имени
  DB_CONTAINER="$(docker ps --format '{{.Names}}' | grep -i 'db\|postgres' | head -n1)"
fi

if [[ -z "$DB_CONTAINER" ]]; then
  echo "❌ Не найден запущенный контейнер Postgres. Запущен ли стек?"
  exit 1
fi

echo "Контейнер БД: $DB_CONTAINER"
DB_NAME="${POSTGRES_DB:-postgres}"

run_migration() {
  local file="$1"
  echo "  → $(basename "$file")..."
  docker exec -i "$DB_CONTAINER" psql -U postgres -d "$DB_NAME" < "$file"
}

if [[ -n "$FILTER" ]]; then
  FILE="$MIGRATIONS_DIR/${FILTER}.sql"
  [[ -f "$FILE" ]] || { echo "❌ Файл не найден: $FILE"; exit 1; }
  run_migration "$FILE"
else
  echo "Применяю все миграции из $MIGRATIONS_DIR..."
  for f in "$MIGRATIONS_DIR"/*.sql; do
    run_migration "$f"
  done
fi

echo "✅ Готово"
