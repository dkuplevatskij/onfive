# Развёртывание OnFive на Timeweb через Coolify

Self-hosted Supabase под управлением [Coolify](https://coolify.io) — open-source
PaaS. Один VPS, Traefik с авто-SSL, git-push → авто-деплой. На этот же сервер
можно подселить другие проекты (AI Mentor, NAlog) — см. раздел в конце.

> **152-ФЗ:** весь стек и данные — на российском Timeweb Cloud.

---

## 0. Сервер

Timeweb Cloud Server, **Ubuntu 24.04 LTS**.

| Проектов на сервере | Рекомендуемая конфигурация |
|---------------------|----------------------------|
| Только OnFive | 2 vCPU / 4 GB RAM / 40 GB |
| OnFive + AI Mentor + NAlog | **4 vCPU / 8 GB RAM / 80 GB** |

---

## 1. Первичная настройка сервера

```bash
ssh root@<IP_сервера>
bash <(curl -fsSL https://raw.githubusercontent.com/dkuplevatskij/onfive/main/infra/scripts/setup.sh)
```

Скрипт: обновит систему, поставит UFW + fail2ban, откроет порты 80/443/8000,
установит Coolify (вместе с Docker, Compose, Traefik).

После установки открой `http://<IP_сервера>:8000` и создай админ-аккаунт Coolify.

---

## 2. Домены

В панели Timeweb (DNS) для домена пропиши A-записи на IP сервера:

| Запись | Назначение |
|--------|-----------|
| `onfive.pro` | фронтенд (если переедет с Vercel) |
| `api.onfive.pro` | Supabase API |
| `onfive.ru`, `api.onfive.ru` | резерв / редирект |

Coolify через Traefik сам выпустит Let's Encrypt-сертификаты при привязке домена
к сервису. Отдельный certbot не нужен.

---

## 3. Supabase как ресурс «Docker Compose»

Используем готовый `infra/docker-compose.yml` из этого репозитория.

1. **Coolify → Projects → New Project** → назови `onfive`.
2. **+ New Resource → Docker Compose**.
3. Источник: **Public/Private Repository** →
   `https://github.com/dkuplevatskij/onfive`, ветка `main`.
4. **Base directory:** `/infra` · **Compose file:** `docker-compose.yml`.
5. **Environment Variables** — заполни по `infra/.env.example`. Секреты генерируй:
   ```bash
   openssl rand -base64 32   # JWT_SECRET, POSTGRES_PASSWORD, REALTIME_ENC_KEY, LOGFLARE_API_KEY
   openssl rand -base64 64   # REALTIME_SECRET_KEY_BASE
   ```
   `ANON_KEY` и `SERVICE_ROLE_KEY` — сгенерируй из `JWT_SECRET` по
   [официальной инструкции](https://supabase.com/docs/guides/self-hosting/docker#generate-api-keys).

   > ⚠️ `SERVICE_ROLE_KEY` — **только на сервере**, никогда не во фронтенде.
6. **Domains:** привяжи `api.onfive.pro` к сервису `kong` (порт 8000).
7. **Deploy**. Coolify склонирует репо, поднимет стек, навесит SSL.

---

## 4. Применить миграции БД

После первого деплоя — один раз накатить схему:

```bash
ssh root@<IP_сервера>
git clone https://github.com/dkuplevatskij/onfive.git /tmp/onfive 2>/dev/null || true
cd /tmp/onfive && git pull
# .env с POSTGRES_DB не обязателен — по умолчанию postgres
bash infra/scripts/migrate.sh
```

Скрипт сам найдёт контейнер `supabase/postgres` и применит
`supabase/migrations/*.sql` по порядку (0001 → 0002 → 0003).

**Альтернатива:** открой Supabase Studio (через Coolify-туннель или SSH-проброс
порта 3000) → SQL Editor → вставь содержимое миграций вручную.

---

## 5. Переключить фронтенд на новый бэкенд

В переменных окружения фронтенда (Vercel или Coolify) поменяй:

```env
VITE_SUPABASE_URL=https://api.onfive.pro
VITE_SUPABASE_ANON_KEY=<ANON_KEY из шага 3>
```

Код менять не нужно — `supabase-js` просто пойдёт на новый URL.

---

## 6. Бэкапы

Coolify умеет автобэкапы Postgres из коробки:
**Resource → Backups → добавь расписание** (напр. ежедневно в 03:00, хранить 7
дней). Можно настроить выгрузку в Timeweb S3 Object Storage.

---

## 7. Обновления

Push в `main` → Coolify (если включён webhook) сам пересоберёт и передеплоит.
Или вручную: **Resource → Redeploy**. Для обновления версий образов Supabase —
поправь теги в `infra/docker-compose.yml` и передеплой.

---

## Подселение AI Mentor и NAlog

Каждый проект — **отдельный ресурс в Coolify**, свой домен, своя БД. Traefik
разводит по доменам, порты наружу не торчат.

| Проект | Тип ресурса | БД (one-click в Coolify) | Домен |
|--------|-------------|--------------------------|-------|
| **OnFive** | Docker Compose | Postgres (в составе Supabase) | `api.onfive.pro` |
| **AI Mentor** | Dockerfile (Next.js standalone) | PostgreSQL | `myaimentor.ru` |
| **NAlog** | Dockerfile (Express + Vite) | **MySQL** | `nalog.*` |

Порядок для каждого:
1. **+ New Resource** → `Database` → подними нужную БД (Postgres / MySQL).
2. **+ New Resource** → `Dockerfile` / `Docker Compose` → укажи репозиторий.
3. Пропиши env (`DATABASE_URL` от поднятой БД, ключи API и т.д.).
4. Привяжи домен → Coolify выпустит SSL.
5. Включи git-webhook для авто-деплоя из `main`.

> AI Mentor дополнительно требует Timeweb **S3 Object Storage** (аудио) —
> создаётся в панели Timeweb, креды кладутся в env ресурса.
