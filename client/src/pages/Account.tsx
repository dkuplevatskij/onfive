import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Mail, Check, Loader2, ShieldCheck, LogOut } from "lucide-react";
import { useAuthStore } from "../stores/auth";
import { isSupabaseConfigured } from "../lib/supabase";
import { startEmail, verifyEmail, isValidEmail, signOut, type EmailMode } from "../lib/authEmail";

const fieldClass =
  "w-full rounded-2xl bg-bg px-4 py-3 text-ink outline-none ring-1 ring-transparent transition focus:ring-violet placeholder:text-ink-faint";

/** Экран аккаунта: апгрейд анонимной сессии / вход по e-mail. */
export function Account() {
  const navigate = useNavigate();
  const isAnonymous = useAuthStore((s) => s.isAnonymous);
  const email = useAuthStore((s) => s.email);
  const status = useAuthStore((s) => s.status);

  const [mode, setMode] = useState<EmailMode>("link");
  const [step, setStep] = useState<"email" | "code" | "done">("email");
  const [emailInput, setEmailInput] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const back = (
    <button
      onClick={() => navigate("/profile")}
      className="press mb-4 flex items-center gap-1 text-sm font-bold text-ink-soft"
    >
      <ChevronLeft size={18} /> Профиль
    </button>
  );

  // Облако не подключено.
  if (!isSupabaseConfigured) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {back}
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Аккаунт</h1>
        <p className="mt-3 text-sm text-ink-soft">
          Облако не подключено — вход по e-mail недоступен. Прогресс хранится только на этом устройстве.
        </p>
      </motion.div>
    );
  }

  // Уже вошёл по e-mail.
  if (!isAnonymous && email) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {back}
        <h1 className="font-display text-2xl font-extrabold tracking-tight">Аккаунт</h1>
        <div className="mt-5 flex items-center gap-3 rounded-[var(--radius-card)] bg-surface p-5 shadow-soft">
          <div className="aurora grid h-11 w-11 place-items-center rounded-xl text-white">
            <ShieldCheck size={20} />
          </div>
          <div className="flex-1">
            <div className="font-bold tracking-tight">Прогресс сохранён</div>
            <div className="text-sm text-ink-soft">{email}</div>
          </div>
        </div>
        <p className="mt-3 text-sm text-ink-soft">
          Войди по этому e-mail на другом устройстве — прогресс подтянется автоматически.
        </p>
        <button
          onClick={async () => {
            await signOut();
            navigate("/");
          }}
          className="press mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-surface py-3.5 font-bold text-ink-soft shadow-soft"
        >
          <LogOut size={18} /> Выйти
        </button>
      </motion.div>
    );
  }

  const send = async () => {
    setError(null);
    if (!isValidEmail(emailInput)) {
      setError("Введи корректный e-mail.");
      return;
    }
    setBusy(true);
    try {
      await startEmail(emailInput, mode);
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось отправить код.");
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    setError(null);
    if (code.trim().length < 6) {
      setError("Код из письма — 6 цифр.");
      return;
    }
    setBusy(true);
    try {
      await verifyEmail(emailInput, code, mode);
      setStep("done");
      setTimeout(() => navigate("/profile"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Неверный код.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      {back}
      <h1 className="font-display text-2xl font-extrabold tracking-tight">
        {mode === "link" ? "Сохранить прогресс" : "Вход по e-mail"}
      </h1>
      <p className="mt-1 text-sm text-ink-soft">
        {mode === "link"
          ? "Привяжи e-mail, чтобы не потерять прогресс и заходить с любого устройства."
          : "Войди в существующий аккаунт — подтянем твой прогресс."}
      </p>

      {step === "done" ? (
        <div className="mt-6 flex items-center gap-3 rounded-[var(--radius-card)] bg-surface p-5 shadow-soft">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
            <Check size={20} />
          </div>
          <div className="font-bold tracking-tight">Готово! Прогресс привязан к {emailInput}</div>
        </div>
      ) : step === "email" ? (
        <div className="mt-6 space-y-4">
          <div className="relative">
            <Mail size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              className={`${fieldClass} pl-10`}
              type="email"
              inputMode="email"
              autoComplete="email"
              value={emailInput}
              placeholder="you@example.com"
              onChange={(e) => setEmailInput(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-coral">{error}</p>}
          <button
            onClick={send}
            disabled={busy || status !== "ready"}
            className="aurora press flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-bold text-white shadow-glow disabled:opacity-50"
          >
            {busy ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
            Получить код
          </button>
          <button
            onClick={() => {
              setMode(mode === "link" ? "signin" : "link");
              setError(null);
            }}
            className="press w-full text-center text-sm font-semibold text-violet"
          >
            {mode === "link" ? "Уже есть аккаунт? Войти" : "← Назад к сохранению прогресса"}
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <p className="text-sm text-ink-soft">
            Код отправлен на <span className="font-semibold text-ink">{emailInput}</span>. Введи 6 цифр из письма.
          </p>
          <input
            className={`${fieldClass} text-center text-2xl font-bold tracking-[0.3em]`}
            inputMode="numeric"
            maxLength={6}
            value={code}
            placeholder="000000"
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          />
          {error && <p className="text-sm text-coral">{error}</p>}
          <button
            onClick={confirm}
            disabled={busy}
            className="aurora press flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-bold text-white shadow-glow disabled:opacity-50"
          >
            {busy ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
            Подтвердить
          </button>
          <button
            onClick={() => {
              setStep("email");
              setCode("");
              setError(null);
            }}
            className="press w-full text-center text-sm font-semibold text-ink-soft"
          >
            Изменить e-mail
          </button>
        </div>
      )}
    </motion.div>
  );
}
