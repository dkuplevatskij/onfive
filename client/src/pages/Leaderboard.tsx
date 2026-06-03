import { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Users, Sparkles, Flame } from "lucide-react";
import { useUserStore } from "../stores/user";
import { levelFromXp } from "../lib/level";

/**
 * Рейтинг. Живая таблица лидеров появится после подключения бэкенда
 * (аккаунты + сообщество). До этого показываем честную позицию ученика
 * без выдуманных соперников.
 */
export function Leaderboard() {
  const xp = useUserStore((s) => s.xp);
  const streak = useUserStore((s) => s.streak);
  const level = levelFromXp(xp);
  const [scope, setScope] = useState<"global" | "friends">("global");

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold tracking-tight">
        <span className="aurora-text">Рейтинг</span>
      </h1>

      <div className="mb-5 mt-4 flex gap-2 rounded-2xl bg-surface p-1 shadow-soft">
        {(["global", "friends"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setScope(s)}
            className={`press flex-1 rounded-xl py-2 text-sm font-bold ${
              scope === s ? "aurora text-white" : "text-ink-soft"
            }`}
          >
            {s === "global" ? "Глобальный" : "Друзья"}
          </button>
        ))}
      </div>

      {/* Карточка собственной позиции */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="aurora flex items-center gap-4 rounded-[var(--radius-card)] p-5 text-white shadow-glow"
      >
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15 backdrop-blur">
          <Trophy size={22} />
        </div>
        <div className="flex-1">
          <div className="font-bold tracking-tight">Это ты</div>
          <div className="text-sm text-white/80">{level.title}</div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-1 font-bold tabular-nums">
            <Sparkles size={14} /> {xp.toLocaleString("ru-RU")} XP
          </div>
          <div className="flex items-center gap-1 text-sm text-white/80 tabular-nums">
            <Flame size={13} className="text-amber" /> {streak} дн.
          </div>
        </div>
      </motion.div>

      {/* Честное пустое состояние */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="mt-4 rounded-[var(--radius-card)] bg-surface p-8 text-center shadow-soft"
      >
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-chip text-[var(--color-on-chip)]">
          {scope === "global" ? <Trophy size={26} /> : <Users size={26} />}
        </div>
        {scope === "global" ? (
          <>
            <p className="font-bold tracking-tight">Живой рейтинг скоро</p>
            <p className="mx-auto mt-1.5 max-w-xs text-sm text-ink-soft">
              Как только подключим аккаунты, здесь появится таблица лидеров
              среди учеников. Копи XP — твоё место уже считается.
            </p>
          </>
        ) : (
          <>
            <p className="font-bold tracking-tight">Пока никого нет</p>
            <p className="mx-auto mt-1.5 max-w-xs text-sm text-ink-soft">
              Добавляй друзей, чтобы соревноваться вместе. Появится после
              запуска аккаунтов 🤝
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
