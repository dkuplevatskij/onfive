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

## Статус

Фаза 1 (MVP), каркас: выбор класса → предмета → темы/режима → чат с Claude
(5 режимов, сократические промпты), базовый учёт XP. Геймификация, доклады,
голос, родительская панель и Telegram Mini App — следующие фазы (см. `CLAUDE.md`).
