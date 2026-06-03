import { useState } from "react";
import { motion } from "framer-motion";
import { useUserStore } from "../stores/user";
import { levelFromXp } from "../lib/level";
import { MOCK_LEADERBOARD, type LeaderRow } from "../data/leaderboard";

export function Leaderboard() {
  const xp = useUserStore((s) => s.xp);
  const [scope, setScope] = useState<"global" | "friends">("global");

  const me: LeaderRow = { name: "Ты", xp, level: levelFromXp(xp).index + 1 };
  const rows = [...MOCK_LEADERBOARD, me].sort((a, b) => b.xp - a.xp);
  const myRank = rows.findIndex((r) => r === me) + 1;

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

      {scope === "friends" ? (
        <div className="rounded-[var(--radius-card)] bg-surface p-8 text-center shadow-soft">
          <p className="text-ink-soft">Добавь друзей, чтобы соревноваться 🤝</p>
        </div>
      ) : (
        <div className="grid gap-2">
          {rows.slice(0, 20).map((r, i) => {
            const rank = i + 1;
            const isMe = r === me;
            const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
            return (
              <motion.div
                key={`${r.name}-${i}`}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.4) }}
                className={`flex items-center gap-3 rounded-2xl p-3 ${
                  isMe ? "aurora text-white shadow-glow" : "bg-surface shadow-soft"
                }`}
              >
                <div className={`w-7 text-center font-display font-extrabold ${isMe ? "text-white" : "text-ink-faint"}`}>
                  {medal ?? rank}
                </div>
                <div className="flex-1 font-bold tracking-tight">{r.name}</div>
                <div className={`text-sm ${isMe ? "text-white/80" : "text-ink-faint"}`}>
                  ур. {r.level}
                </div>
                <div className="w-20 text-right font-bold tabular-nums">
                  {r.xp.toLocaleString("ru-RU")}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {scope === "global" && (
        <div className="mt-4 rounded-2xl bg-chip p-4 text-center text-sm font-bold text-[var(--color-on-chip)]">
          Твоё место: #{myRank}
        </div>
      )}
    </div>
  );
}
