/**
 * Vercel Serverless Function: POST /api/tts
 *
 * Озвучка ответов AI-репетитора через ElevenLabs. Принимает чистый текст,
 * возвращает MP3 в base64. Если ключ или voice id не заданы в окружении —
 * отвечает 503, и клиент мягко откатывается на системный голос браузера.
 *
 * Голос выбирается/клонируется в кабинете ElevenLabs; здесь он задаётся
 * переменной ELEVENLABS_VOICE_ID — менять голос можно без правок кода.
 */

const TTS_MODEL = process.env.ELEVENLABS_MODEL ?? "eleven_multilingual_v2";
/** Ограничение на длину текста — защита от больших счетов за символы. */
const MAX_CHARS = 1500;

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

  const text = (body as { text?: unknown } | null)?.text;
  if (typeof text !== "string" || !text.trim()) {
    res.status(400).json({ error: "Пустой текст" });
    return;
  }

  const apiKey = process.env.ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID;
  if (!apiKey || !voiceId) {
    // Не настроено — клиент озвучит системным голосом.
    res.status(503).json({ error: "Озвучка ElevenLabs не настроена" });
    return;
  }

  try {
    const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "content-type": "application/json",
        accept: "audio/mpeg",
      },
      body: JSON.stringify({ text: text.slice(0, MAX_CHARS), model_id: TTS_MODEL }),
    });

    if (!r.ok) {
      const detail = await r.text().catch(() => "");
      res.status(502).json({ error: `ElevenLabs ${r.status}: ${detail.slice(0, 200)}` });
      return;
    }

    const audio = Buffer.from(await r.arrayBuffer()).toString("base64");
    res.status(200).json({ audio, mime: "audio/mpeg" });
  } catch (err) {
    const detail = err instanceof Error ? err.message : "неизвестная ошибка";
    res.status(502).json({ error: `Ошибка обращения к ElevenLabs: ${detail}` });
  }
}
