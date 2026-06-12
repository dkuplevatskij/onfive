import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeft, Sparkles, Check, Zap, Users, GraduationCap, FileText, Mic } from "lucide-react";

const FEATURES = [
  { Icon: Zap,           text: "Безлимит сообщений — учись без ограничений" },
  { Icon: GraduationCap, text: "Все предметы 5–11 класса + режимы ОГЭ/ЕГЭ" },
  { Icon: FileText,      text: "Доклады + экспорт .docx и .pdf" },
  { Icon: Mic,           text: "Голосовой ввод" },
  { Icon: Users,         text: "Родительская панель с аналитикой" },
  { Icon: Sparkles,      text: "Рейтинг и геймификация — XP, уровни, серии" },
];

/** Страница оплаты / апгрейда на Premium. */
export function Upgrade() {
  const navigate = useNavigate();

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pb-8">
      <button
        onClick={() => navigate(-1)}
        className="press mb-4 flex items-center gap-1 text-sm font-bold text-ink-soft"
      >
        <ChevronLeft size={18} /> Назад
      </button>

      {/* Hero */}
      <div className="aurora rounded-[var(--radius-card)] p-6 text-white shadow-glow">
        <div className="mb-1 text-sm font-semibold text-white/70">OnFive Premium</div>
        <div className="font-display text-4xl font-extrabold tracking-tight">
          ₽599<span className="text-2xl font-bold text-white/70">/мес</span>
        </div>
        <div className="mt-0.5 text-sm text-white/70">или ₽4 990/год — экономия ₽2 200</div>
        <p className="mt-3 text-sm leading-relaxed text-white/80">
          Учись без ограничений по всем предметам с AI-репетитором.
        </p>
      </div>

      {/* Возможности */}
      <div className="mt-5 rounded-[var(--radius-card)] bg-surface p-5 shadow-soft">
        <div className="mb-4 text-sm font-bold uppercase tracking-wide text-ink-faint">
          Что входит
        </div>
        <ul className="space-y-3">
          {FEATURES.map(({ Icon, text }) => (
            <li key={text} className="flex items-center gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-violet/10 text-violet">
                <Icon size={15} />
              </div>
              <span className="text-sm font-medium">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Free vs Premium */}
      <div className="mt-4 rounded-[var(--radius-card)] bg-surface p-5 shadow-soft">
        <div className="mb-4 text-sm font-bold uppercase tracking-wide text-ink-faint">
          Free vs Premium
        </div>
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
          <div />
          <div className="rounded-xl bg-bg py-1.5 text-ink-soft">Free</div>
          <div className="aurora rounded-xl py-1.5 text-white">Premium</div>
          {[
            ["Сообщений в день", "10", "∞"],
            ["Предметов", "1", "Все"],
            ["Доклады", "—", "✓"],
            ["Экспорт .docx/.pdf", "—", "✓"],
            ["Родит. панель", "—", "✓"],
          ].map(([label, free, prem]) => (
            <>
              <div key={label} className="flex items-center text-left font-medium text-ink-soft">{label}</div>
              <div key={`${label}-f`} className="flex items-center justify-center rounded-xl bg-bg py-2 text-ink-faint">{free}</div>
              <div key={`${label}-p`} className="flex items-center justify-center rounded-xl bg-violet/5 py-2 font-bold text-violet">{prem}</div>
            </>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="mt-6 space-y-3">
        <button
          onClick={() => alert("Оплата через ЮKassa — подключается в следующем обновлении 🚀")}
          className="aurora press flex w-full items-center justify-center gap-2 rounded-2xl py-4 font-bold text-white shadow-glow"
        >
          <Sparkles size={18} /> Подключить Premium — ₽599/мес
        </button>
        <button
          onClick={() => alert("Оплата через ЮKassa — подключается в следующем обновлении 🚀")}
          className="press flex w-full items-center justify-center gap-2 rounded-2xl bg-surface py-4 font-bold shadow-soft"
        >
          <Check size={16} className="text-violet" /> Годовой план — ₽4 990/год
        </button>
      </div>

      <p className="mt-4 text-center text-xs text-ink-faint">
        Оплата через ЮKassa · СБП · Банковская карта
      </p>
    </motion.div>
  );
}
