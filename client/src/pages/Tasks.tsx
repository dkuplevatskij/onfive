import { motion, type Variants } from "framer-motion";
import { Gift, Check } from "lucide-react";
import { useUserStore } from "../stores/user";
import { DAILY_MISSIONS, WEEKLY_MISSIONS, type MissionDef } from "../data/missions";

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const rise: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
};

const todayStr = () => new Date().toISOString().slice(0, 10);

export function Tasks() {
  const { daily, streak, dailyBonusDate, claimDailyBonus } = useUserStore();
  const bonusAvailable = dailyBonusDate !== todayStr();

  const progressOf = (m: MissionDef): number => {
    switch (m.id) {
      case "ask5":
        return daily.messages;
      case "correct5":
        return daily.correct;
      case "lesson1":
        return daily.lessons;
      case "streak7":
        return streak;
      default:
        return 0;
    }
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.h1 variants={rise} className="font-display text-3xl font-extrabold tracking-tight">
        Награды <span className="aurora-text">ждут</span>
      </motion.h1>
      <motion.p variants={rise} className="mb-6 mt-2 text-ink-soft">
        Выполняй миссии — получай XP и монеты.
      </motion.p>

      {/* Ежедневный бонус */}
      <motion.button
        variants={rise}
        disabled={!bonusAvailable}
        onClick={() => claimDailyBonus()}
        className={`press mb-6 flex w-full items-center justify-between rounded-[var(--radius-card)] p-5 text-left ${
          bonusAvailable ? "hero-night text-white shadow-glow" : "bg-surface text-ink-faint shadow-soft"
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`grid h-12 w-12 place-items-center rounded-2xl ${bonusAvailable ? "bg-white/15" : "bg-bg"}`}>
            {bonusAvailable ? <Gift size={24} /> : <Check size={24} className="text-teal" />}
          </div>
          <div>
            <div className="font-bold tracking-tight">Ежедневный бонус</div>
            <div className={`text-sm ${bonusAvailable ? "text-white/70" : "text-ink-faint"}`}>
              {bonusAvailable ? "+100 XP · +5 монет за вход" : "Получено сегодня"}
            </div>
          </div>
        </div>
        {bonusAvailable && <span className="font-display text-sm font-bold">Забрать</span>}
      </motion.button>

      <Section title="Ежедневные" missions={DAILY_MISSIONS} progressOf={progressOf} />
      <div className="h-5" />
      <Section title="Недельные" missions={WEEKLY_MISSIONS} progressOf={progressOf} />
    </motion.div>
  );
}

function Section({
  title,
  missions,
  progressOf,
}: {
  title: string;
  missions: MissionDef[];
  progressOf: (m: MissionDef) => number;
}) {
  return (
    <div>
      <motion.h2 variants={rise} className="mb-3 text-sm font-bold uppercase tracking-wide text-ink-faint">
        {title}
      </motion.h2>
      <div className="grid gap-3">
        {missions.map((m) => {
          const cur = Math.min(progressOf(m), m.target);
          const pct = Math.round((cur / m.target) * 100);
          const done = cur >= m.target;
          return (
            <motion.div
              key={m.id}
              variants={rise}
              className="rounded-[var(--radius-card)] bg-surface p-5 shadow-soft"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-bold tracking-tight">{m.title}</div>
                  <div className="text-sm text-ink-soft">{m.description}</div>
                </div>
                <div className="shrink-0 rounded-full bg-bg px-2.5 py-1 text-xs font-bold text-violet">
                  +{m.xp} XP
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg">
                  <div
                    className={`h-full rounded-full ${done ? "bg-teal" : "aurora"}`}
                    style={{ width: `${Math.max(pct, 3)}%` }}
                  />
                </div>
                <span className="text-xs font-semibold tabular-nums text-ink-faint">
                  {cur}/{m.target}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
