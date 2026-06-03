import { useNavigate } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { Brain, Target, Flame, BookOpen, GraduationCap, Sparkles, ChevronRight } from "lucide-react";
import { useUserStore } from "../stores/user";
import { levelFromXp } from "../lib/level";
import { Button } from "../components/ui/Button";
import { Spark } from "../components/ui/Spark";
import { CountUp } from "../components/ui/CountUp";

/** Контейнер со stagger-появлением дочерних элементов. */
const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } },
};

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
  const features = [
    { Icon: Brain, t: "Сократический метод", d: "Ведёт к ответу, а не диктует его" },
    { Icon: Target, t: "Под твой класс", d: "5–11 класс, программа ФГОС" },
    { Icon: Flame, t: "Стрики и уровни", d: "Превращаем учёбу в привычку" },
  ];
  return (
    <motion.div
      variants={stagger}
      initial="hidden"
      animate="show"
      className="flex min-h-[78vh] flex-col"
    >
      <motion.div
        variants={rise}
        className="hero-night relative overflow-hidden rounded-[2rem] p-7 pt-12 text-white shadow-glow"
      >
        <div className="mb-6 flex justify-center">
          <Spark size={76} className="spark-pulse" />
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
      </motion.div>

      <div className="mt-5 grid gap-3">
        {features.map((f) => (
          <motion.div
            key={f.t}
            variants={rise}
            className="flex items-center gap-4 rounded-2xl bg-surface p-4 shadow-soft"
          >
            <div className="aurora grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white">
              <f.Icon size={20} />
            </div>
            <div>
              <div className="font-bold tracking-tight">{f.t}</div>
              <div className="text-sm text-ink-soft">{f.d}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div variants={rise} className="mt-6">
        <Button onClick={onStart} size="lg" className="w-full">
          Начать бесплатно
        </Button>
      </motion.div>
    </motion.div>
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
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.div
        variants={rise}
        className="hero-night relative overflow-hidden rounded-[2rem] p-6 text-white shadow-glow"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-white/60">С возвращением 👋</p>
            <h1 className="mt-1 font-display text-2xl font-extrabold">{level.title}</h1>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-sm font-bold backdrop-blur">
            <Flame size={15} className="text-amber" /> <span className="tabular-nums">1</span>
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
            <motion.div
              className="aurora h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.max(pct, 4)}%` }}
              transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
            />
          </div>
        </div>
      </motion.div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <motion.button
          variants={rise}
          onClick={() => navigate("/subjects")}
          className="press col-span-2 flex items-center justify-between rounded-[var(--radius-card)] bg-surface p-5 text-left shadow-soft hover:shadow-glow"
        >
          <div className="flex items-center gap-4">
            <div className="aurora grid h-12 w-12 place-items-center rounded-2xl text-white shadow-glow">
              <BookOpen size={22} />
            </div>
            <div>
              <div className="font-bold tracking-tight">Начать занятие</div>
              <div className="text-sm text-ink-soft">{grade} класс · выбери предмет</div>
            </div>
          </div>
          <ChevronRight className="text-ink-faint" />
        </motion.button>

        <motion.button
          variants={rise}
          onClick={() => navigate("/onboarding")}
          className="press flex flex-col items-start gap-2 rounded-[var(--radius-card)] bg-surface p-5 text-left shadow-soft hover:shadow-glow"
        >
          <GraduationCap className="text-blue" />
          <span className="font-bold tracking-tight">Класс</span>
          <span className="text-sm text-ink-soft">{grade}-й</span>
        </motion.button>

        <motion.div
          variants={rise}
          className="flex flex-col items-start gap-2 rounded-[var(--radius-card)] bg-surface p-5 shadow-soft"
        >
          <Sparkles className="text-violet" />
          <span className="font-bold tracking-tight">Опыт</span>
          <span className="text-sm text-ink-soft">
            <CountUp value={xp} /> XP всего
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
}
