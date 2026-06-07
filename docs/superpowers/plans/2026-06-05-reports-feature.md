# «Доклады» Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Добавить раздел «Доклады» — AI-помощник для написания школьных докладов (3 режима), с локальным хранением, чат-флоу через существующий `/api/chat` и экспортом в `.docx`/`.pdf`.

**Architecture:** Фронтенд-фича на React+Zustand. Доклады хранятся в `localStorage`. Чат переиспользует `/api/chat`, расширенный полями `reportMode`/`reportLength`. Экспорт документов целиком клиентский. Бизнес-логика (store, построение промпта, генерация файлов) покрыта юнит-тестами на Vitest; страницы проверяются `typecheck` + `build` + ручным browser-qa.

**Tech Stack:** React 18, TypeScript, Zustand (+persist), react-router-dom 6, framer-motion, npm `docx`, `jspdf`, Vitest (новое).

**Спека:** `docs/superpowers/specs/2026-06-05-reports-feature-design.md`

---

## Замечания по реализации (прочитать до старта)

1. **Три места для типов.** Поля доклада добавляются в `shared/src/types.ts` (источник истины), но `api/chat.ts` намеренно **дублирует** типы локально (чтобы serverless-функция не зависела от воркспейса). `server/src/services/prompts.ts` импортирует из `@onfive/shared`. Все три обновляются согласованно.
2. **Достижения.** В `data/achievements.ts` сигнатура `unlocked` сейчас `{ xp; coins; streak }`. Расширяем её полем `reports`.
3. **Шрифт PDF.** Кириллический TTF кладётся в `client/public/fonts/` и подгружается во время экспорта через `fetch` (тот же origin, без внешней сети в рантайме).
4. **Соглашения кодстайла.** Русские JSDoc-комментарии, `press`-классы для кнопок, `framer-motion` `variants` (`stagger`/`rise`), цвета через токены (`bg-surface`, `text-ink`, `aurora`, и т.п.). Следуй существующим страницам (`ModeSelect.tsx`, `Home.tsx`).

---

## File Structure

**Новые файлы:**
- `client/vitest.config.ts` — конфиг тест-раннера
- `client/src/stores/reports.ts` — Zustand-store докладов
- `client/src/stores/reports.test.ts` — тесты store
- `client/src/data/reportModes.ts` — метаданные режимов и объёмов
- `client/src/lib/reportPrompt.ts` — построение системного промпта доклада (клиентская копия для тестов недоступна; промпт строится на сервере — см. Task 5; этот файл НЕ создаём)
- `client/src/lib/export/docx.ts` — экспорт в Word
- `client/src/lib/export/docx.test.ts`
- `client/src/lib/export/pdf.ts` — экспорт в PDF
- `client/src/lib/export/pdf.test.ts`
- `client/src/lib/export/filename.ts` — очистка имени файла
- `client/src/lib/export/filename.test.ts`
- `client/public/fonts/PTSans-Regular.ttf` — кириллический шрифт (бинарь)
- `client/src/pages/ReportsList.tsx`
- `client/src/pages/ReportNew.tsx`
- `client/src/pages/ReportWorkspace.tsx`
- `server/src/services/prompts.test.ts` — тесты построения промпта доклада

**Изменяемые файлы:**
- `shared/src/types.ts` — `ReportMode`, `ReportLength`, поля в `ChatContext`
- `server/src/services/prompts.ts` — ветка промптов докладов
- `api/chat.ts` — зеркальная ветка промптов + поля в инлайн-типах
- `client/src/data/achievements.ts` — ачивки «Автор»/«Докладчик» + сигнатура
- `client/src/pages/Profile.tsx` — передать `reports` в проверку ачивок (если применимо)
- `client/src/stores/user.ts` — метод `recordReport()`
- `client/src/app/router.tsx` — 3 роута
- `client/src/pages/Home.tsx` — карточка «Доклады»
- `client/package.json` — `docx`, `jspdf`, `vitest`, скрипт `test`

---

## Task 1: Тестовая инфраструктура (Vitest)

**Files:**
- Create: `client/vitest.config.ts`
- Modify: `client/package.json`

- [ ] **Step 1: Установить dev-зависимости**

```bash
cd client && npm install -D vitest@^2.1.0 jsdom@^25.0.0
```

- [ ] **Step 2: Добавить зависимости фичи**

```bash
cd client && npm install docx@^9.0.0 jspdf@^2.5.2
```

- [ ] **Step 3: Создать `client/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
```

- [ ] **Step 4: Добавить скрипт `test` в `client/package.json`**

В блок `"scripts"` добавить (после `"typecheck"`):

```json
    "test": "vitest run"
```

- [ ] **Step 5: Smoke-тест раннера**

Создать временный `client/src/smoke.test.ts`:

```ts
import { describe, it, expect } from "vitest";

describe("vitest", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

Run: `cd client && npm test`
Expected: PASS (1 passed). Затем удалить файл: `rm client/src/smoke.test.ts`.

- [ ] **Step 6: Commit**

```bash
git add client/package.json client/package-lock.json client/vitest.config.ts
git commit -m "Доклады: тестовая инфраструктура (vitest) + зависимости docx/jspdf"
```

---

## Task 2: Типы докладов в shared

**Files:**
- Modify: `shared/src/types.ts`

- [ ] **Step 1: Добавить типы и поля в `shared/src/types.ts`**

После определения `LearningMode` (строка ~46) добавить:

```ts
/** Режим работы над докладом. */
export type ReportMode = "write" | "draft" | "review";

/** Объём доклада: краткий ~500, средний ~1000, подробный ~2000 слов. */
export type ReportLength = "short" | "medium" | "long";
```

В интерфейсе `ChatContext` добавить два необязательных поля (после `goals?`):

```ts
  /** Если задан — это сессия доклада, а не обычного занятия. */
  reportMode?: ReportMode;
  /** Желаемый объём доклада (для режима черновика). */
  reportLength?: ReportLength;
```

- [ ] **Step 2: Проверить типы**

Run: `npm run typecheck --workspace=shared`
Expected: без ошибок.

- [ ] **Step 3: Commit**

```bash
git add shared/src/types.ts
git commit -m "Доклады: типы ReportMode/ReportLength в shared"
```

---

## Task 3: Серверные промпты докладов + тесты

**Files:**
- Modify: `server/src/services/prompts.ts`
- Create: `server/src/services/prompts.test.ts`
- Modify: `api/chat.ts` (зеркально)

- [ ] **Step 1: Написать падающий тест `server/src/services/prompts.test.ts`**

> Примечание: в `server` нет vitest. Тест выполняется из корня через npx. Если в server нет тест-раннера, добавь его как в Task 1, либо запусти `npx vitest run server/src/services/prompts.test.ts` из корня. Для простоты используем корневой запуск.

```ts
import { describe, it, expect } from "vitest";
import { buildSystemPrompt } from "./prompts.js";
import type { ChatContext } from "@onfive/shared";

const base: ChatContext = {
  grade: 7,
  subject: "history",
  topic: "Пётр I",
  mode: "free",
};

describe("buildSystemPrompt — доклады", () => {
  it("write: содержит инструкцию вести вопросами и не писать за ученика", () => {
    const p = buildSystemPrompt({ ...base, reportMode: "write" });
    expect(p).toContain("ПОМОЩЬ С ДОКЛАДОМ");
    expect(p).toMatch(/НЕ пиши весь доклад/i);
  });

  it("draft: учитывает объём", () => {
    const p = buildSystemPrompt({ ...base, reportMode: "draft", reportLength: "long" });
    expect(p).toContain("ЧЕРНОВИК");
    expect(p).toContain("2000");
  });

  it("review: просит обратную связь без переписывания", () => {
    const p = buildSystemPrompt({ ...base, reportMode: "review" });
    expect(p).toContain("ПРОВЕРКА ДОКЛАДА");
    expect(p).toMatch(/не переписывай/i);
  });

  it("без reportMode остаётся обычным занятием", () => {
    const p = buildSystemPrompt(base);
    expect(p).toContain("СВОБОДНЫЙ ВОПРОС");
  });
});
```

- [ ] **Step 2: Запустить тест — убедиться, что падает**

Run: `npx vitest run server/src/services/prompts.test.ts`
Expected: FAIL (промпты докладов ещё не реализованы).

- [ ] **Step 3: Реализовать промпты докладов в `server/src/services/prompts.ts`**

Добавить после `MODE_PROMPTS` (строка ~54):

```ts
/** Человекочитаемый объём доклада для промпта. */
const REPORT_LENGTH_HINT: Record<NonNullable<ChatContext["reportLength"]>, string> = {
  short: "краткий, около 500 слов",
  medium: "средний, около 1000 слов",
  long: "подробный, около 2000 слов",
};

/** Промпты для трёх режимов работы над докладом. */
const REPORT_PROMPTS: Record<NonNullable<ChatContext["reportMode"]>, string> = {
  write: `Режим: ПОМОЩЬ С ДОКЛАДОМ.
- Сначала уточни тему и желаемый объём.
- Предложи план доклада: введение, 3-5 пунктов основной части, заключение.
- По каждому пункту задавай ученику вопросы: «Что ты знаешь о...?», «Как думаешь, почему...?».
- На основе ответов ученика помогай сформулировать связный абзац.
- НЕ пиши весь доклад сам. Ученик участвует в создании каждой части.`,
  draft: `Режим: ГЕНЕРАЦИЯ ЧЕРНОВИКА ДОКЛАДА.
- Создай структурированный доклад по теме.
- Структура: Введение → Основная часть (3-5 разделов) → Заключение → Список источников.
- Язык грамотный, но на уровне класса ученика, не академический.
- Используй факты и понятные примеры.
- В конце предложи ученику прочитать и задать вопросы, если что-то непонятно.`,
  review: `Режим: ПРОВЕРКА ДОКЛАДА.
- Ученик вставляет свой текст доклада.
- Дай конструктивную обратную связь: структура, аргументация, грамотность, оформление.
- Отмечай и сильные стороны, и что улучшить.
- НЕ переписывай доклад за ученика — подсказывай, как улучшить самому.`,
};

/** Дополнение про объём для режима черновика. */
function reportLengthHint(ctx: ChatContext): string {
  if (ctx.reportMode !== "draft" || !ctx.reportLength) return "";
  return `\n- Объём: ${REPORT_LENGTH_HINT[ctx.reportLength]}.`;
}
```

Заменить тело `buildSystemPrompt` (строки ~77-79) на:

```ts
export function buildSystemPrompt(ctx: ChatContext): string {
  if (ctx.reportMode) {
    return `${basePrompt(ctx)}\n\n${REPORT_PROMPTS[ctx.reportMode]}${reportLengthHint(ctx)}${goalsHint(ctx.goals)}`;
  }
  return `${basePrompt(ctx)}\n\n${MODE_PROMPTS[ctx.mode]}${goalsHint(ctx.goals)}`;
}
```

- [ ] **Step 4: Запустить тест — убедиться, что проходит**

Run: `npx vitest run server/src/services/prompts.test.ts`
Expected: PASS (4 passed).

- [ ] **Step 5: Зеркально обновить `api/chat.ts`**

В инлайн-интерфейсе `ChatContext` (строки ~17-23) добавить:

```ts
  reportMode?: "write" | "draft" | "review";
  reportLength?: "short" | "medium" | "long";
```

После `MODE_PROMPTS` (строка ~99) добавить те же `REPORT_LENGTH_HINT`, `REPORT_PROMPTS`, `reportLengthHint` (адаптированные под локальные типы — ключи `"write"|"draft"|"review"` и `"short"|"medium"|"long"`):

```ts
const REPORT_LENGTH_HINT: Record<"short" | "medium" | "long", string> = {
  short: "краткий, около 500 слов",
  medium: "средний, около 1000 слов",
  long: "подробный, около 2000 слов",
};

const REPORT_PROMPTS: Record<"write" | "draft" | "review", string> = {
  write: `Режим: ПОМОЩЬ С ДОКЛАДОМ.
- Сначала уточни тему и желаемый объём.
- Предложи план доклада: введение, 3-5 пунктов основной части, заключение.
- По каждому пункту задавай ученику вопросы: «Что ты знаешь о...?», «Как думаешь, почему...?».
- На основе ответов ученика помогай сформулировать связный абзац.
- НЕ пиши весь доклад сам. Ученик участвует в создании каждой части.`,
  draft: `Режим: ГЕНЕРАЦИЯ ЧЕРНОВИКА ДОКЛАДА.
- Создай структурированный доклад по теме.
- Структура: Введение → Основная часть (3-5 разделов) → Заключение → Список источников.
- Язык грамотный, но на уровне класса ученика, не академический.
- Используй факты и понятные примеры.
- В конце предложи ученику прочитать и задать вопросы, если что-то непонятно.`,
  review: `Режим: ПРОВЕРКА ДОКЛАДА.
- Ученик вставляет свой текст доклада.
- Дай конструктивную обратную связь: структура, аргументация, грамотность, оформление.
- Отмечай и сильные стороны, и что улучшить.
- НЕ переписывай доклад за ученика — подсказывай, как улучшить самому.`,
};

function reportLengthHint(ctx: ChatContext): string {
  if (ctx.reportMode !== "draft" || !ctx.reportLength) return "";
  return `\n- Объём: ${REPORT_LENGTH_HINT[ctx.reportLength]}.`;
}
```

Заменить тело `buildSystemPrompt` в `api/chat.ts` (строки ~108-124) — добавить ветку доклада в начало:

```ts
function buildSystemPrompt(ctx: ChatContext): string {
  const base = `Ты — дружелюбный репетитор для ученика ${ctx.grade} класса российской школы.
Предмет: «${subjectTitle(ctx.subject)}». Тема: «${ctx.topic}».

ГЛАВНОЕ ПРАВИЛО: НИКОГДА НЕ ДАВАЙ ГОТОВЫХ ОТВЕТОВ И РЕШЕНИЙ.
- Веди ученика к ответу через наводящие вопросы и подсказки.
- Полное решение — ТОЛЬКО после 2-3 попыток ученика И его явной просьбы.

Правила:
- Уровень ${ctx.grade} класса, программа ФГОС.
- Примеры из жизни, понятные подростку.
- Мотивируй, хвали за правильные шаги. Обращайся на «ты».
- Формулы: $...$ строчные, $$...$$ блочные (LaTeX).
- «Не понимаю» → объясни ИНАЧЕ, другим способом.
- Только по предмету.`;
  if (ctx.reportMode) {
    return `${base}\n\n${REPORT_PROMPTS[ctx.reportMode]}${reportLengthHint(ctx)}${goalsHint(ctx.goals)}`;
  }
  return `${base}\n\n${MODE_PROMPTS[ctx.mode]}${goalsHint(ctx.goals)}`;
}
```

- [ ] **Step 6: Типы api/chat и server**

Run: `npm run typecheck --workspace=server`
Expected: без ошибок. (api/chat.ts проверяется при сборке Vercel; локально убедись `npx tsc --noEmit api/chat.ts` не обязателен, но желателен визуальный контроль.)

- [ ] **Step 7: Commit**

```bash
git add server/src/services/prompts.ts server/src/services/prompts.test.ts api/chat.ts
git commit -m "Доклады: системные промпты 3 режимов (server + api/chat)"
```

---

## Task 4: Метаданные режимов и объёмов

**Files:**
- Create: `client/src/data/reportModes.ts`

- [ ] **Step 1: Создать `client/src/data/reportModes.ts`**

```ts
import type { LucideIcon } from "lucide-react";
import { PenLine, FileText, CheckCheck } from "lucide-react";
import type { ReportMode, ReportLength } from "@onfive/shared";

/** Метаданные режима работы над докладом для карточек выбора. */
export interface ReportModeMeta {
  id: ReportMode;
  title: string;
  description: string;
  Icon: LucideIcon;
}

export const REPORT_MODES: ReportModeMeta[] = [
  {
    id: "write",
    title: "Помоги написать",
    description: "AI задаёт вопросы, ты отвечаешь — вместе собираем доклад",
    Icon: PenLine,
  },
  {
    id: "draft",
    title: "Сгенерируй черновик",
    description: "AI делает черновик, ты редактируешь под себя",
    Icon: FileText,
  },
  {
    id: "review",
    title: "Проверь мой доклад",
    description: "Вставь свой текст — AI даст обратную связь",
    Icon: CheckCheck,
  },
];

/** Метаданные объёма доклада. */
export interface ReportLengthMeta {
  id: ReportLength;
  title: string;
  hint: string;
}

export const REPORT_LENGTHS: ReportLengthMeta[] = [
  { id: "short", title: "Краткий", hint: "~500 слов" },
  { id: "medium", title: "Средний", hint: "~1000 слов" },
  { id: "long", title: "Подробный", hint: "~2000 слов" },
];

/** Найти метаданные режима по id. */
export function findReportMode(id: string): ReportModeMeta | undefined {
  return REPORT_MODES.find((m) => m.id === id);
}
```

- [ ] **Step 2: Проверить типы**

Run: `cd client && npm run typecheck`
Expected: без ошибок.

- [ ] **Step 3: Commit**

```bash
git add client/src/data/reportModes.ts
git commit -m "Доклады: метаданные режимов и объёмов"
```

---

## Task 5: Store докладов (TDD)

**Files:**
- Create: `client/src/stores/reports.ts`
- Test: `client/src/stores/reports.test.ts`

- [ ] **Step 1: Написать падающий тест `client/src/stores/reports.test.ts`**

```ts
import { describe, it, expect, beforeEach } from "vitest";
import { useReportsStore } from "./reports";

beforeEach(() => {
  // Сброс store и localStorage между тестами.
  localStorage.clear();
  useReportsStore.setState({ reports: [] });
});

describe("useReportsStore", () => {
  it("create добавляет доклад и возвращает id", () => {
    const id = useReportsStore.getState().create({
      subject: "history",
      topic: "Пётр I",
      length: "medium",
      mode: "write",
    });
    const reports = useReportsStore.getState().reports;
    expect(reports).toHaveLength(1);
    expect(reports[0].id).toBe(id);
    expect(reports[0].topic).toBe("Пётр I");
    expect(reports[0].draft).toBe("");
    expect(reports[0].messages).toEqual([]);
  });

  it("get возвращает доклад по id", () => {
    const id = useReportsStore.getState().create({
      subject: "biology", topic: "Клетка", length: "short", mode: "draft",
    });
    expect(useReportsStore.getState().get(id)?.topic).toBe("Клетка");
    expect(useReportsStore.getState().get("нет")).toBeUndefined();
  });

  it("update патчит поля и обновляет updatedAt", () => {
    const id = useReportsStore.getState().create({
      subject: "biology", topic: "Клетка", length: "short", mode: "draft",
    });
    const before = useReportsStore.getState().get(id)!.updatedAt;
    useReportsStore.getState().update(id, { draft: "Новый текст" });
    const after = useReportsStore.getState().get(id)!;
    expect(after.draft).toBe("Новый текст");
    expect(after.updatedAt >= before).toBe(true);
  });

  it("appendToDraft дописывает текст с разделителем", () => {
    const id = useReportsStore.getState().create({
      subject: "biology", topic: "Клетка", length: "short", mode: "draft",
    });
    useReportsStore.getState().appendToDraft(id, "Абзац 1");
    useReportsStore.getState().appendToDraft(id, "Абзац 2");
    expect(useReportsStore.getState().get(id)!.draft).toBe("Абзац 1\n\nАбзац 2");
  });

  it("remove удаляет доклад", () => {
    const id = useReportsStore.getState().create({
      subject: "biology", topic: "Клетка", length: "short", mode: "draft",
    });
    useReportsStore.getState().remove(id);
    expect(useReportsStore.getState().reports).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Запустить — убедиться, что падает**

Run: `cd client && npx vitest run src/stores/reports.test.ts`
Expected: FAIL (модуль `./reports` не найден).

- [ ] **Step 3: Реализовать `client/src/stores/reports.ts`**

```ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChatMessage, ReportLength, ReportMode, SubjectId } from "@onfive/shared";

/** Доклад ученика: чат с AI + накопленный текст. */
export interface Report {
  id: string;
  subject: SubjectId;
  topic: string;
  length: ReportLength;
  mode: ReportMode;
  messages: ChatMessage[];
  draft: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateInput {
  subject: SubjectId;
  topic: string;
  length: ReportLength;
  mode: ReportMode;
}

interface ReportsState {
  reports: Report[];
  create: (input: CreateInput) => string;
  get: (id: string) => Report | undefined;
  update: (id: string, patch: Partial<Report>) => void;
  appendToDraft: (id: string, text: string) => void;
  remove: (id: string) => void;
}

function nowIso(): string {
  return new Date().toISOString();
}

export const useReportsStore = create<ReportsState>()(
  persist(
    (set, get) => ({
      reports: [],

      create: (input) => {
        const id = crypto.randomUUID();
        const ts = nowIso();
        const report: Report = {
          id,
          ...input,
          messages: [],
          draft: "",
          createdAt: ts,
          updatedAt: ts,
        };
        set((s) => ({ reports: [report, ...s.reports] }));
        return id;
      },

      get: (id) => get().reports.find((r) => r.id === id),

      update: (id, patch) =>
        set((s) => ({
          reports: s.reports.map((r) =>
            r.id === id ? { ...r, ...patch, updatedAt: nowIso() } : r,
          ),
        })),

      appendToDraft: (id, text) =>
        set((s) => ({
          reports: s.reports.map((r) =>
            r.id === id
              ? { ...r, draft: r.draft ? `${r.draft}\n\n${text}` : text, updatedAt: nowIso() }
              : r,
          ),
        })),

      remove: (id) => set((s) => ({ reports: s.reports.filter((r) => r.id !== id) })),
    }),
    { name: "onfive-reports" },
  ),
);
```

- [ ] **Step 4: Запустить — убедиться, что проходит**

Run: `cd client && npx vitest run src/stores/reports.test.ts`
Expected: PASS (5 passed).

- [ ] **Step 5: Commit**

```bash
git add client/src/stores/reports.ts client/src/stores/reports.test.ts
git commit -m "Доклады: Zustand-store с персистом (TDD)"
```

---

## Task 6: XP за доклад в user-store

**Files:**
- Modify: `client/src/stores/user.ts`

- [ ] **Step 1: Добавить объявление метода в интерфейс `UserState`**

После `recordLesson: () => void;` (строка ~57) добавить:

```ts
  /** Зафиксировать создание доклада (+15 XP). */
  recordReport: () => void;
```

- [ ] **Step 2: Реализовать метод**

После реализации `recordLesson` (строка ~148, перед `reset:`) добавить:

```ts
      recordReport: () =>
        set((s) => ({ xp: s.xp + 15 })),
```

- [ ] **Step 3: Проверить типы**

Run: `cd client && npm run typecheck`
Expected: без ошибок.

- [ ] **Step 4: Commit**

```bash
git add client/src/stores/user.ts
git commit -m "Доклады: recordReport (+15 XP) в user-store"
```

---

## Task 7: Достижения «Автор» и «Докладчик»

**Files:**
- Modify: `client/src/data/achievements.ts`

- [ ] **Step 1: Расширить сигнатуру `unlocked` полем `reports`**

Заменить тип `unlocked` в `AchievementDef` (строка ~9):

```ts
  unlocked: (s: { xp: number; coins: number; streak: number; reports: number }) => boolean;
```

- [ ] **Step 2: Добавить иконки в импорт**

Заменить строку импорта (строка 2):

```ts
import { Footprints, Flame, Award, Coins, Crown, Target, PenLine, BookMarked } from "lucide-react";
```

- [ ] **Step 3: Добавить две ачивки в массив `ACHIEVEMENTS`**

Перед закрывающей `];` добавить:

```ts
  {
    id: "author",
    title: "Автор",
    description: "Создай первый доклад",
    Icon: PenLine,
    unlocked: (s) => s.reports >= 1,
  },
  {
    id: "speaker",
    title: "Докладчик",
    description: "Создай 10 докладов",
    Icon: BookMarked,
    unlocked: (s) => s.reports >= 10,
  },
```

- [ ] **Step 4: Обновить потребителя `unlocked` в `Profile.tsx`**

В `Profile.tsx` строка 21 сейчас: `const stats = { xp, coins, streak };` и строка 74: `a.unlocked(stats)`.

Добавить импорт reports-store (рядом с прочими импортами):

```tsx
import { useReportsStore } from "../stores/reports";
```

Внутри компонента, рядом с другими селекторами, добавить:

```tsx
  const reportsCount = useReportsStore((s) => s.reports.length);
```

Заменить строку 21:

```tsx
  const stats = { xp, coins, streak, reports: reportsCount };
```

- [ ] **Step 5: Проверить типы**

Run: `cd client && npm run typecheck`
Expected: без ошибок (если есть — значит, не все вызовы `unlocked` обновлены; исправить).

- [ ] **Step 6: Commit**

```bash
git add client/src/data/achievements.ts client/src/pages/Profile.tsx
git commit -m "Доклады: достижения Автор и Докладчик"
```

---

## Task 8: Очистка имени файла (TDD)

**Files:**
- Create: `client/src/lib/export/filename.ts`
- Test: `client/src/lib/export/filename.test.ts`

- [ ] **Step 1: Написать падающий тест**

```ts
import { describe, it, expect } from "vitest";
import { safeFileName } from "./filename";

describe("safeFileName", () => {
  it("заменяет пробелы и спецсимволы на дефисы", () => {
    expect(safeFileName("Пётр I: реформы")).toBe("Пётр-I-реформы");
  });
  it("обрезает повторяющиеся и крайние дефисы", () => {
    expect(safeFileName("  Тема   доклада!!  ")).toBe("Тема-доклада");
  });
  it("пустую строку заменяет на 'доклад'", () => {
    expect(safeFileName("   ")).toBe("доклад");
  });
});
```

- [ ] **Step 2: Запустить — убедиться, что падает**

Run: `cd client && npx vitest run src/lib/export/filename.test.ts`
Expected: FAIL.

- [ ] **Step 3: Реализовать `client/src/lib/export/filename.ts`**

```ts
/**
 * Превращает произвольную тему в безопасное имя файла:
 * убирает спецсимволы, схлопывает пробелы в дефисы.
 * Кириллицу сохраняем (современные ОС её поддерживают).
 */
export function safeFileName(topic: string): string {
  const cleaned = topic
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || "доклад";
}
```

- [ ] **Step 4: Запустить — убедиться, что проходит**

Run: `cd client && npx vitest run src/lib/export/filename.test.ts`
Expected: PASS (3 passed).

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/export/filename.ts client/src/lib/export/filename.test.ts
git commit -m "Доклады: безопасное имя файла (TDD)"
```

---

## Task 9: Экспорт в .docx (TDD)

**Files:**
- Create: `client/src/lib/export/docx.ts`
- Test: `client/src/lib/export/docx.test.ts`

- [ ] **Step 1: Написать падающий тест**

```ts
import { describe, it, expect } from "vitest";
import { buildDocxBlob } from "./docx";

describe("buildDocxBlob", () => {
  it("возвращает непустой Blob нужного типа", async () => {
    const blob = await buildDocxBlob("Пётр I", "Введение.\n\nОсновная часть.");
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
    expect(blob.type).toContain("officedocument.wordprocessingml");
  });
});
```

- [ ] **Step 2: Запустить — убедиться, что падает**

Run: `cd client && npx vitest run src/lib/export/docx.test.ts`
Expected: FAIL.

- [ ] **Step 3: Реализовать `client/src/lib/export/docx.ts`**

```ts
import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx";

const SIGNATURE = "Подготовлено с помощью OnFive AI";

/** Разбивает markdown-черновик на абзацы по пустым строкам. */
function toParagraphs(draft: string): Paragraph[] {
  return draft
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((text) => new Paragraph({ children: [new TextRun(text)], spacing: { after: 200 } }));
}

/** Собирает .docx-документ доклада в Blob. */
export async function buildDocxBlob(topic: string, draft: string): Promise<Blob> {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: topic, heading: HeadingLevel.HEADING_1 }),
          ...toParagraphs(draft),
          new Paragraph({
            children: [new TextRun({ text: SIGNATURE, italics: true, color: "888888" })],
            spacing: { before: 400 },
          }),
        ],
      },
    ],
  });
  return Packer.toBlob(doc);
}
```

- [ ] **Step 4: Запустить — убедиться, что проходит**

Run: `cd client && npx vitest run src/lib/export/docx.test.ts`
Expected: PASS (1 passed).

- [ ] **Step 5: Commit**

```bash
git add client/src/lib/export/docx.ts client/src/lib/export/docx.test.ts
git commit -m "Доклады: экспорт в .docx (TDD)"
```

---

## Task 10: Кириллический шрифт + экспорт в .pdf

**Files:**
- Create: `client/public/fonts/PTSans-Regular.ttf` (бинарь)
- Create: `client/src/lib/export/pdf.ts`
- Test: `client/src/lib/export/pdf.test.ts`

- [ ] **Step 1: Добавить кириллический TTF**

Скачать PT Sans Regular (Open Font License) в `client/public/fonts/PTSans-Regular.ttf`:

```bash
mkdir -p client/public/fonts
curl -L -o client/public/fonts/PTSans-Regular.ttf \
  "https://github.com/google/fonts/raw/main/ofl/ptsans/PTSans-Regular.ttf"
```

Проверить, что файл скачался и не пустой:

Run: `test -s client/public/fonts/PTSans-Regular.ttf && echo OK`
Expected: `OK`. Если сеть недоступна — взять любой другой TTF с кириллицей (DejaVuSans, Roboto) и сохранить под тем же именем.

- [ ] **Step 2: Написать тест `client/src/lib/export/pdf.test.ts`**

> jsPDF работает в jsdom. Тестируем чистую функцию сборки текста PDF, не трогая загрузку шрифта (она требует fetch). Поэтому выносим компоновку в тестируемую часть.

```ts
import { describe, it, expect } from "vitest";
import { buildPdfBlob } from "./pdf";

describe("buildPdfBlob", () => {
  it("возвращает непустой PDF-Blob", async () => {
    // fontBase64 = "" → используем дефолтный шрифт (тест проверяет компоновку, не кириллицу).
    const blob = await buildPdfBlob("Topic", "Intro.\n\nBody.", "");
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
    expect(blob.type).toBe("application/pdf");
  });
});
```

- [ ] **Step 3: Запустить — убедиться, что падает**

Run: `cd client && npx vitest run src/lib/export/pdf.test.ts`
Expected: FAIL.

- [ ] **Step 4: Реализовать `client/src/lib/export/pdf.ts`**

```ts
import { jsPDF } from "jspdf";

const SIGNATURE = "Подготовлено с помощью OnFive AI";
const FONT_URL = "/fonts/PTSans-Regular.ttf";

/**
 * Собирает PDF доклада. Если передан fontBase64 (кириллический шрифт в base64),
 * регистрирует его; иначе использует дефолтный шрифт (без кириллицы — для тестов).
 */
export async function buildPdfBlob(
  topic: string,
  draft: string,
  fontBase64: string,
): Promise<Blob> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 56;
  const marginTop = 64;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - marginX * 2;

  let font = "helvetica";
  if (fontBase64) {
    doc.addFileToVFS("PTSans-Regular.ttf", fontBase64);
    doc.addFont("PTSans-Regular.ttf", "PTSans", "normal");
    font = "PTSans";
  }

  doc.setFont(font, "normal");
  doc.setFontSize(18);
  let y = marginTop;
  for (const line of doc.splitTextToSize(topic, maxWidth)) {
    doc.text(line, marginX, y);
    y += 24;
  }

  doc.setFontSize(12);
  y += 8;
  const paragraphs = draft.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  for (const p of paragraphs) {
    for (const line of doc.splitTextToSize(p, maxWidth)) {
      if (y > pageHeight - marginTop) {
        doc.addPage();
        y = marginTop;
      }
      doc.text(line, marginX, y);
      y += 18;
    }
    y += 10;
  }

  doc.setFontSize(10);
  doc.setTextColor(136, 136, 136);
  doc.text(SIGNATURE, marginX, pageHeight - 40);

  return doc.output("blob");
}

/** Загружает кириллический шрифт из public/ и возвращает base64 (без префикса data:). */
export async function loadFontBase64(): Promise<string> {
  const res = await fetch(FONT_URL);
  const buf = await res.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
```

- [ ] **Step 5: Запустить — убедиться, что проходит**

Run: `cd client && npx vitest run src/lib/export/pdf.test.ts`
Expected: PASS (1 passed).

- [ ] **Step 6: Commit**

```bash
git add client/public/fonts/PTSans-Regular.ttf client/src/lib/export/pdf.ts client/src/lib/export/pdf.test.ts
git commit -m "Доклады: экспорт в .pdf с кириллическим шрифтом"
```

---

## Task 11: Страница списка докладов

**Files:**
- Create: `client/src/pages/ReportsList.tsx`

- [ ] **Step 1: Создать `client/src/pages/ReportsList.tsx`**

```tsx
import { useNavigate } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { Plus, FileText, Trash2 } from "lucide-react";
import { useReportsStore } from "../stores/reports";
import { findSubject } from "../data/subjects";
import { findReportMode } from "../data/reportModes";

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const rise: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
};

/** Список созданных докладов + кнопка нового. */
export function ReportsList() {
  const navigate = useNavigate();
  const reports = useReportsStore((s) => s.reports);
  const remove = useReportsStore((s) => s.remove);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.h1 variants={rise} className="mb-1 font-display text-2xl font-extrabold tracking-tight">
        📝 Доклады
      </motion.h1>
      <motion.p variants={rise} className="mb-5 text-sm text-ink-soft">
        AI поможет написать доклад — но думать будешь ты.
      </motion.p>

      <motion.button
        variants={rise}
        onClick={() => navigate("/reports/new")}
        className="press aurora mb-5 flex w-full items-center justify-center gap-2 rounded-[var(--radius-card)] p-4 font-bold text-white shadow-glow"
      >
        <Plus size={20} /> Новый доклад
      </motion.button>

      {reports.length === 0 ? (
        <motion.div variants={rise} className="rounded-[var(--radius-card)] bg-surface p-6 text-center text-ink-soft shadow-soft">
          Пока нет докладов. Создай первый!
        </motion.div>
      ) : (
        <div className="grid gap-3">
          {reports.map((r) => {
            const subject = findSubject(r.subject);
            const mode = findReportMode(r.mode);
            return (
              <motion.div
                key={r.id}
                variants={rise}
                className="press flex items-center gap-3 rounded-[var(--radius-card)] bg-surface p-4 shadow-soft hover:shadow-glow"
              >
                <button
                  onClick={() => navigate(`/reports/${r.id}`)}
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-bg text-ink">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-bold tracking-tight">{r.topic}</div>
                    <div className="truncate text-sm text-ink-soft">
                      {subject?.title ?? r.subject} · {mode?.title ?? r.mode}
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => remove(r.id)}
                  aria-label="Удалить доклад"
                  className="press grid h-9 w-9 shrink-0 place-items-center rounded-full bg-bg text-ink-faint"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
```

- [ ] **Step 2: Проверить типы**

Run: `cd client && npm run typecheck`
Expected: без ошибок. (Роут добавим в Task 13 — пока компонент просто существует.)

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/ReportsList.tsx
git commit -m "Доклады: страница списка"
```

---

## Task 12: Мастер создания доклада

**Files:**
- Create: `client/src/pages/ReportNew.tsx`

- [ ] **Step 1: Создать `client/src/pages/ReportNew.tsx`**

Трёхшаговый мастер: предмет → тема+объём → режим. По завершении создаёт доклад, начисляет XP и переходит в рабочее пространство.

```tsx
import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import type { ReportLength, ReportMode } from "@onfive/shared";
import { useUserStore } from "../stores/user";
import { useReportsStore } from "../stores/reports";
import { subjectsForGrade } from "../data/subjects";
import { SUBJECT_COLOR } from "../data/subjectColors";
import { SUBJECT_ICON } from "../data/subjectIcons";
import { REPORT_MODES, REPORT_LENGTHS } from "../data/reportModes";

const rise: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
};

/** Мастер создания доклада: предмет → тема+объём → режим. */
export function ReportNew() {
  const navigate = useNavigate();
  const grade = useUserStore((s) => s.grade);
  const recordReport = useUserStore((s) => s.recordReport);
  const createReport = useReportsStore((s) => s.create);

  const [subject, setSubject] = useState<string | null>(null);
  const [topic, setTopic] = useState("");
  const [length, setLength] = useState<ReportLength>("medium");

  if (grade === null) return <Navigate to="/" replace />;
  const subjects = subjectsForGrade(grade);

  const finish = (mode: ReportMode) => {
    if (!subject || !topic.trim()) return;
    const id = createReport({
      subject: subject as never,
      topic: topic.trim(),
      length,
      mode,
    });
    recordReport();
    navigate(`/reports/${id}`, { replace: true });
  };

  // Шаг 1: предмет
  if (!subject) {
    return (
      <motion.div initial="hidden" animate="show">
        <motion.h1 variants={rise} className="mb-4 font-display text-2xl font-extrabold tracking-tight">
          О чём доклад?
        </motion.h1>
        <div className="grid grid-cols-2 gap-3">
          {subjects.map((s) => {
            const Icon = SUBJECT_ICON[s.id];
            return (
              <motion.button
                key={s.id}
                variants={rise}
                onClick={() => setSubject(s.id)}
                className="press flex flex-col items-start gap-2 rounded-[var(--radius-card)] bg-surface p-4 text-left shadow-soft hover:shadow-glow"
              >
                <div className={`grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br text-white ${SUBJECT_COLOR[s.id]}`}>
                  <Icon size={20} strokeWidth={2.2} />
                </div>
                <span className="font-bold tracking-tight">{s.title}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    );
  }

  // Шаг 2: тема + объём → выбор режима запускает создание
  return (
    <motion.div initial="hidden" animate="show">
      <motion.h1 variants={rise} className="mb-4 font-display text-2xl font-extrabold tracking-tight">
        Тема и объём
      </motion.h1>

      <motion.input
        variants={rise}
        value={topic}
        onChange={(e) => setTopic(e.target.value)}
        placeholder="Например: Жизнь и реформы Петра I"
        className="mb-4 w-full rounded-2xl border border-hairline bg-surface px-4 py-3 shadow-soft outline-none transition focus:border-violet"
      />

      <motion.div variants={rise} className="mb-5 grid grid-cols-3 gap-2">
        {REPORT_LENGTHS.map((l) => (
          <button
            key={l.id}
            onClick={() => setLength(l.id)}
            className={`press rounded-2xl p-3 text-center shadow-soft ${
              length === l.id ? "aurora text-white" : "bg-surface text-ink"
            }`}
          >
            <div className="text-sm font-bold">{l.title}</div>
            <div className={`text-xs ${length === l.id ? "text-white/80" : "text-ink-faint"}`}>{l.hint}</div>
          </button>
        ))}
      </motion.div>

      <motion.h2 variants={rise} className="mb-2 px-1 text-sm font-bold uppercase tracking-wide text-ink-faint">
        Как помочь?
      </motion.h2>
      <div className="grid gap-3">
        {REPORT_MODES.map((m) => (
          <motion.button
            key={m.id}
            variants={rise}
            disabled={!topic.trim()}
            onClick={() => finish(m.id)}
            className="press flex items-center gap-4 rounded-[var(--radius-card)] bg-surface p-4 text-left shadow-soft hover:shadow-glow disabled:opacity-50"
          >
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-bg text-ink">
              <m.Icon size={22} strokeWidth={2.2} />
            </div>
            <div>
              <div className="font-bold tracking-tight">{m.title}</div>
              <div className="text-sm text-ink-soft">{m.description}</div>
            </div>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
```

> **Проверь имена хелперов:** в `data/subjects.ts` функция фильтрации называется `subjectsForGrade`. Если иначе — поправь импорт. Run: `cd client && grep -n "export" src/data/subjects.ts`

- [ ] **Step 2: Проверить типы**

Run: `cd client && npm run typecheck`
Expected: без ошибок.

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/ReportNew.tsx
git commit -m "Доклады: мастер создания (предмет → тема → режим)"
```

---

## Task 13: Рабочее пространство доклада

**Files:**
- Create: `client/src/pages/ReportWorkspace.tsx`

- [ ] **Step 1: Создать `client/src/pages/ReportWorkspace.tsx`**

Две вкладки: Чат (переиспользует `Markdown`, шлёт в `/api/chat` с `reportMode`/`reportLength`) и Текст (редактор + экспорт). Кнопка «В доклад» под ответами AI.

```tsx
import { useState, useRef, useEffect } from "react";
import { Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, Plus, Download, MessageSquare, FileText } from "lucide-react";
import type { ChatContext, ChatMessage } from "@onfive/shared";
import { useUserStore } from "../stores/user";
import { useReportsStore } from "../stores/reports";
import { sendChat } from "../lib/api";
import { Markdown } from "../components/chat/Markdown";
import { findSubject } from "../data/subjects";
import { findReportMode } from "../data/reportModes";
import { buildDocxBlob } from "../lib/export/docx";
import { buildPdfBlob, loadFontBase64 } from "../lib/export/pdf";
import { safeFileName } from "../lib/export/filename";

type Tab = "chat" | "text";

/** Скачивает Blob под именем name. */
function download(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}

export function ReportWorkspace() {
  const { id = "" } = useParams();
  const grade = useUserStore((s) => s.grade);
  const report = useReportsStore((s) => s.get(id));
  const update = useReportsStore((s) => s.update);
  const appendToDraft = useReportsStore((s) => s.appendToDraft);

  const [tab, setTab] = useState<Tab>("chat");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [report?.messages, loading]);

  if (grade === null) return <Navigate to="/" replace />;
  if (!report) return <Navigate to="/reports" replace />;

  const subject = findSubject(report.subject);
  const modeMeta = findReportMode(report.mode);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const nextMessages: ChatMessage[] = [...report.messages, { role: "user", content: text }];
    update(id, { messages: nextMessages });
    setInput("");
    setError(null);
    setLoading(true);
    try {
      const context: ChatContext = {
        grade,
        subject: report.subject,
        topic: report.topic,
        mode: "free",
        reportMode: report.mode,
        reportLength: report.length,
      };
      const reply = await sendChat(context, nextMessages);
      update(id, { messages: [...nextMessages, { role: "assistant", content: reply }] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось получить ответ.");
    } finally {
      setLoading(false);
    }
  };

  const exportDocx = async () => {
    const blob = await buildDocxBlob(report.topic, report.draft);
    download(blob, `${safeFileName(report.topic)}-onfive.docx`);
  };
  const exportPdf = async () => {
    const font = await loadFontBase64();
    const blob = await buildPdfBlob(report.topic, report.draft, font);
    download(blob, `${safeFileName(report.topic)}-onfive.pdf`);
  };

  return (
    <div className="flex h-[calc(100dvh-9rem)] flex-col">
      {/* Шапка */}
      <div className="mb-3">
        <h1 className="truncate font-display text-xl font-extrabold tracking-tight">{report.topic}</h1>
        <p className="text-sm text-ink-soft">
          {subject?.title ?? report.subject} · {modeMeta?.title ?? report.mode}
        </p>
      </div>

      {/* Переключатель вкладок */}
      <div className="mb-3 grid grid-cols-2 gap-1 rounded-2xl bg-surface p-1 shadow-soft">
        <button
          onClick={() => setTab("chat")}
          className={`press flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold ${
            tab === "chat" ? "aurora text-white" : "text-ink-soft"
          }`}
        >
          <MessageSquare size={15} /> Чат
        </button>
        <button
          onClick={() => setTab("text")}
          className={`press flex items-center justify-center gap-1.5 rounded-xl py-2 text-sm font-semibold ${
            tab === "text" ? "aurora text-white" : "text-ink-soft"
          }`}
        >
          <FileText size={15} /> Текст
        </button>
      </div>

      {tab === "chat" ? (
        <>
          <div className="flex-1 space-y-3 overflow-y-auto pb-4">
            {report.messages.length === 0 && (
              <p className="text-ink-faint">Напиши, с чего начать. AI предложит план доклада. 👇</p>
            )}
            {report.messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={`max-w-[82%] overflow-hidden rounded-3xl ${
                    m.role === "user"
                      ? "aurora rounded-br-lg text-white shadow-glow"
                      : "rounded-bl-lg bg-surface text-ink shadow-soft"
                  }`}
                >
                  <div className={`px-4 py-3 ${m.role === "user" ? "whitespace-pre-wrap" : ""}`}>
                    {m.role === "user" ? m.content : <Markdown content={m.content} />}
                    {m.role === "assistant" && (
                      <button
                        onClick={() => {
                          appendToDraft(id, m.content);
                          setTab("text");
                        }}
                        className="press mt-2 inline-flex items-center gap-1.5 rounded-full bg-bg px-2.5 py-1 text-xs font-semibold text-ink-soft"
                      >
                        <Plus size={13} /> В доклад
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            {loading && (
              <div className="flex items-center gap-1.5 text-ink-faint">
                <span className="h-2 w-2 animate-bounce rounded-full bg-violet [animation-delay:-0.2s]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-blue" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-teal [animation-delay:0.2s]" />
              </div>
            )}
            {error && <div className="text-coral">{error}</div>}
            <div ref={bottomRef} />
          </div>

          <div className="flex items-end gap-2 pt-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  void send();
                }
              }}
              rows={1}
              placeholder="Твоё сообщение…"
              className="flex-1 resize-none rounded-2xl border border-hairline bg-surface px-4 py-3 shadow-soft outline-none transition focus:border-violet"
            />
            <button
              onClick={() => void send()}
              disabled={loading}
              aria-label="Отправить"
              className="press aurora grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white shadow-glow disabled:opacity-50"
            >
              <Send size={19} />
            </button>
          </div>
        </>
      ) : (
        <>
          <textarea
            value={report.draft}
            onChange={(e) => update(id, { draft: e.target.value })}
            placeholder="Здесь собирается текст доклада. Добавляй ответы AI кнопкой «В доклад» или пиши сам."
            className="flex-1 resize-none rounded-2xl border border-hairline bg-surface p-4 shadow-soft outline-none transition focus:border-violet"
          />
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              onClick={() => void exportDocx()}
              disabled={!report.draft.trim()}
              className="press flex items-center justify-center gap-2 rounded-2xl bg-surface py-3 font-semibold text-ink shadow-soft disabled:opacity-50"
            >
              <Download size={18} /> .docx
            </button>
            <button
              onClick={() => void exportPdf()}
              disabled={!report.draft.trim()}
              className="press flex items-center justify-center gap-2 rounded-2xl bg-surface py-3 font-semibold text-ink shadow-soft disabled:opacity-50"
            >
              <Download size={18} /> .pdf
            </button>
          </div>
        </>
      )}
    </div>
  );
}
```

> **Проверь сигнатуру `sendChat`:** в `client/src/lib/api.ts` это `sendChat(context, messages, image?)`. Третий аргумент опционален — здесь не передаём. Если сигнатура иная — поправь.

- [ ] **Step 2: Проверить типы**

Run: `cd client && npm run typecheck`
Expected: без ошибок.

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/ReportWorkspace.tsx
git commit -m "Доклады: рабочее пространство (вкладки Чат/Текст, экспорт)"
```

---

## Task 14: Роуты и карточка на Главной

**Files:**
- Modify: `client/src/app/router.tsx`
- Modify: `client/src/pages/Home.tsx`

- [ ] **Step 1: Добавить lazy-импорты в `router.tsx`**

После строки импорта `Chat` (строка ~29) добавить:

```tsx
const ReportsList = lazy(() =>
  import("../pages/ReportsList").then((m) => ({ default: m.ReportsList })),
);
const ReportNew = lazy(() => import("../pages/ReportNew").then((m) => ({ default: m.ReportNew })));
const ReportWorkspace = lazy(() =>
  import("../pages/ReportWorkspace").then((m) => ({ default: m.ReportWorkspace })),
);
```

- [ ] **Step 2: Добавить роуты в блок `PlainLayout`**

После `{ path: "/chat", element: <Chat /> },` (строка ~55) добавить:

```tsx
          { path: "/reports", element: <ReportsList /> },
          { path: "/reports/new", element: <ReportNew /> },
          { path: "/reports/:id", element: <ReportWorkspace /> },
```

- [ ] **Step 3: Добавить карточку «Доклады» в Dashboard (`Home.tsx`)**

В импорт иконок (строка 3) добавить `PenLine`:

```tsx
import { Brain, Target, Flame, BookOpen, ListChecks, Trophy, ChevronRight, Gift, PenLine } from "lucide-react";
```

В `Dashboard`, в сетке кнопок (после кнопки «Рейтинг», строка ~173, перед закрывающим `</div>` сетки `grid-cols-2`) добавить карточку «Доклады» во всю ширину:

```tsx
        <motion.button
          variants={rise}
          onClick={() => navigate("/reports")}
          className="press col-span-2 flex items-center justify-between rounded-[var(--radius-card)] bg-surface p-5 text-left shadow-soft hover:shadow-glow"
        >
          <div className="flex items-center gap-4">
            <div className="aurora grid h-12 w-12 place-items-center rounded-2xl text-white shadow-glow">
              <PenLine size={22} />
            </div>
            <div>
              <div className="font-bold tracking-tight">📝 Доклады</div>
              <div className="text-sm text-ink-soft">AI поможет написать доклад</div>
            </div>
          </div>
          <ChevronRight className="text-ink-faint" />
        </motion.button>
```

- [ ] **Step 4: Проверить типы и сборку**

Run: `cd client && npm run typecheck && npm run build`
Expected: сборка успешна, без ошибок типов.

- [ ] **Step 5: Commit**

```bash
git add client/src/app/router.tsx client/src/pages/Home.tsx
git commit -m "Доклады: роуты и карточка на Главной"
```

---

## Task 15: Финальная верификация

**Files:** нет (проверочный таск)

- [ ] **Step 1: Прогнать все тесты**

Run: `cd client && npm test`
Expected: все тесты PASS (store, filename, docx, pdf).

Run: `npx vitest run server/src/services/prompts.test.ts`
Expected: PASS.

- [ ] **Step 2: Типы по всем воркспейсам**

Run: `npm run typecheck`
Expected: без ошибок.

- [ ] **Step 3: Сборка клиента (как на Vercel)**

Run: `npm run build:client`
Expected: успешно.

- [ ] **Step 4: Ручной browser-qa (использовать skill browser-qa или dev-сервер)**

Сценарий:
1. `npm run dev:client`, открыть приложение, задать класс (если не задан).
2. Главная → карточка «📝 Доклады» → `/reports`.
3. «Новый доклад» → выбрать предмет → ввести тему → выбрать объём → выбрать режим «Помоги написать».
4. В чате отправить сообщение, получить ответ AI с планом.
5. Нажать «В доклад» под ответом → проверить переход на вкладку «Текст» и появление текста.
6. Отредактировать текст, нажать «.docx» → файл скачивается, открывается, кириллица читается, есть подпись «Подготовлено с помощью OnFive AI».
7. Нажать «.pdf» → файл скачивается, кириллица отображается корректно.
8. Вернуться в `/reports` → доклад в списке. Перезагрузить страницу → доклад сохранился (localStorage).
9. Profile → проверить, что ачивка «Автор» разблокирована.

- [ ] **Step 5: Push и PR**

```bash
git push -u origin claude/wizardly-maxwell-iYzFE
```

Создать draft-PR через GitHub MCP.

---

## Self-Review (выполнено при написании плана)

- **Покрытие спеки:** навигация (Task 14), хранение (Task 5), AI-флоу/промпты (Task 3, 13), 3 режима (Task 4), экспорт docx/pdf (Task 9, 10), вкладки Чат/Текст (Task 13), геймификация XP+ачивки (Task 6, 7). Голос/фото исключены (вне области). ✓
- **Расхождение со спекой:** спека утверждала, что ачивки «Автор»/«Докладчик» уже есть — фактически их нет; Task 7 их добавляет и расширяет сигнатуру `unlocked`. ✓
- **Типы согласованы:** `ReportMode`/`ReportLength` определены в Task 2, используются единообразно в store, data, страницах, промптах. `buildDocxBlob(topic, draft)`, `buildPdfBlob(topic, draft, fontBase64)`, `loadFontBase64()`, `safeFileName(topic)`, `create(input)→id`, `appendToDraft(id, text)`, `recordReport()` — имена совпадают между задачами. ✓
- **Плейсхолдеры:** код приведён полностью в каждом шаге; помечены места, где имя хелпера нужно сверить grep-ом (`subjectsForGrade`, `sendChat`). ✓
