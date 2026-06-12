import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Lock,
  ArrowLeft,
  Flame,
  Sparkles,
  Coins,
  BookOpen,
  Lightbulb,
  Copy,
  UserPlus,
  X,
  Loader2,
  FileText,
  GraduationCap,
} from "lucide-react";
import { useUserStore } from "../stores/user";
import { levelFromXp } from "../lib/level";
import { subjectsForGrade } from "../data/subjects";
import { SUBJECT_COLOR } from "../data/subjectColors";
import { SUBJECT_ICON } from "../data/subjectIcons";
import { isSupabaseConfigured } from "../lib/supabase";
import { fetchChildByCode, type ChildProgress } from "../lib/cloud";
import { Avatar } from "../components/ui/Avatar";

/** Родительская панель: PIN-гейт + аналитика по ребёнку. */
export function Parent() {
  const navigate = useNavigate();
  const { parentPin, setParentPin } = useUserStore();
  const [unlocked, setUnlocked] = useState(false);

  if (!unlocked) {
    return (
      <PinGate
        mode={parentPin ? "enter" : "create"}
        expected={parentPin}
        onCreate={(pin) => {
          setParentPin(pin);
          setUnlocked(true);
        }}
        onEnter={() => setUnlocked(true)}
        onBack={() => navigate(-1)}
      />
    );
  }
  return <Analytics onExit={() => navigate("/profile")} />;
}

function PinGate({
  mode,
  expected,
  onCreate,
  onEnter,
  onBack,
}: {
  mode: "create" | "enter";
  expected: string | null;
  onCreate: (pin: string) => void;
  onEnter: () => void;
  onBack: () => void;
}) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  const press = (d: string) => {
    setError(false);
    const nextPin = (pin + d).slice(0, 4);
    setPin(nextPin);
    if (nextPin.length === 4) {
      setTimeout(() => {
        if (mode === "create") onCreate(nextPin);
        else if (nextPin === expected) onEnter();
        else {
          setError(true);
          setPin("");
        }
      }, 120);
    }
  };
  const back = () => setPin((p) => p.slice(0, -1));

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center text-center">
      <button onClick={onBack} className="press absolute left-5 top-20 text-ink-soft">
        <ArrowLeft />
      </button>
      <div className="aurora grid h-16 w-16 place-items-center rounded-2xl text-white shadow-glow">
        <Lock size={28} />
      </div>
      <h1 className="mt-5 font-display text-2xl font-extrabold">
        {mode === "create" ? "Придумайте PIN" : "Введите PIN"}
      </h1>
      <p className="mt-2 max-w-xs text-ink-soft">
        {mode === "create"
          ? "4 цифры для входа в родительскую панель"
          : "Доступ к панели родителя"}
      </p>

      <div className="mt-7 flex gap-3">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-4 w-4 rounded-full transition-colors ${
              i < pin.length ? "aurora" : error ? "bg-coral/40" : "bg-hairline"
            }`}
          />
        ))}
      </div>
      {error && <p className="mt-3 text-sm text-coral">Неверный PIN, попробуйте снова</p>}

      <div className="mt-8 grid w-64 grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "←"].map((k, i) =>
          k === "" ? (
            <div key={i} />
          ) : (
            <button
              key={i}
              onClick={() => (k === "←" ? back() : press(k))}
              className="press grid h-16 place-items-center rounded-2xl bg-surface font-display text-xl font-extrabold shadow-soft"
            >
              {k}
            </button>
          ),
        )}
      </div>
    </div>
  );
}

/** Карточка прогресса привязанного ребёнка (по семейному коду). */
function ChildCard({ code, onRemove }: { code: string; onRemove: () => void }) {
  // undefined — загрузка, null — не найден, иначе — данные.
  const [data, setData] = useState<ChildProgress | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    setData(undefined);
    fetchChildByCode(code).then((d) => !cancelled && setData(d));
    return () => {
      cancelled = true;
    };
  }, [code]);

  const level = data ? levelFromXp(data.xp) : null;

  return (
    <div className="rounded-[var(--radius-card)] bg-surface p-4 shadow-soft">
      <div className="flex items-center gap-3">
        <Avatar value={data?.avatar ?? ""} name={data?.nickname ?? ""} size={40} className="rounded-xl" />
        <div className="min-w-0 flex-1">
          <div className="truncate font-bold tracking-tight">
            {data?.nickname || (data === null ? "Не найден" : "Ребёнок")}
          </div>
          <div className="text-xs text-ink-faint tabular-nums">
            {code}
            {data?.grade ? ` · ${data.grade}-й класс` : ""}
          </div>
        </div>
        <button onClick={onRemove} aria-label="Отвязать" className="press grid h-8 w-8 place-items-center rounded-full bg-bg text-ink-soft">
          <X size={15} />
        </button>
      </div>

      {data === undefined && (
        <div className="mt-3 flex items-center gap-2 text-sm text-ink-faint">
          <Loader2 size={14} className="animate-spin" /> Загружаем…
        </div>
      )}
      {data === null && (
        <p className="mt-2 text-sm text-ink-soft">Код не найден. Проверьте его в профиле ребёнка.</p>
      )}
      {data && (
        <>
          {level && (
            <div className="mt-3 text-sm font-semibold text-ink-soft">
              {level.title} ·{" "}
              <span className="text-ink">{data.xp.toLocaleString("ru-RU")} XP</span>
            </div>
          )}
          <div className="mt-2 grid grid-cols-4 gap-2 text-center">
            <ChildStat Icon={Flame} value={`${data.streak}`} label="дн." color="text-coral" />
            <ChildStat Icon={Coins} value={`${data.coins}`} label="монет" color="text-amber" />
            <ChildStat Icon={FileText} value={`${data.reportsCount}`} label="докл." color="text-teal" />
            <ChildStat Icon={GraduationCap} value={data.grade ? `${data.grade}` : "—"} label="класс" color="text-blue" />
          </div>
        </>
      )}
    </div>
  );
}

function ChildStat({
  Icon,
  value,
  label,
  color,
}: {
  Icon: typeof Flame;
  value: string;
  label: string;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-xl bg-bg p-2">
      <Icon size={15} className={color} />
      <span className="font-display text-base font-extrabold tabular-nums leading-none">{value}</span>
      <span className="text-[10px] text-ink-faint">{label}</span>
    </div>
  );
}

function Analytics({ onExit }: { onExit: () => void }) {
  const { grade, xp, coins, streak, daily, familyCode, children, addChild, removeChild } =
    useUserStore();
  const [codeInput, setCodeInput] = useState("");
  const level = levelFromXp(xp);
  const subjects = grade ? subjectsForGrade(grade).slice(0, 5) : [];
  // Мок-распределение активности по предметам (до подключения бэкенда)
  const activity = [68, 45, 30, 22, 12];

  const stats = [
    { Icon: Flame, label: "Серия", value: `${streak} дн.`, color: "text-coral" },
    { Icon: Sparkles, label: "Опыт", value: `${xp} XP`, color: "text-violet" },
    { Icon: Coins, label: "Монеты", value: coins, color: "text-amber" },
    { Icon: BookOpen, label: "Сегодня", value: `${daily.messages} вопр.`, color: "text-teal" },
  ];

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">
          Панель <span className="text-violet">родителя</span>
        </h1>
        <button onClick={onExit} className="press text-sm font-bold text-ink-soft">
          Выйти
        </button>
      </div>

      <div className="hero-night mb-4 rounded-[2rem] p-5 text-white shadow-glow">
        <p className="text-sm text-white/60">Уровень ребёнка</p>
        <h2 className="font-display text-2xl font-extrabold">{level.title}</h2>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/15">
          <div className="aurora h-full rounded-full" style={{ width: `${Math.max(Math.round(level.progress * 100), 4)}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col items-start gap-1.5 rounded-2xl bg-surface p-4 shadow-soft">
            <s.Icon className={s.color} size={20} />
            <span className="text-sm text-ink-soft">{s.label}</span>
            <span className="font-display text-lg font-extrabold tabular-nums">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Активность по предметам */}
      <h2 className="mb-3 mt-7 text-sm font-bold uppercase tracking-wide text-ink-faint">
        Активность по предметам
      </h2>
      <div className="grid gap-2.5 rounded-[var(--radius-card)] bg-surface p-5 shadow-soft">
        {subjects.map((subj, i) => {
          const Icon = SUBJECT_ICON[subj.id];
          return (
            <div key={subj.id} className="flex items-center gap-3">
              <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-gradient-to-br text-white ${SUBJECT_COLOR[subj.id]}`}>
                <Icon size={16} strokeWidth={2.4} />
              </div>
              <span className="w-28 shrink-0 truncate text-sm font-semibold">{subj.title}</span>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg">
                <motion.div
                  className="aurora h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${activity[i] ?? 8}%` }}
                  transition={{ duration: 0.7, delay: i * 0.05 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Привязанные дети (по коду, из облака) */}
      {isSupabaseConfigured && (
        <>
          <h2 className="mb-3 mt-7 text-sm font-bold uppercase tracking-wide text-ink-faint">
            Дети
          </h2>
          <div className="flex gap-2">
            <input
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              placeholder="Код ребёнка · ON5-XXXXXX"
              className="w-full rounded-2xl bg-surface px-4 py-3 text-sm shadow-soft outline-none ring-1 ring-transparent transition focus:ring-violet placeholder:text-ink-faint"
            />
            <button
              onClick={() => {
                addChild(codeInput);
                setCodeInput("");
              }}
              aria-label="Привязать ребёнка"
              className="aurora press grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-white shadow-glow"
            >
              <UserPlus size={20} />
            </button>
          </div>
          {children.length === 0 ? (
            <p className="mt-3 text-sm text-ink-soft">
              Введите семейный код ребёнка (он есть в его профиле → «Родителям»), чтобы видеть прогресс.
            </p>
          ) : (
            <div className="mt-3 space-y-3">
              {children.map((code) => (
                <ChildCard key={code} code={code} onRemove={() => removeChild(code)} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Семейный код */}
      <h2 className="mb-3 mt-7 text-sm font-bold uppercase tracking-wide text-ink-faint">
        Семейный код
      </h2>
      <button
        onClick={() => navigator.clipboard?.writeText(familyCode)}
        className="press flex w-full items-center justify-between rounded-[var(--radius-card)] bg-surface p-5 shadow-soft"
      >
        <div className="text-left">
          <div className="font-display text-xl font-extrabold tracking-wide">{familyCode}</div>
          <div className="text-sm text-ink-soft">Поделитесь с ребёнком для связи</div>
        </div>
        <Copy size={20} className="text-ink-faint" />
      </button>

      {/* Методика */}
      <div className="mt-7 flex gap-3 rounded-[var(--radius-card)] bg-surface p-5 shadow-soft">
        <Lightbulb className="shrink-0 text-amber" />
        <div>
          <div className="font-bold tracking-tight">Наша методика</div>
          <p className="mt-1 text-sm text-ink-soft">
            OnFive не даёт готовых ответов. Репетитор ведёт ребёнка к решению
            вопросами и подсказками — так знания усваиваются и остаются надолго.
          </p>
        </div>
      </div>
    </div>
  );
}
