import { Navigate, useNavigate } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { Flame, Sparkles, Coins, GraduationCap, Lock, ShieldCheck, ChevronRight } from "lucide-react";
import { useUserStore } from "../stores/user";
import { levelFromXp } from "../lib/level";
import { ACHIEVEMENTS } from "../data/achievements";
import { useReportsStore } from "../stores/reports";

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const rise: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
};

export function Profile() {
  const navigate = useNavigate();
  const { grade, xp, coins, streak } = useUserStore();
  const reportsCount = useReportsStore((s) => s.reports.length);

  if (grade === null) return <Navigate to="/" replace />;

  const level = levelFromXp(xp);
  const stats = { xp, coins, streak, reports: reportsCount };

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

      <motion.button
        variants={rise}
        onClick={() => navigate("/parent")}
        className="press mt-7 flex w-full items-center gap-3 rounded-[var(--radius-card)] bg-surface p-5 text-left shadow-soft hover:shadow-glow"
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
