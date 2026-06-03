# OnFive — AI-репетитор «на пятёрку»

Учись на пятёрку с AI. Сократический метод обучения для учеников 5–11 классов
российской школы: репетитор никогда не даёт готовых ответов, а ведёт к решению
подсказками и наводящими вопросами.

> Полная спецификация продукта — в [`CLAUDE.md`](./CLAUDE.md).

## Структура монорепо

```
onfive/
├── shared/   # Общие типы и константы (@onfive/shared)
├── server/   # API-сервер на Fastify + Claude API (@onfive/server)
└── client/   # React-приложение на Vite + Tailwind (@onfive/client)
```

## Стек

- **Frontend:** React 18 + TypeScript, Vite, React Router, Tailwind CSS v4, Zustand
- **Backend:** Node.js + Fastify + TypeScript, Anthropic Claude API
- **Общее:** npm workspaces, общий пакет `@onfive/shared`

## Быстрый старт

```bash
# 1. Установить зависимости (из корня репозитория)
npm install

# 2. Настроить ключ Claude API для сервера
cp server/.env.example server/.env
#   и вписать ANTHROPIC_API_KEY=...

# 3. Запустить клиент и сервер в режиме разработки
npm run dev          # client (5173) + server (3001) одновременно
# или по отдельности:
npm run dev:server
npm run dev:client
```

Клиент проксирует запросы `/api/*` на сервер (порт 3001), поэтому отдельная
настройка CORS для локальной разработки не требуется.

## Полезные команды

```bash
npm run build       # сборка всех воркспейсов
npm run typecheck   # проверка типов во всех воркспейсах
```

## Деплой на Vercel (один URL для фронтенда и API)

Проект настроен под деплой **одним проектом Vercel**: статика React-клиента
раздаётся из `client/dist`, а чат-API работает как Serverless Function в
каталоге [`api/`](./api) (`/api/chat`, `/api/health`). Отдельный backend и
настройка CORS не нужны — всё на одном домене.

Что уже лежит в репозитории:

- [`vercel.json`](./vercel.json) — build-команда, выходной каталог и SPA-rewrite;
- [`api/chat.ts`](./api/chat.ts) — обработчик чата с Claude (с поддержкой
  фото-задания через Vision);
- [`api/health.ts`](./api/health.ts) — health-check.

Шаги:

1. Зайти на [vercel.com](https://vercel.com) → **Add New… → Project** и
   импортировать репозиторий с GitHub.
2. Root Directory оставить корнем репозитория (Vercel сам подхватит
   `vercel.json`; build-команда — `npm run build:client`).
3. В **Settings → Environment Variables** добавить:
   - `ANTHROPIC_API_KEY` — ключ Claude API (обязательно);
   - `CLAUDE_MODEL_CHAT` — опционально, по умолчанию `claude-sonnet-4-6`.
4. **Deploy.** Через пару минут будет публичный URL вида
   `https://onfive.vercel.app`.

> Без `ANTHROPIC_API_KEY` интерфейс полностью работает (онбординг,
> геймификация, навигация), но чат вернёт ошибку — ключ нужен только для
> ответов репетитора.

Альтернатива по спецификации (`CLAUDE.md`): клиент на Vercel/Cloudflare Pages +
отдельный Fastify-сервер (`server/`) на Railway/Render. Для этого варианта
клиент собирается с `VITE_API_URL`, указывающим на адрес сервера.

## Статус

Фаза 1 (MVP), каркас: выбор класса → предмета → темы/режима → чат с Claude
(5 режимов, сократические промпты), базовый учёт XP. Геймификация, доклады,
голос, родительская панель и Telegram Mini App — следующие фазы (см. `CLAUDE.md`).
