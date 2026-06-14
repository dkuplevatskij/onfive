# Гибридный деплой: БД/фронт в РФ + AI через Vercel

> Готовый шаблон-ТЗ. Скопируй этот файл в новый проект и попроси Claude
> «разверни по DEPLOY-RU-HYBRID.md» — внутри и инструкция, и эталонные
> конфиги. Замени плейсхолдеры: `<DOMAIN>` (apex, напр. `example.pro`),
> `<API_DOMAIN>` (напр. `api.example.pro`), `<VERCEL_APP>`
> (напр. `myapp.vercel.app`).

## Зачем
Приложение должно открываться из России **без VPN** и хранить данные в РФ
(152-ФЗ), но при этом использовать Claude/OpenAI API, которые **недоступны
с российского IP**. Решение — разделить на два контура.

```
Браузер (РФ) → <DOMAIN>  (РФ-сервер: Caddy)
                ├── статика SPA            → отдаётся напрямую
                ├── /api/*                 → проксируется на Vercel → Claude/OpenAI
                └── <API_DOMAIN>           → Kong (Supabase: БД/Auth/Storage)
```

- **РФ-сервер (напр. Timeweb):** Postgres, Supabase, статика фронтенда,
  реверс-прокси Caddy — всё, к чему ходит браузер.
- **Vercel (вне РФ):** только AI-прокси (`/api/chat` и т.п.). Запрос идёт
  сервер-к-серверу (РФ → Vercel → Claude); этот путь работает.

## Чек-лист
1. SSH на РФ-сервер → поставить Docker + Docker Compose.
2. DNS: `<DOMAIN>`, `www.<DOMAIN>`, `<API_DOMAIN>` → IP сервера.
3. Скопировать `infra/` (см. файлы ниже), заполнить `.env` (или сгенерить `deploy.sh`).
4. AI-эндпоинты задеплоить на Vercel.
5. `cd infra && bash scripts/deploy.sh` — собирает фронт, образ Postgres, поднимает стек.
6. Фронт: шрифты через `@fontsource` (не Google Fonts) — см. раздел «Шрифты».

## Грабли (на чём уже обожглись)
- **Прослойки оркестрации (Coolify и т.п.) — не нужны.** Ставь напрямую
  `docker compose up` по SSH. Прослойки держат compose в эфемерных папках
  → bind-mount'ы init-скриптов ломаются.
- **Init-скрипты Postgres запекай в образ** (Dockerfile `COPY`), не монтируй
  bind-mount'ами. Иначе при первом старте Docker подставит пустые папки →
  роли без паролей → каскад `password authentication failed`.
- ⚠️ Init-скрипты выполняются **только при первой инициализации** пустого
  data-каталога. Перед повторным деплоем удали старый volume `db_data`.
- **`GOTRUE_JWT_DEFAULT_GROUP_NAME: authenticated`** обязателен, иначе токены
  с пустым `"role": ""` → PostgREST падает `role "" does not exist` (401).
- **Caddy: явный DNS `1.1.1.1`/`8.8.8.8`.** Иначе контейнер наследует
  systemd-resolved stub (`127.0.0.53`) и не получит сертификат Let's Encrypt.
- **Фронт: self-host шрифтов.** `fonts.googleapis.com` тормозит/заблокирован
  в РФ — `@import` висит на таймауте и блокирует рендер.

---

## Файлы

### `infra/db/Dockerfile`
```dockerfile
FROM supabase/postgres:15.8.1.060
# Init-скрипты запекаем в образ (а не bind-mount). Кладём в init-scripts/ и
# migrations/ с НЕконфликтующими именами, чтобы не затереть встроенные.
COPY init/00-roles.sql    /docker-entrypoint-initdb.d/init-scripts/99-roles.sql
COPY init/01-jwt.sql      /docker-entrypoint-initdb.d/init-scripts/99-jwt.sql
COPY init/02-realtime.sql /docker-entrypoint-initdb.d/migrations/99-realtime.sql
COPY init/03-webhooks.sql /docker-entrypoint-initdb.d/init-scripts/98-webhooks.sql
```

### `infra/db/init/00-roles.sql`
```sql
\set pgpass `echo "$POSTGRES_PASSWORD"`
ALTER USER authenticator            WITH PASSWORD :'pgpass';
ALTER USER pgbouncer                WITH PASSWORD :'pgpass';
ALTER USER supabase_auth_admin      WITH PASSWORD :'pgpass';
ALTER USER supabase_functions_admin WITH PASSWORD :'pgpass';
ALTER USER supabase_storage_admin   WITH PASSWORD :'pgpass';
```

### `infra/db/init/01-jwt.sql`
```sql
\set jwt_secret `echo "$JWT_SECRET"`
\set jwt_exp `echo "$JWT_EXP"`
ALTER DATABASE postgres SET "app.settings.jwt_secret" TO :'jwt_secret';
ALTER DATABASE postgres SET "app.settings.jwt_exp" TO :'jwt_exp';
```

### `infra/db/init/02-realtime.sql`
```sql
create schema if not exists _realtime;
alter schema _realtime owner to postgres;
```

### `infra/db/init/03-webhooks.sql`
Стандартный скрипт из апстрима Supabase (схема `supabase_functions` + `pg_net`).
Взять как есть из официального репозитория:
`supabase/docker/volumes/db/webhooks.sql`
(https://github.com/supabase/supabase/tree/master/docker/volumes/db).

### `infra/caddy/Caddyfile`
```
{
	email noreply@<DOMAIN>
}

# API Supabase
<API_DOMAIN> {
	reverse_proxy kong:8000
}

# www → apex
www.<DOMAIN> {
	redir https://<DOMAIN>{uri} permanent
}

# Фронтенд (SPA) + AI-прокси
<DOMAIN> {
	encode zstd gzip

	# AI отвечает только вне РФ → проксируем на Vercel (Host подменяем).
	handle /api/* {
		reverse_proxy https://<VERCEL_APP> {
			header_up Host <VERCEL_APP>
		}
	}

	# Статика Vite + SPA-фолбэк.
	handle {
		root * /srv
		try_files {path} /index.html
		file_server
	}
}
```

### `infra/docker-compose.yml` (ключевое)
Полный стек — взять из официального self-hosted Supabase и применить правки:
- сервис `db`: `build: { context: ./db }` вместо `image:` + убрать все
  bind-mount'ы init-скриптов;
- сервис `auth`: добавить `GOTRUE_JWT_DEFAULT_GROUP_NAME: authenticated`;
- добавить сервис `caddy` (порты 80/443, `dns: [1.1.1.1, 8.8.8.8]`,
  volume `../client/dist:/srv:ro`);
- убрать `version:` (deprecated);
- realtime/edge-functions можно отключить, если не используются.

Минимальный фрагмент caddy + auth:
```yaml
  auth:
    image: supabase/gotrue:v2.170.0
    environment:
      GOTRUE_JWT_DEFAULT_GROUP_NAME: authenticated   # ← без этого role="" → 401
      # ... остальные GOTRUE_* как в апстриме

  caddy:
    image: caddy:2.8-alpine
    restart: unless-stopped
    depends_on: [kong]
    dns: ["1.1.1.1", "8.8.8.8"]                       # ← Let's Encrypt не достучится без этого
    ports: ["80:80", "443:443"]
    volumes:
      - ./caddy/Caddyfile:/etc/caddy/Caddyfile:ro
      - ../client/dist:/srv:ro                        # собранный фронт
      - caddy_data:/data
      - caddy_config:/config

volumes:
  caddy_data:
  caddy_config:
```

### `infra/scripts/deploy.sh`
Идемпотентный скрипт: генерит секреты (POSTGRES_PASSWORD, JWT_SECRET,
ANON_KEY, SERVICE_ROLE_KEY через HS256), собирает фронт в одноразовом
node-контейнере с инлайном `VITE_*`, поднимает стек `docker compose up -d --build`.
```bash
#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."   # → infra/
ENV_FILE=".env"
b64url() { openssl base64 -e -A | tr '+/' '-_' | tr -d '='; }
gen_jwt() {  # HS256 JWT для роли Supabase (anon|service_role)
  local role="$1" secret="$2" now exp h p
  now=$(date +%s); exp=$((now + 3155760000))   # +100 лет
  h=$(printf '%s' '{"alg":"HS256","typ":"JWT"}' | b64url)
  p=$(printf '%s' "{\"role\":\"$role\",\"iss\":\"supabase\",\"iat\":$now,\"exp\":$exp}" | b64url)
  printf '%s.%s.%s' "$h" "$p" \
    "$(printf '%s.%s' "$h" "$p" | openssl dgst -sha256 -hmac "$secret" -binary | b64url)"
}
if [[ ! -f "$ENV_FILE" ]]; then
  POSTGRES_PASSWORD=$(openssl rand -hex 24)
  JWT_SECRET=$(openssl rand -hex 32)
  ANON_KEY=$(gen_jwt anon "$JWT_SECRET")
  SERVICE_ROLE_KEY=$(gen_jwt service_role "$JWT_SECRET")
  cat > "$ENV_FILE" <<EOF
SUPABASE_PUBLIC_URL=https://<API_DOMAIN>
API_EXTERNAL_URL=https://<API_DOMAIN>
SITE_URL=https://<DOMAIN>
POSTGRES_PASSWORD=$POSTGRES_PASSWORD
POSTGRES_DB=postgres
POSTGRES_PORT=5432
JWT_SECRET=$JWT_SECRET
JWT_EXP=3600
ANON_KEY=$ANON_KEY
SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY
KONG_HTTP_PORT=8000
KONG_HTTPS_PORT=8443
ENABLE_EMAIL_AUTOCONFIRM=true
EOF
  chmod 600 "$ENV_FILE"
  echo "VITE_SUPABASE_URL=https://<API_DOMAIN>"
  echo "VITE_SUPABASE_ANON_KEY=$ANON_KEY"
fi
set -a; . ./"$ENV_FILE"; set +a
# Сборка фронта (VITE_* инлайнятся в бандл; dist раздаёт Caddy).
REPO_ROOT="$(cd .. && pwd)"
docker run --rm -v "$REPO_ROOT":/app -w /app \
  -e VITE_SUPABASE_URL="https://<API_DOMAIN>" \
  -e VITE_SUPABASE_ANON_KEY="$ANON_KEY" \
  node:20-alpine sh -c "npm ci && npm run build"
docker compose up -d --build --remove-orphans
```

---

## Шрифты (self-host вместо Google Fonts)

### В приложении (Vite)
```bash
npm install @fontsource/<font-a> @fontsource/<font-b>
```
В `main.tsx` импортировать нужные веса **до** `index.css`:
```ts
import "@fontsource/<font-a>/600.css";
import "@fontsource/<font-b>/400.css";
import "./index.css";
```
Из `index.css` убрать `@import url("https://fonts.googleapis.com/...")`.

### В статических HTML (напр. public/docs/*.html)
Пакеты не проходят через сборку — забираем woff2 вручную:
```bash
npm install @fontsource/<font>          # временно, ради файлов
mkdir -p public/docs/fonts
cp node_modules/@fontsource/<font>/files/<font>-latin-<wght>-normal.woff2 \
   public/docs/fonts/<font>-<wght>.woff2
npm uninstall @fontsource/<font>        # woff2 уже скопированы
```
В CSS добавить `@font-face` и удалить `<link href="...googleapis...">` из HTML:
```css
@font-face{font-family:'<Font>';font-weight:400;font-display:swap;
  src:url('fonts/<font>-400.woff2') format('woff2')}
```
> Латинские шрифты кириллицу не покрывают — она и через Google Fonts шла
> системным fallback'ом, поведение не меняется. Бери только latin-subset.

---

## Бонус: iOS/WebKit не мерцает
Не анимируй `filter`/`box-shadow` внутри элементов с `backdrop-filter` —
WebKit перерисовывает всё стекло каждый кадр. Анимируй только `transform`
(GPU-композит), тень делай статичной, добавь `transform: translateZ(0)` на
glass-элементы для выноса в отдельный слой.
```

