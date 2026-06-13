#!/bin/bash
# OnFive — деплой/обновление self-hosted Supabase
# Вызывается вручную или из GitHub Actions
# Использование: bash deploy.sh [--first-run]

set -euo pipefail

WORKDIR="$(cd "$(dirname "$0")/.." && pwd)"
FIRST_RUN="${1:-}"

echo "=== OnFive Supabase deploy ==="
echo "Workdir: $WORKDIR"

cd "$WORKDIR"

if [[ ! -f ".env" ]]; then
  echo "❌ Файл .env не найден. Скопируй .env.example → .env и заполни."
  exit 1
fi

echo "[1/4] Скачиваем свежие образы..."
docker compose pull

echo "[2/4] Запускаем сервисы..."
docker compose up -d --remove-orphans

echo "[3/4] Ждём готовности Postgres..."
for i in $(seq 1 30); do
  if docker compose exec -T db pg_isready -U postgres &>/dev/null; then
    echo "  Postgres готов (попытка $i)"
    break
  fi
  echo "  Ожидание... ($i/30)"
  sleep 3
done

if [[ "$FIRST_RUN" == "--first-run" ]]; then
  echo "[4/4] Первый запуск — применяем миграции..."
  cd "$(dirname "$WORKDIR")"  # корень репо

  for migration in supabase/migrations/*.sql; do
    echo "  Применяю: $migration"
    docker compose -f "$WORKDIR/docker-compose.yml" exec -T db \
      psql -U postgres -d postgres -f "/dev/stdin" < "$migration"
  done
  echo "  Миграции применены ✅"
else
  echo "[4/4] Обновление завершено (миграции пропущены — применяй вручную при необходимости)"
fi

echo ""
echo "✅ Деплой завершён!"
docker compose ps
