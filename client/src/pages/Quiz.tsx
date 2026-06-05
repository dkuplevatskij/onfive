import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { Sparkles, Check, TrendingUp } from "lucide-react";
import { GRADES } from "@onfive/shared";
import type { Grade } from "@onfive/shared";
import { useUserStore } from "../stores/user";
import { Button } from "../components/ui/Button";
import { Spark } from "../components/ui/Spark";

/* ─── Конфигурация шагов-вопросов ─────────────────────────────── */
interface ChoiceStep {
  kind: "choice";
  eyebrow: string;
  title: string;
  subtitle: string;
  multi: boolean;
  options: { id: string; label: string; emoji: string }[];
}

const PAINS: ChoiceStep = {
  kind: "choice",
  eyebrow: "Шаг 2 из 4",
  title: "Что мешает учёбе сейчас?",
  subtitle: "Выбери всё, что подходит",
  multi: true,
  options: [
    { id: "explain", label: "Сложно объяснять темы самому", emoji: "😮‍💨" },
    { id: "homework", label: "Домашка отнимает всё время", emoji: "⏳" },
    { id: "grades", label: "Оценки хуже, пропал интерес", emoji: "📉" },
    { id: "tutors", label: "Репетиторы — слишком дорого", emoji: "💸" },
  ],
};

const GOALS: ChoiceStep = {
  kind: "choice",
  eyebrow: "Шаг 3 из 4",
  title: "Какой результат нужен?",
  subtitle: "Сфокусируемся на этом",
  multi: true,
  options: [
    { id: "time", label: "Освободить время на себя", emoji: "🕊️" },
    { id: "logic", label: "Развить логику и самостоятельность", emoji: "🧠" },
    { id: "marks", label: "Подтянуть оценки", emoji: "🎯" },
    { id: "exams", label: "Не бояться контрольных и ОГЭ/ЕГЭ", emoji: "🛡️" },
  ],
};

const SPARK: ChoiceStep = {
  kind: "choice",
  eyebrow: "Шаг 4 из 4",
  title: "Что тебя зажигает?",
  subtitle: "Выбери свою цель",
  multi: false,
  options: [
    { id: "fast", label: "Щёлкать домашку быстро", emoji: "⚡" },
    { id: "top", label: "Стать топ-1 в классе", emoji: "🏆" },
    { id: "confident", label: "Уверенно отвечать у доски", emoji: "🙋" },
    { id: "interesting", label: "Чтобы было интересно", emoji: "✨" },
  ],
};

const fade: Variants = {
  hidden: { opacity: 0, x: 24 },
  show: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 260, damping: 26 } },
  exit: { opacity: 0, x: -24, transition: { duration: 0.15 } },
};

/** Конверсионный онбординг-квиз OnFive. */
export function Quiz() {
  const navigate = useNavigate();
  const setGrade = useUserStore((s) => s.setGrade);
  const setGoals = useUserStore((s) => s.setGoals);

  // 0=grade, 1=pains, 2=goals, 3=spark, 4=building, 5=plan
  const [step, setStep] = useState(0);
  const [grade, setLocalGrade] = useState<Grade | null>(null);
  const [pains, setPains] = useState<string[]>([]);
  const [goals, setLocalGoals] = useState<string[]>([]);
  const [spark, setSpark] = useState<string[]>([]);

  const next = () => setStep((s) => s + 1);

  // Экран «строим план» → автопереход
  useEffect(() => {
    if (step === 4) {
      const t = setTimeout(() => setStep(5), 2200);
      return () => clearTimeout(t);
    }
  }, [step]);

  const finish = () => {
    if (grade) setGrade(grade);
    setGoals(goals);
    navigate("/");
  };

  return (
    <div className="flex min-h-[80vh] flex-col">
      {/* Прогресс воронки */}
      {step <= 3 && (
        <div className="mb-6 flex gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= step ? "aurora" : "bg-hairline"
              }`}
            />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {step === 0 && (
          <motion.div key="grade" variants={fade} initial="hidden" animate="show" exit="exit">
            <p className="text-sm font-bold uppercase tracking-wide text-ink-faint">Шаг 1 из 4</p>
            <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">
              В каком ты <span className="text-violet">классе?</span>
            </h1>
            <p className="mb-6 mt-2 text-ink-soft">Подберём программу по ФГОС.</p>
            <div className="grid grid-cols-3 gap-3">
              {GRADES.map((g) => (
                <button
                  key={g}
                  onClick={() => {
                    setLocalGrade(g);
                    next();
                  }}
                  className={`press flex aspect-square flex-col items-center justify-center rounded-[var(--radius-card)] ${
                    g === grade ? "aurora text-white shadow-glow" : "bg-surface shadow-soft"
                  }`}
                >
                  <span className={`font-display text-4xl font-extrabold ${g === grade ? "text-white" : "text-violet"}`}>
                    {g}
                  </span>
                  <span className={`text-xs font-semibold ${g === grade ? "text-white/70" : "text-ink-faint"}`}>
                    класс
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <ChoiceScreen
            key="pains"
            step={PAINS}
            selected={pains}
            setSelected={setPains}
            onNext={next}
          />
        )}
        {step === 2 && (
          <ChoiceScreen
            key="goals"
            step={GOALS}
            selected={goals}
            setSelected={setLocalGoals}
            onNext={next}
          />
        )}
        {step === 3 && (
          <ChoiceScreen
            key="spark"
            step={SPARK}
            selected={spark}
            setSelected={setSpark}
            onNext={next}
          />
        )}

        {step === 4 && (
          <motion.div
            key="building"
            variants={fade}
            initial="hidden"
            animate="show"
            exit="exit"
            className="flex flex-1 flex-col items-center justify-center text-center"
          >
            <Spark size={72} className="spark-pulse" />
            <h2 className="mt-6 font-display text-2xl font-extrabold">Собираем твой план…</h2>
            <p className="mt-2 max-w-xs text-ink-soft">
              Анализируем класс, цели и слабые места.
            </p>
          </motion.div>
        )}

        {step === 5 && (
          <PlanScreen key="plan" grade={grade} onFinish={finish} />
        )}
      </AnimatePresence>
    </div>
  );
}

function ChoiceScreen({
  step,
  selected,
  setSelected,
  onNext,
}: {
  step: ChoiceStep;
  selected: string[];
  setSelected: (v: string[]) => void;
  onNext: () => void;
}) {
  const toggle = (id: string) => {
    if (step.multi) {
      setSelected(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
    } else {
      setSelected([id]);
    }
  };

  return (
    <motion.div variants={fade} initial="hidden" animate="show" exit="exit" className="flex flex-1 flex-col">
      <p className="text-sm font-bold uppercase tracking-wide text-ink-faint">{step.eyebrow}</p>
      <h1 className="mt-1 font-display text-3xl font-extrabold tracking-tight">{step.title}</h1>
      <p className="mb-6 mt-2 text-ink-soft">{step.subtitle}</p>

      <div className="grid gap-3">
        {step.options.map((o) => {
          const on = selected.includes(o.id);
          return (
            <button
              key={o.id}
              onClick={() => toggle(o.id)}
              className={`press flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-colors ${
                on ? "border-violet bg-surface shadow-glow" : "border-transparent bg-surface shadow-soft"
              }`}
            >
              <span className="text-2xl">{o.emoji}</span>
              <span className="flex-1 font-bold tracking-tight">{o.label}</span>
              <span
                className={`grid h-6 w-6 place-items-center rounded-full ${
                  on ? "aurora text-white" : "bg-bg text-transparent"
                }`}
              >
                <Check size={14} strokeWidth={3} />
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-6">
        <Button onClick={onNext} size="lg" className="w-full" disabled={selected.length === 0}>
          Далее
        </Button>
      </div>
    </motion.div>
  );
}

function PlanScreen({ grade, onFinish }: { grade: Grade | null; onFinish: () => void }) {
  const bars = [
    { m: "Сейчас", without: 30, with: 30 },
    { m: "1 мес", without: 33, with: 55 },
    { m: "2 мес", without: 36, with: 78 },
    { m: "3 мес", without: 40, with: 96 },
  ];

  return (
    <motion.div variants={fade} initial="hidden" animate="show" exit="exit" className="flex flex-1 flex-col">
      <div className="mb-2 inline-flex w-fit items-center gap-1.5 rounded-full bg-surface px-3 py-1 text-sm font-bold text-teal shadow-soft">
        <Sparkles size={14} /> План готов
      </div>
      <h1 className="font-display text-3xl font-extrabold leading-tight tracking-tight">
        Прогноз: рост <span className="text-violet">+35%</span> за 3 месяца
      </h1>
      <p className="mt-2 text-ink-soft">
        {grade ? `${grade} класс · ` : ""}Персональный план готов. Начинаем!
      </p>

      {/* График Без / С OnFive */}
      <div className="mt-6 rounded-[var(--radius-card)] bg-surface p-5 shadow-soft">
        <div className="flex h-40 items-end justify-between gap-3">
          {bars.map((b) => (
            <div key={b.m} className="flex flex-1 flex-col items-center gap-2">
              <div className="flex h-32 w-full items-end justify-center gap-1">
                <motion.div
                  className="w-3 rounded-t bg-hairline"
                  initial={{ height: 0 }}
                  animate={{ height: `${b.without}%` }}
                  transition={{ duration: 0.6 }}
                />
                <motion.div
                  className="aurora w-3 rounded-t"
                  initial={{ height: 0 }}
                  animate={{ height: `${b.with}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>
              <span className="text-xs font-semibold text-ink-faint">{b.m}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-center gap-5 text-xs font-semibold">
          <span className="flex items-center gap-1.5 text-ink-faint">
            <span className="h-2.5 w-2.5 rounded-full bg-hairline" /> Без OnFive
          </span>
          <span className="flex items-center gap-1.5 text-ink">
            <span className="aurora h-2.5 w-2.5 rounded-full" /> С OnFive
          </span>
        </div>
      </div>

      {/* Отзыв */}
      <div className="mt-3 flex items-start gap-3 rounded-2xl bg-surface p-4 shadow-soft">
        <div className="aurora grid h-10 w-10 shrink-0 place-items-center rounded-full font-display font-extrabold text-white">
          А
        </div>
        <div>
          <p className="text-sm font-medium">«Сын сам сел за уроки и поднял оценки за месяц 🔥»</p>
          <p className="mt-1 text-xs text-ink-faint">Айгуль М. · родитель</p>
        </div>
      </div>

      <div className="mt-auto pt-6">
        <Button onClick={onFinish} size="lg" className="flex w-full items-center justify-center gap-2">
          <TrendingUp size={18} /> Начать учиться
        </Button>
      </div>
    </motion.div>
  );
}
