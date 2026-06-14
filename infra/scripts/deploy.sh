#!/usr/bin/env bash
# OnFive — развёртывание self-hosted Supabase напрямую через docker compose.
# Без Coolify. Запуск из каталога infra/:
#   cd infra && bash scripts/deploy.sh
#
# Скрипт идемпотентный:
#   - если .env нет — генерирует секреты (пароли + JWT-ключи anon/service_role);
#   - собирает кастомный образ Postgres (init-скрипты внутри) и поднимает стек;
#   - повторный запуск просто пересобирает/обновляет контейнеры.
set -euo pipefail

cd "$(dirname "$0")/.."   # → infra/
ENV_FILE=".env"

# base64url без паддинга — формат JWT/секретов.
b64url() { openssl base64 -e -A | tr '+/' '-_' | tr -d '='; }

# HS256 JWT для роли Supabase (anon | service_role), подписанный JWT_SECRET.
gen_jwt() {
  local role="$1" secret="$2" now exp header payload h p sig
  now=$(date +%s); exp=$((now + 3155760000))   # +100 лет
  header='{"alg":"HS256","typ":"JWT"}'
  payload="{\"role\":\"$role\",\"iss\":\"supabase\",\"iat\":$now,\"exp\":$exp}"
  h=$(printf '%s' "$header"  | b64url)
  p=$(printf '%s' "$payload" | b64url)
  sig=$(printf '%s.%s' "$h" "$p" | openssl dgst -sha256 -hmac "$secret" -binary | b64url)
  printf '%s.%s.%s' "$h" "$p" "$sig"
}

if [[ ! -f "$ENV_FILE" ]]; then
  echo "=== .env не найден — генерирую секреты ==="
  POSTGRES_PASSWORD=$(openssl rand -hex 24)
  JWT_SECRET=$(openssl rand -hex 32)
  DASHBOARD_PASSWORD=$(openssl rand -hex 12)
  ANON_KEY=$(gen_jwt anon "$JWT_SECRET")
  SERVICE_ROLE_KEY=$(gen_jwt service_role "$JWT_SECRET")

  cat > "$ENV_FILE" <<EOF
# Сгенерировано scripts/deploy.sh $(date -u +%Y-%m-%dT%H:%M:%SZ). НЕ коммитить.
SUPABASE_PUBLIC_URL=https://api.onfive.pro
API_EXTERNAL_URL=https://api.onfive.pro
SITE_URL=https://onfive.pro
ADDITIONAL_REDIRECT_URLS=

POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_DB=postgres
POSTGRES_PORT=5432

JWT_SECRET=$JWT_SECRET
JWT_EXP=3600
ANON_KEY=$ANON_KEY
SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY

DASHBOARD_USERNAME=supabase
DASHBOARD_PASSWORD=$DASHBOARD_PASSWORD

KONG_HTTP_PORT=8000
KONG_HTTPS_PORT=8443

SMTP_ADMIN_EMAIL=noreply@onfive.pro
ENABLE_EMAIL_AUTOCONFIRM=true

STUDIO_DEFAULT_ORGANIZATION=OnFive
STUDIO_DEFAULT_PROJECT=onfive
EOF
  chmod 600 "$ENV_FILE"
  echo "  .env создан. Ключи для фронтенда (Vercel):"
  echo "    VITE_SUPABASE_URL=https://api.onfive.pro"
  echo "    VITE_SUPABASE_ANON_KEY=$ANON_KEY"
  echo "  Логин в Studio: supabase / $DASHBOARD_PASSWORD"
else
  echo "=== .env уже есть — использую существующий ==="
fi

# Порты 80/443 нужны Caddy. Если их держит Coolify-proxy (Traefik) — гасим:
# мы съехали с Coolify, конкурент за порты не нужен.
if docker ps --format '{{.Names}}' | grep -q '^coolify-proxy$'; then
  echo "=== Останавливаю coolify-proxy (освобождаю 80/443 для Caddy) ==="
  docker stop coolify-proxy >/dev/null 2>&1 || true
fi

# Берём секреты из .env (нужен ANON_KEY для сборки фронта).
set -a; . ./"$ENV_FILE"; set +a

echo "=== Сборка фронтенда (Vite → client/dist) ==="
# Собираем в одноразовом node-контейнере прямо на сервере. VITE_*-переменные
# инлайнятся в бандл на этапе сборки. dist затем раздаёт Caddy (см. compose).
REPO_ROOT="$(cd .. && pwd)"
docker run --rm \
  -v "$REPO_ROOT":/app -w /app \
  -e VITE_SUPABASE_URL="https://api.onfive.pro" \
  -e VITE_SUPABASE_ANON_KEY="$ANON_KEY" \
  node:20-alpine sh -c "npm ci && npm run build"

echo "=== Сборка образа Postgres и запуск стека ==="
docker compose up -d --build --remove-orphans

echo "=== Статус (через 5 с) ==="
sleep 5
docker compose ps
