import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Users, Sparkles, Flame, UserPlus, X, Copy } from "lucide-react";
import { useUserStore } from "../stores/user";
import { useAuthStore } from "../stores/auth";
import { levelFromXp } from "../lib/level";
import { isSupabaseConfigured } from "../lib/supabase";
import { fetchLeaderboard, fetchFriends, type LeaderboardEntry } from "../lib/cloud";
import { Avatar } from "../components/ui/Avatar";

/**
 * Рейтинг. Глобальный — живая таблица лидеров (RPC, публичные поля).
 * «Друзья» — мини-рейтинг из добавленных по коду друзей + ты.
 * Без облака — честная позиция ученика без выдуманных соперников.
 */
export function Leaderboard() {
  const xp = useUserStore((s) => s.xp);
  const streak = useUserStore((s) => s.streak);
  const grade = useUserStore((s) => s.grade);
  const nickname = useUserStore((s) => s.nickname);
  const avatar = useUserStore((s) => s.avatar);
  const familyCode = useUserStore((s) => s.familyCode);
  const friends = useUserStore((s) => s.friends);
  const addFriend = useUserStore((s) => s.addFriend);
  const removeFriend = useUserStore((s) => s.removeFriend);
  const level = levelFromXp(xp);
  const [scope, setScope] = useState<"global" | "friends">("global");
  const [codeInput, setCodeInput] = useState("");

  const authStatus = useAuthStore((s) => s.status);
  const myId = useAuthStore((s) => s.userId);
  const live = isSupabaseConfigured && authStatus === "ready";

  const [global, setGlobal] = useState<LeaderboardEntry[] | null>(null);
  const [friendRows, setFriendRows] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  // Глобальный рейтинг.
  useEffect(() => {
    if (!live || scope !== "global") return;
    let cancelled = false;
    setLoading(true);
    fetchLeaderboard(100)
      .then((rows) => !cancelled && setGlobal(rows))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [live, scope]);

  // Рейтинг друзей.
  const friendsKey = friends.join(",");
  useEffect(() => {
    if (!live || scope !== "friends" || friends.length === 0) {
      setFriendRows([]);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchFriends(friends)
      .then((rows) => !cancelled && setFriendRows(rows))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [live, scope, friendsKey, friends]);

  // Список друзей + ты, отсортированный по XP (ты считаешься из локального XP).
  const friendsList = useMemo<LeaderboardEntry[]>(() => {
    const me: LeaderboardEntry = { id: myId ?? "me", nickname, avatar, xp, streak, grade };
    const rest = friendRows.filter((r) => r.id !== myId);
    return [me, ...rest].sort((a, b) => b.xp - a.xp);
  }, [friendRows, myId, nickname, avatar, xp, streak, grade]);

  const addByCode = () => {
    addFriend(codeInput);
    setCodeInput("");
  };

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

      {/* ДРУЗЬЯ */}
      {scope === "friends" &&
        (live ? (
          <div className="mt-4">
            {/* Добавить друга + свой код */}
            <div className="flex gap-2">
              <input
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && addByCode()}
                placeholder="Код друга · ONF5-XXXXXX"
                className="w-full rounded-2xl bg-surface px-4 py-3 text-sm shadow-soft outline-none ring-1 ring-transparent transition focus:ring-violet placeholder:text-ink-faint"
              />
              <button
                onClick={addByCode}
                aria-label="Добавить друга"
                className="aurora press grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white shadow-glow"
              >
                <UserPlus size={20} />
              </button>
            </div>
            <button
              onClick={() => navigator.clipboard?.writeText(familyCode)}
              className="press mt-2 flex w-full items-center justify-center gap-1.5 text-xs font-semibold text-ink-soft"
            >
              <Copy size={12} /> Твой код: <span className="font-bold text-ink">{familyCode}</span>
            </button>

            {friends.length === 0 ? (
              <div className="mt-4 rounded-[var(--radius-card)] bg-surface p-8 text-center shadow-soft">
                <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-chip text-[var(--color-on-chip)]">
                  <Users size={26} />
                </div>
                <p className="font-bold tracking-tight">Добавь друзей</p>
                <p className="mx-auto mt-1.5 max-w-xs text-sm text-ink-soft">
                  Введи код друга, чтобы соревноваться вместе. Свой код — выше 🤝
                </p>
              </div>
            ) : (
              <ol className="mt-4 space-y-2">
                {friendsList.map((e, i) => {
                  const isMe = e.id === (myId ?? "me");
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
                        {e.grade !== null && <div className="text-xs text-ink-faint">{e.grade}-й класс</div>}
                      </div>
                      <div className="flex items-center gap-1 font-bold tabular-nums">
                        <Sparkles size={13} className="text-violet" />
                        {e.xp.toLocaleString("ru-RU")}
                      </div>
                    </li>
                  );
                })}
                {/* Управление: список добавленных кодов с отвязкой */}
                <li className="pt-1">
                  <div className="flex flex-wrap gap-2">
                    {friends.map((c) => (
                      <span
                        key={c}
                        className="inline-flex items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-xs font-semibold text-ink-soft shadow-soft"
                      >
                        {c}
                        <button onClick={() => removeFriend(c)} aria-label="Убрать друга" className="press text-ink-faint">
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                </li>
              </ol>
            )}
          </div>
        ) : (
          <div className="mt-4 rounded-[var(--radius-card)] bg-surface p-8 text-center shadow-soft">
            <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-chip text-[var(--color-on-chip)]">
              <Users size={26} />
            </div>
            <p className="font-bold tracking-tight">Друзья — после подключения облака</p>
            <p className="mx-auto mt-1.5 max-w-xs text-sm text-ink-soft">
              Добавляй друзей по коду, чтобы соревноваться вместе 🤝
            </p>
          </div>
        ))}

      {/* ГЛОБАЛЬНЫЙ */}
      {scope === "global" &&
        (live && global && global.length > 0 ? (
          <motion.ol
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="mt-4 space-y-2"
          >
            {global.map((e, i) => {
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
                    {e.grade !== null && <div className="text-xs text-ink-faint">{e.grade}-й класс</div>}
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
              <Trophy size={26} />
            </div>
            {loading ? (
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
                  Как только подключим аккаунты, здесь появится таблица лидеров. Копи XP — твоё место уже считается.
                </p>
              </>
            )}
          </motion.div>
        ))}
    </div>
  );
}
