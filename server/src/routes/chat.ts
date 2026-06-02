import type { FastifyInstance } from "fastify";
import type { ChatRequest, ChatResponse } from "@onfive/shared";
import { generateReply } from "../services/claude.js";

/** Простейшая валидация тела запроса. */
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

export async function chatRoutes(app: FastifyInstance): Promise<void> {
  app.post("/api/chat", async (request, reply) => {
    if (!isValidChatRequest(request.body)) {
      return reply.status(400).send({ error: "Неверный формат запроса" });
    }

    const { context, messages } = request.body;

    try {
      const text = await generateReply(context, messages);
      const result: ChatResponse = { reply: text };
      return reply.send(result);
    } catch (err) {
      request.log.error(err);
      return reply.status(502).send({ error: "Ошибка обращения к Claude API" });
    }
  });
}
