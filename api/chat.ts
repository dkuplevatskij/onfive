import Anthropic from "@anthropic-ai/sdk";
import type {
  ChatContext,
  ChatMessage,
  ChatRequest,
  ChatResponse,
  LearningMode,
} from "@onfive/shared";
import { GOAL_HINTS } from "@onfive/shared";

/**
 * Vercel Serverless Function: POST /api/chat
 *
 * Самодостаточный обработчик чата с AI-репетитором OnFive. Логика
 * системного промпта повторяет server/src/services/prompts.ts —
 * держим их синхронными. Так фронтенд и API живут на одном домене
 * Vercel без отдельного бэкенда и без CORS.
 */

const CHAT_MODEL = process.env.CLAUDE_MODEL_CHAT ?? "claude-sonnet-4-6";

let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error("ANTHROPIC_API_KEY не задан в окружении");
    client = new Anthropic({ apiKey });
  }
  return client;
}

/** Человекочитаемые названия предметов для промпта. */
function subjectTitle(id: string): string {
  const titles: Record<string, string> = {
    russian: "Русский язык",
    literature: "Литература",
    math: "Математика",
    algebra: "Алгебра",
    geometry: "Геометрия",
    physics: "Физика",
    chemistry: "Химия",
    biology: "Биология",
    geography: "География",
    history: "История",
    social: "Обществознание",
    english: "Английский язык",
    informatics: "Информатика",
  };
  return titles[id] ?? id;
}

const MODE_PROMPTS: Record<LearningMode, string> = {
  explain: `Режим: ОБЪЯСНЕНИЕ ТЕМЫ.
- Объясняй пошагово, маленькими порциями.
- После каждого шага задавай короткий проверочный вопрос.
- Не переходи дальше, пока ученик не понял предыдущий шаг.`,
  homework: `Режим: ПОМОЩЬ С ДОМАШКОЙ.
- Никогда не решай задание за ученика.
- Разбери условие вместе, задавай наводящие вопросы.
- Подсказывай следующий шаг, но ответ ученик находит сам.`,
  quiz: `Режим: ПРОВЕРЬ МЕНЯ.
- Задавай вопросы по одному, жди ответа.
- Разбирай ошибки подробно и доброжелательно.
- Постепенно повышай сложность.`,
  exam: `Режим: ПОДГОТОВКА К КОНТРОЛЬНОЙ/ЭКЗАМЕНУ.
- Составь план повторения по теме.
- Предлагай тренировочные задания формата контрольной.
- Отмечай слабые места и предлагай, что повторить.`,
  free: `Режим: СВОБОДНЫЙ ВОПРОС.
- Отвечай на вопрос ученика по предмету.
- Даже здесь подталкивай к размышлению, а не выдавай всё готовым.`,
};

function goalsHint(goals?: string[]): string {
  if (!goals || goals.length === 0) return "";
  const hints = goals.map((id) => GOAL_HINTS[id]).filter(Boolean);
  if (hints.length === 0) return "";
  return `\n\nЦели ученика (учитывай при общении): ${hints.join("; ")}.`;
}

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
  return `${base}\n\n${MODE_PROMPTS[ctx.mode]}${goalsHint(ctx.goals)}`;
}

const IMAGE_MEDIA_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
type ImageMediaType = (typeof IMAGE_MEDIA_TYPES)[number];

function parseDataUrl(dataUrl: string): { mediaType: string; data: string } | null {
  const match = /^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  return { mediaType: match[1], data: match[2] };
}

async function generateReply(
  context: ChatContext,
  messages: ChatMessage[],
  image?: string,
): Promise<string> {
  const apiMessages: Anthropic.MessageParam[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const parsed = image ? parseDataUrl(image) : null;
  const last = apiMessages[apiMessages.length - 1];
  if (parsed && last && last.role === "user") {
    const mediaType = (IMAGE_MEDIA_TYPES as readonly string[]).includes(parsed.mediaType)
      ? (parsed.mediaType as ImageMediaType)
      : "image/png";
    last.content = [
      { type: "image", source: { type: "base64", media_type: mediaType, data: parsed.data } },
      {
        type: "text",
        text: typeof last.content === "string" ? last.content : "Помоги разобраться с этим заданием.",
      },
    ];
  }

  const response = await getClient().messages.create({
    model: CHAT_MODEL,
    max_tokens: 1024,
    system: buildSystemPrompt(context),
    messages: apiMessages,
  });

  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();
}

function isValidChatRequest(body: unknown): body is ChatRequest {
  if (typeof body !== "object" || body === null) return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.context === "object" &&
    b.context !== null &&
    Array.isArray(b.messages) &&
    b.messages.length > 0
  );
}

interface VercelRequest {
  method?: string;
  body: unknown;
}
interface VercelResponse {
  status(code: number): VercelResponse;
  json(data: unknown): void;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Метод не поддерживается" });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    try {
      body = JSON.parse(body);
    } catch {
      res.status(400).json({ error: "Невалидный JSON" });
      return;
    }
  }

  if (!isValidChatRequest(body)) {
    res.status(400).json({ error: "Неверный формат запроса" });
    return;
  }

  const { context, messages, image } = body;
  try {
    const text = await generateReply(context, messages, image);
    const result: ChatResponse = { reply: text };
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(502).json({ error: "Ошибка обращения к Claude API" });
  }
}
