import { useNavigate } from "react-router-dom";
import { useUserStore } from "../stores/user";
import { levelFromXp } from "../lib/level";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

/**
 * Главный экран OnFive.
 * Новому пользователю — приветствие и кнопка «Начать».
 * Вернувшемуся (класс уже выбран) — дашборд с уровнем и переходом к предметам.
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
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <div className="mb-6 text-6xl">🎓</div>
      <h1 className="text-4xl font-bold tracking-tight">
        OnFive<span className="text-blue-500">.</span>
      </h1>
      <p className="mt-2 text-lg text-gray-500">Учись на пятёрку с AI</p>
      <p className="mt-6 max-w-sm text-gray-500">
        Я не даю готовых ответов — помогаю дойти до них самому, подсказками и
        вопросами. Так знания остаются с тобой.
      </p>
      <Button onClick={onStart} className="mt-8 px-8 py-3 text-base">
        Начать
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

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Привет! 👋</h1>
      <p className="mb-6 text-gray-500">{grade} класс</p>

      <Card className="mb-4">
        <div className="flex items-baseline justify-between">
          <span className="font-semibold">{level.title}</span>
          <span className="text-sm text-gray-500">
            {level.next === null ? `${xp} XP` : `${xp} / ${level.next} XP`}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-blue-500 transition-all"
            style={{ width: `${Math.round(level.progress * 100)}%` }}
          />
        </div>
      </Card>

      <Card
        onClick={() => navigate("/subjects")}
        className="mb-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">📚</span>
          <span className="font-medium">Выбрать предмет и начать</span>
        </div>
        <span className="text-gray-400">›</span>
      </Card>

      <Card
        onClick={() => navigate("/onboarding")}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎒</span>
          <span className="font-medium">Сменить класс</span>
        </div>
        <span className="text-gray-400">›</span>
      </Card>
    </div>
  );
}
