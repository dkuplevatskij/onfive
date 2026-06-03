import type { ChatContext, ChatMessage, ChatResponse } from "@onfive/shared";

/** Отправляет историю чата на бэкенд и возвращает ответ репетитора. */
export async function sendChat(
  context: ChatContext,
  messages: ChatMessage[],
  image?: string,
): Promise<string> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ context, messages, image }),
  });

  if (!res.ok) {
    throw new Error(`Ошибка сервера: ${res.status}`);
  }

  const data = (await res.json()) as ChatResponse;
  return data.reply;
}
