import Anthropic from "@anthropic-ai/sdk";
import type { ChatMessage, ChatContext } from "@onfive/shared";
import { buildSystemPrompt } from "./prompts.js";

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("ANTHROPIC_API_KEY не задан в окружении");
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

const CHAT_MODEL = process.env.CLAUDE_MODEL_CHAT ?? "claude-sonnet-4-6";

/** Разбирает data URL в media_type + base64-данные. */
function parseDataUrl(
  dataUrl: string,
): { mediaType: string; data: string } | null {
  const match = /^data:(image\/[a-zA-Z+.-]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  return { mediaType: match[1], data: match[2] };
}

const IMAGE_MEDIA_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"] as const;
type ImageMediaType = (typeof IMAGE_MEDIA_TYPES)[number];

/**
 * Отправляет историю чата в Claude с системным промптом OnFive
 * и возвращает текст ответа репетитора. Опционально прикрепляет
 * фото задания к последнему сообщению ученика (Vision).
 */
export async function generateReply(
  context: ChatContext,
  messages: ChatMessage[],
  image?: string,
): Promise<string> {
  const apiMessages: Anthropic.MessageParam[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  // Прикрепляем фото к последнему сообщению ученика.
  const parsed = image ? parseDataUrl(image) : null;
  const last = apiMessages[apiMessages.length - 1];
  if (parsed && last && last.role === "user") {
    const mediaType = (IMAGE_MEDIA_TYPES as readonly string[]).includes(parsed.mediaType)
      ? (parsed.mediaType as ImageMediaType)
      : "image/png";
    last.content = [
      { type: "image", source: { type: "base64", media_type: mediaType, data: parsed.data } },
      { type: "text", text: typeof last.content === "string" ? last.content : "Помоги разобраться с этим заданием." },
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
