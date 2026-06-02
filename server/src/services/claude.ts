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

/**
 * Отправляет историю чата в Claude с системным промптом OnFive
 * и возвращает текст ответа репетитора.
 */
export async function generateReply(
  context: ChatContext,
  messages: ChatMessage[],
): Promise<string> {
  const response = await getClient().messages.create({
    model: CHAT_MODEL,
    max_tokens: 1024,
    system: buildSystemPrompt(context),
    messages: messages.map((m) => ({ role: m.role, content: m.content })),
  });

  return response.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("")
    .trim();
}
