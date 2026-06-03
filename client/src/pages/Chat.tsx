import { useState, useRef, useEffect } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { XP } from "@onfive/shared";
import type { ChatContext, ChatMessage, LearningMode, SubjectId } from "@onfive/shared";
import { useUserStore } from "../stores/user";
import { sendChat } from "../lib/api";
import { Button } from "../components/ui/Button";

/** Экран чата с AI-репетитором. */
export function Chat() {
  const [params] = useSearchParams();
  const grade = useUserStore((s) => s.grade);
  const addXp = useUserStore((s) => s.addXp);

  const subject = params.get("subject") as SubjectId | null;
  const mode = params.get("mode") as LearningMode | null;
  const topic = params.get("topic") ?? "Свободная тема";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  if (grade === null || !subject || !mode) {
    return <Navigate to="/" replace />;
  }

  const context: ChatContext = { grade, subject, topic, mode };

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const next = [...messages, { role: "user", content: text } as ChatMessage];
    setMessages(next);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const reply = await sendChat(context, next);
      setMessages([...next, { role: "assistant", content: reply }]);
      addXp(XP.perMessage);
    } catch {
      setError("Не удалось получить ответ. Проверь, что сервер запущен.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-9rem)] flex-col">
      <div className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-surface px-3 py-1.5 text-sm shadow-soft">
        <span className="text-ink-faint">Тема:</span>
        <span className="font-semibold text-ink">{topic}</span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pb-4">
        {messages.length === 0 && (
          <p className="text-ink-faint">
            Напиши, с чем нужна помощь — и начнём разбираться вместе. 👇
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <div
              className={`max-w-[82%] whitespace-pre-wrap rounded-3xl px-4 py-3 ${
                m.role === "user"
                  ? "aurora rounded-br-lg text-white shadow-glow"
                  : "rounded-bl-lg bg-surface text-ink shadow-soft"
              }`}
            >
              {m.content}
            </div>
          </div>
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

      <div className="flex items-end gap-2 pt-3">
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
          placeholder="Твой вопрос…"
          className="flex-1 resize-none rounded-2xl border border-hairline bg-surface px-4 py-3 shadow-soft outline-none transition focus:border-violet"
        />
        <Button onClick={() => void send()} disabled={loading} className="px-4 py-3">
          ➤
        </Button>
      </div>
    </div>
  );
}
