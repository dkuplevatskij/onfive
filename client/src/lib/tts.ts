/**
 * Клиент озвучки: запрашивает синтез речи у /api/tts (ElevenLabs).
 * Возвращает data-URL аудио или null, если серверная озвучка недоступна
 * (тогда вызывающий код откатывается на системный голос браузера).
 *
 * Доступность кэшируется на сессию: если сервер ответил 503 (не настроено),
 * больше не дёргаем эндпоинт впустую.
 */

let serverTtsAvailable: boolean | null = null;

export async function synthesizeSpeech(text: string): Promise<string | null> {
  if (serverTtsAvailable === false) return null;

  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (res.status === 503) {
      serverTtsAvailable = false; // не настроено — больше не пробуем
      return null;
    }
    if (!res.ok) return null;

    const data = (await res.json()) as { audio?: string; mime?: string };
    if (!data.audio) return null;

    serverTtsAvailable = true;
    return `data:${data.mime ?? "audio/mpeg"};base64,${data.audio}`;
  } catch {
    return null;
  }
}
