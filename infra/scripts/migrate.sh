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

# Находим контейнер Postgres СТРОГО по образу supabase/postgres.
# ВАЖНО: НЕ искать просто "postgres" или "db" в именах — Coolify держит свой
# coolify-db (тоже Postgres), и попасть туда означает накатить миграции
# OnFive в служебную БД панели. Поэтому фильтруем только по нашему образу.
DB_CONTAINER="$(docker ps --filter 'ancestor=supabase/postgres' --format '{{.Names}}' | head -n1)"

# Резервный поиск: по полному имени образа через docker inspect (на случай,
# если в ancestor попадёт пустота из-за конкретного тега). Берём контейнер,
# чей Image начинается с "supabase/postgres".
if [[ -z "$DB_CONTAINER" ]]; then
  DB_CONTAINER="$(docker ps --format '{{.Names}}\t{{.Image}}' \
    | awk -F'\t' '$2 ~ /^supabase\/postgres/ {print $1; exit}')"
fi

if [[ -z "$DB_CONTAINER" ]]; then
  echo "❌ Не найден запущенный контейнер supabase/postgres. Запущен ли стек?"
  echo "   Подсказка: docker ps --format '{{.Names}}\t{{.Image}}' | grep supabase"
  exit 1
fi

# Sanity-check: не coolify-db ли это.
if [[ "$DB_CONTAINER" == *"coolify-db"* ]]; then
  echo "❌ Поймали coolify-db, а не supabase/postgres. Прерываю — это служебная БД Coolify."
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
