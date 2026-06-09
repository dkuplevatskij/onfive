# Supabase для OnFive

Облачный слой OnFive: анонимная авторизация, синхронизация прогресса между
устройствами и живой рейтинг. **Приложение полностью работает и без Supabase** —
на `localStorage`. Облако подключается добавлением двух переменных окружения,
менять код не нужно.

## Что даёт облако

- **Анонимный вход** — каждому ученику заводится анонимная сессия, прогресс
  привязывается к ней и переживает перезагрузку. Позже сессию можно «апгрейдить»
  (привязать e-mail / OAuth), сохранив весь прогресс.
- **Синхронизация** XP, монет, стрика и докладов между устройствами. Слияние
  конфликт-свободное: монотонные счётчики берутся по максимуму, доклады — по
  более свежей версии (см. `client/src/lib/sync/merge.ts`).
- **Живой рейтинг** через защищённую RPC `onfive_leaderboard` — наружу отдаются
  только публичные поля (ник, аватар, XP, стрик, класс).

## Настройка

1. Создай проект на [supabase.com](https://supabase.com).
2. **SQL Editor** → выполни `supabase/migrations/0001_init.sql`.
3. **Authentication → Providers → Anonymous Sign-Ins** → включи.
4. **Project Settings → API** → скопируй `Project URL` и `anon public` ключ.
5. Задай переменные окружения клиента (локально — `client/.env`, на Vercel —
   Project Settings → Environment Variables):

   ```
   VITE_SUPABASE_URL=https://<твой-проект>.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon public ключ>
   ```

6. Пересобери / передеплой клиент. Готово — синхронизация и рейтинг включатся
   автоматически.

> `anon`-ключ публичен по дизайну Supabase: его безопасно держать в браузере,
> потому что доступ к данным ограничивают политики RLS из миграции. **Никогда не
> используй `service_role`-ключ на фронтенде.**

## Структура

- `migrations/0001_init.sql` — таблицы `profiles`, `reports`, политики RLS и
  функция рейтинга. Миграции идемпотентны (`if not exists` / `or replace`) —
  повторный прогон безопасен.

## Переезд на Timeweb Cloud (план)

Сейчас OnFive работает на managed-хостинге **supabase.com** — это минимум участия
на этапе MVP. Когда появятся реальные ученики с настоящими персональными данными
(ФИО, Telegram, VK), данные граждан РФ нужно хранить на серверах в России
(**152-ФЗ**). Тогда переезжаем на **self-hosted Supabase в Timeweb Cloud**.

> Managed-Supabase «в один клик» в РФ нет ни у Timeweb, ни у Yandex Cloud —
> везде это self-hosting Supabase (Docker на VM) + опционально managed-PostgreSQL
> провайдера как хранилище. Выбран Timeweb: дешевле и проще для инди-этапа.

Supabase — open-source, поэтому переезд не трогает код приложения:

1. Развернуть self-hosted Supabase в Timeweb Cloud:
   - создать **Облачный сервер** (Docker — например, через образ Portainer из
     Маркетплейса) и поднять официальный
     [docker-compose Supabase](https://supabase.com/docs/guides/self-hosting/docker);
     см. гайд Timeweb «[Как развернуть Supabase](https://timeweb.cloud/tutorials/cloud/kak-razvernut-supabase-v-oblake-timeweb-cloud)»;
   - опционально вынести БД в **Базы данных (managed PostgreSQL)** Timeweb, чтобы
     бэкапы и обновления Postgres были на стороне провайдера, а файлы — в их S3.
2. Применить ту же миграцию `migrations/0001_init.sql` — таблицы, RLS и функция
   рейтинга переносятся без изменений.
3. Включить Anonymous Sign-Ins в self-hosted GoTrue.
4. **Поменять только переменные окружения** на новые `VITE_SUPABASE_URL` /
   `VITE_SUPABASE_ANON_KEY` своего инстанса и передеплоить клиент.

Благодаря «мягкой» архитектуре (`client/src/lib/supabase.ts`) смена провайдера —
это смена двух переменных, а не правка кода. Логика синхронизации и слияния
(`client/src/lib/sync/`) от хостинга не зависит — те же шаги подходят и для
Yandex Cloud, если позже понадобится больше масштаба.

