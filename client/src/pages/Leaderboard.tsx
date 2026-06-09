import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Users, Sparkles, Flame } from "lucide-react";
import { useUserStore } from "../stores/user";
import { useAuthStore } from "../stores/auth";
import { levelFromXp } from "../lib/level";
import { isSupabaseConfigured } from "../lib/supabase";
import { fetchLeaderboard, type LeaderboardEntry } from "../lib/cloud";
import { Avatar } from "../components/ui/Avatar";

/**
 * Рейтинг. Когда облако подключено и анонимная сессия готова — показываем
 * живую таблицу лидеров (RPC отдаёт только публичные поля). Без облака —
 * честная позиция ученика без выдуманных соперников.
 */
export function Leaderboard() {
  const xp = useUserStore((s) => s.xp);
  const streak = useUserStore((s) => s.streak);
  const nickname = useUserStore((s) => s.nickname);
  const avatar = useUserStore((s) => s.avatar);
  const level = levelFromXp(xp);
  const [scope, setScope] = useState<"global" | "friends">("global");

  const authStatus = useAuthStore((s) => s.status);
  const myId = useAuthStore((s) => s.userId);
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [loading, setLoading] = useState(false);

  const live = isSupabaseConfigured && authStatus === "ready";

  useEffect(() => {
    if (!live || scope !== "global") return;
    let cancelled = false;
    setLoading(true);
    fetchLeaderboard(100)
      .then((rows) => !cancelled && setEntries(rows))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [live, scope]);

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold tracking-tight">
        <span className="text-violet">Рейтинг</span>
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
        <Avatar value={avatar} name={nickname} size={48} className="rounded-2xl" />
        <div className="flex-1">
          <div className="font-bold tracking-tight">{nickname || "Это ты"}</div>
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

      {/* Живой рейтинг */}
      {live && scope === "global" && entries && entries.length > 0 ? (
        <motion.ol
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="mt-4 space-y-2"
        >
          {entries.map((e, i) => {
            const isMe = e.id === myId;
            return (
              <li
                key={e.id}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 shadow-soft ${
                  isMe ? "bg-chip text-[var(--color-on-chip)] ring-2 ring-violet" : "bg-surface"
                }`}
              >
                <div className="w-6 text-center font-display font-extrabold tabular-nums text-ink-faint">
                  {i + 1}
                </div>
                <Avatar value={e.avatar} name={e.nickname} size={36} className="rounded-xl" />
                <div className="flex-1 truncate">
                  <div className="truncate font-bold tracking-tight">
                    {e.nickname || "Ученик"} {isMe && <span className="text-violet">· ты</span>}
                  </div>
                  {e.grade !== null && (
                    <div className="text-xs text-ink-faint">{e.grade}-й класс</div>
                  )}
                </div>
                <div className="flex items-center gap-1 font-bold tabular-nums">
                  <Sparkles size={13} className="text-violet" />
                  {e.xp.toLocaleString("ru-RU")}
                </div>
              </li>
            );
          })}
        </motion.ol>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="mt-4 rounded-[var(--radius-card)] bg-surface p-8 text-center shadow-soft"
        >
          <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-chip text-[var(--color-on-chip)]">
            {scope === "global" ? <Trophy size={26} /> : <Users size={26} />}
          </div>
          {scope === "friends" ? (
            <>
              <p className="font-bold tracking-tight">Пока никого нет</p>
              <p className="mx-auto mt-1.5 max-w-xs text-sm text-ink-soft">
                Добавляй друзей, чтобы соревноваться вместе 🤝
              </p>
            </>
          ) : loading ? (
            <>
              <p className="font-bold tracking-tight">Загружаем рейтинг…</p>
              <p className="mx-auto mt-1.5 max-w-xs text-sm text-ink-soft">Секунду 🚀</p>
            </>
          ) : live ? (
            <>
              <p className="font-bold tracking-tight">Ты первый!</p>
              <p className="mx-auto mt-1.5 max-w-xs text-sm text-ink-soft">
                В рейтинге пока нет других учеников. Копи XP — и удержи лидерство.
              </p>
            </>
          ) : (
            <>
              <p className="font-bold tracking-tight">Живой рейтинг скоро</p>
              <p className="mx-auto mt-1.5 max-w-xs text-sm text-ink-soft">
                Как только подключим аккаунты, здесь появится таблица лидеров
                среди учеников. Копи XP — твоё место уже считается.
              </p>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}
