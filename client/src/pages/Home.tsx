import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/user";
import { levelFromXp } from "../lib/level";
import { Button } from "../components/ui/Button";
import { Spark } from "../components/ui/Spark";

/**
 * Главный экран OnFive «Искра».
 * Новому пользователю — иммерсивное приветствие.
 * Вернувшемуся — bento-дашборд с тёмной hero-картой.
 */
export function Home() {
  const navigate = useNavigate();
  const grade = useUserStore((s) => s.grade);
  const xp = useUserStore((s) => s.xp);

  if (grade === null) {
    return <Welcome onStart={() => navigate("/onboarding")} />;
  }
  return <Dashboard grade={grade} xp={xp} navigate={navigate} />;
}

function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <div className="flex min-h-[78vh] flex-col">
      {/* Иммерсивный hero */}
      <div className="hero-night relative overflow-hidden rounded-[2rem] p-7 pt-12 text-white shadow-glow">
        <div className="mb-6 flex justify-center">
          <Spark size={76} className="drop-shadow-[0_8px_24px_rgba(124,92,255,0.6)]" />
        </div>
        <h1 className="text-center font-display text-4xl font-extrabold leading-tight">
          Учись
          <br />
          <span className="aurora-text">на пятёрку</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xs text-center text-white/70">
          AI-репетитор, который не сливает ответы, а высекает искру понимания —
          вопросами и подсказками.
        </p>
      </div>

      {/* Три обещания */}
      <div className="mt-5 grid gap-3">
        {[
          { icon: "🧠", t: "Сократический метод", d: "Ведёт к ответу, а не диктует его" },
          { icon: "🎯", t: "Под твой класс", d: "5–11 класс, программа ФГОС" },
          { icon: "🔥", t: "Стрики и уровни", d: "Превращаем учёбу в привычку" },
        ].map((f) => (
          <div
            key={f.t}
            className="flex items-center gap-4 rounded-2xl bg-surface p-4 shadow-soft"
          >
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-bg text-xl">
              {f.icon}
            </div>
            <div>
              <div className="font-bold tracking-tight">{f.t}</div>
              <div className="text-sm text-ink-soft">{f.d}</div>
            </div>
          </div>
        ))}
      </div>

      <Button onClick={onStart} size="lg" className="mt-6 w-full">
        Начать бесплатно
      </Button>
    </div>
  );
}

function Dashboard({
  grade,
  xp,
  navigate,
}: {
  grade: number;
  xp: number;
  navigate: (path: string) => void;
}) {
  const level = levelFromXp(xp);
  const pct = Math.round(level.progress * 100);

  return (
    <div>
      {/* Тёмная hero-карта: уровень + прогресс */}
      <div className="hero-night relative overflow-hidden rounded-[2rem] p-6 text-white shadow-glow">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-white/60">С возвращением 👋</p>
            <h1 className="mt-1 font-display text-2xl font-extrabold">
              {level.title}
            </h1>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-bold backdrop-blur">
            🔥 <span className="tabular-nums">1</span>
          </div>
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-baseline justify-between text-sm">
            <span className="text-white/60">Прогресс уровня</span>
            <span className="font-bold tabular-nums">
              {level.next === null ? `${xp} XP` : `${xp} / ${level.next} XP`}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-white/15">
            <div
              className="aurora h-full rounded-full transition-[width] duration-700"
              style={{ width: `${Math.max(pct, 4)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bento-сетка */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate("/subjects")}
          className="press col-span-2 flex items-center justify-between rounded-[var(--radius-card)] bg-surface p-5 text-left shadow-soft hover:shadow-glow"
        >
          <div className="flex items-center gap-4">
            <div className="aurora grid h-12 w-12 place-items-center rounded-2xl text-xl text-white shadow-glow">
              📚
            </div>
            <div>
              <div className="font-bold tracking-tight">Начать занятие</div>
              <div className="text-sm text-ink-soft">{grade} класс · выбери предмет</div>
            </div>
          </div>
          <span className="text-2xl text-ink-faint">›</span>
        </button>

        <button
          onClick={() => navigate("/onboarding")}
          className="press flex flex-col items-start gap-2 rounded-[var(--radius-card)] bg-surface p-5 text-left shadow-soft hover:shadow-glow"
        >
          <span className="text-2xl">🎒</span>
          <span className="font-bold tracking-tight">Класс</span>
          <span className="text-sm text-ink-soft">{grade}-й</span>
        </button>

        <div className="flex flex-col items-start gap-2 rounded-[var(--radius-card)] bg-surface p-5 shadow-soft">
          <span className="text-2xl">⭐</span>
          <span className="font-bold tracking-tight">Опыт</span>
          <span className="text-sm text-ink-soft tabular-nums">{xp} XP всего</span>
        </div>
      </div>
    </div>
  );
}
