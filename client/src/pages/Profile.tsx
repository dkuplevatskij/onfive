import { Navigate, useNavigate } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { Flame, Sparkles, Coins, GraduationCap, Lock, ShieldCheck, ChevronRight, Pencil, Send, AtSign, Mail, CircleCheck } from "lucide-react";
import { useUserStore } from "../stores/user";
import { useAuthStore } from "../stores/auth";
import { levelFromXp } from "../lib/level";
import { ACHIEVEMENTS } from "../data/achievements";
import { useReportsStore } from "../stores/reports";
import { isSupabaseConfigured } from "../lib/supabase";
import { Avatar } from "../components/ui/Avatar";

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const rise: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
};

export function Profile() {
  const navigate = useNavigate();
  const { grade, xp, coins, streak, nickname, firstName, lastName, telegram, vk, avatar } =
    useUserStore();
  const reportsCount = useReportsStore((s) => s.reports.length);
  const isAnonymous = useAuthStore((s) => s.isAnonymous);
  const email = useAuthStore((s) => s.email);

  if (grade === null) return <Navigate to="/" replace />;

  const level = levelFromXp(xp);
  const stats = { xp, coins, streak, reports: reportsCount };
  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  const tiles = [
    { Icon: Sparkles, label: "Опыт", value: `${xp} XP`, color: "text-violet" },
    { Icon: Coins, label: "Монеты", value: coins, color: "text-amber" },
    { Icon: Flame, label: "Стрик", value: `${streak} дн.`, color: "text-coral" },
    { Icon: GraduationCap, label: "Класс", value: `${grade}-й`, color: "text-blue" },
  ];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      {/* Шапка профиля */}
      <motion.div
        variants={rise}
        className="hero-night relative overflow-hidden rounded-[2rem] p-6 text-white shadow-glow"
      >
        <div className="flex items-center gap-4">
          <div className="aurora grid h-16 w-16 place-items-center rounded-2xl font-display text-2xl font-extrabold shadow-glow">
            {level.index + 1}
          </div>
          <div>
            <h1 className="font-display text-2xl font-extrabold">{level.title}</h1>
            <p className="text-sm text-white/60">
              {level.next === null ? "Максимальный уровень" : `${level.next - xp} XP до уровня ${level.index + 2}`}
            </p>
          </div>
        </div>
        <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-white/15">
          <div className="aurora h-full rounded-full" style={{ width: `${Math.max(Math.round(level.progress * 100), 4)}%` }} />
        </div>
      </motion.div>

      {/* Идентичность профиля */}
      <motion.button
        variants={rise}
        onClick={() => navigate("/profile/edit")}
        className="press mt-4 flex w-full items-center gap-4 rounded-[var(--radius-card)] bg-surface p-4 text-left shadow-soft hover:shadow-glow"
      >
        <Avatar value={avatar} name={nickname} size={56} className="rounded-2xl" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-bold tracking-tight">
            {nickname || "Добавь ник"}
          </div>
          <div className="truncate text-sm text-ink-soft">
            {fullName || "Имя и фамилия не указаны"}
          </div>
          {(telegram || vk) && (
            <div className="mt-1 flex items-center gap-3 text-xs text-ink-faint">
              {telegram && (
                <span className="flex items-center gap-1">
                  <Send size={12} /> {telegram}
                </span>
              )}
              {vk && (
                <span className="flex items-center gap-1">
                  <AtSign size={12} /> VK
                </span>
              )}
            </div>
          )}
        </div>
        <Pencil size={18} className="shrink-0 text-ink-faint" />
      </motion.button>

      {/* Статистика */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {tiles.map((t) => (
          <motion.div
            key={t.label}
            variants={rise}
            className="flex flex-col items-start gap-2 rounded-[var(--radius-card)] bg-surface p-5 shadow-soft"
          >
            <t.Icon className={t.color} />
            <span className="text-sm text-ink-soft">{t.label}</span>
            <span className="font-display text-xl font-extrabold tabular-nums">{t.value}</span>
          </motion.div>
        ))}
      </div>

      {/* Достижения */}
      <motion.h2 variants={rise} className="mb-3 mt-7 text-sm font-bold uppercase tracking-wide text-ink-faint">
        Достижения
      </motion.h2>
      <motion.div variants={rise} className="grid grid-cols-3 gap-3">
        {ACHIEVEMENTS.map((a) => {
          const got = a.unlocked(stats);
          return (
            <div
              key={a.id}
              className={`flex flex-col items-center gap-1.5 rounded-2xl p-3 text-center shadow-soft ${
                got ? "bg-surface" : "bg-surface opacity-50"
              }`}
            >
              <div className={`grid h-12 w-12 place-items-center rounded-2xl ${got ? "aurora text-white" : "bg-bg text-ink-faint"}`}>
                {got ? <a.Icon size={22} /> : <Lock size={20} />}
              </div>
              <span className="text-xs font-bold leading-tight">{a.title}</span>
              <span className="text-[10px] leading-tight text-ink-faint">{a.description}</span>
            </div>
          );
        })}
      </motion.div>

      {isSupabaseConfigured && (
        <motion.button
          variants={rise}
          onClick={() => navigate("/account")}
          className="press mt-7 flex w-full items-center gap-3 rounded-[var(--radius-card)] bg-surface p-5 text-left shadow-soft hover:shadow-glow"
        >
          <div className={`grid h-11 w-11 place-items-center rounded-xl text-white ${isAnonymous ? "bg-amber" : "aurora"}`}>
            {isAnonymous ? <Mail size={20} /> : <CircleCheck size={20} />}
          </div>
          <div className="flex-1">
            <div className="font-bold tracking-tight">
              {isAnonymous ? "Сохрани прогресс" : "Аккаунт"}
            </div>
            <div className="text-sm text-ink-soft">
              {isAnonymous ? "Привяжи e-mail — вход с любого устройства" : (email ?? "Вход выполнен")}
            </div>
          </div>
          <ChevronRight className="text-ink-faint" />
        </motion.button>
      )}

      <motion.button
        variants={rise}
        onClick={() => navigate("/parent")}
        className="press mt-3 flex w-full items-center gap-3 rounded-[var(--radius-card)] bg-surface p-5 text-left shadow-soft hover:shadow-glow"
      >
        <div className="aurora grid h-11 w-11 place-items-center rounded-xl text-white">
          <ShieldCheck size={20} />
        </div>
        <div className="flex-1">
          <div className="font-bold tracking-tight">Родителям</div>
          <div className="text-sm text-ink-soft">Прогресс и аналитика · PIN</div>
        </div>
        <ChevronRight className="text-ink-faint" />
      </motion.button>

      <motion.button
        variants={rise}
        onClick={() => navigate("/onboarding")}
        className="press mt-3 w-full rounded-2xl bg-surface py-3.5 font-bold text-ink-soft shadow-soft"
      >
        Сменить класс
      </motion.button>
    </motion.div>
  );
}
