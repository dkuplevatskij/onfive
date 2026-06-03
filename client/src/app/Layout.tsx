import { Outlet, Link } from "react-router-dom";
import { Sparkles, Sun, Moon, Coins } from "lucide-react";
import { Suspense, useEffect } from "react";
import { useUserStore } from "../stores/user";
import { useApplyTheme } from "../hooks/useTheme";
import { Spark } from "../components/ui/Spark";
import { CountUp } from "../components/ui/CountUp";

/** Каркас приложения: липкая стеклянная шапка с брендом, темой, монетами и XP. */
export function Layout() {
  useApplyTheme();
  const xp = useUserStore((s) => s.xp);
  const coins = useUserStore((s) => s.coins);
  const theme = useUserStore((s) => s.theme);
  const toggleTheme = useUserStore((s) => s.toggleTheme);
  const checkIn = useUserStore((s) => s.checkIn);

  useEffect(() => {
    checkIn();
  }, [checkIn]);

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col">
      <header className="glass sticky top-0 z-20 flex items-center justify-between px-5 py-3.5">
        <Link to="/" className="flex items-center gap-2">
          <Spark size={26} />
          <span className="font-display text-lg font-extrabold tracking-tight">
            OnFive
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label="Переключить тему"
            className="press grid h-9 w-9 place-items-center rounded-full bg-surface text-ink-soft shadow-soft"
          >
            {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <div className="flex items-center gap-1 rounded-full bg-surface px-3 py-1.5 text-sm font-bold shadow-soft">
            <Coins size={15} className="text-amber" />
            <CountUp value={coins} />
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-chip px-3.5 py-1.5 text-sm font-bold text-[var(--color-on-chip)]">
            <Sparkles size={15} className="text-violet" />
            <CountUp value={xp} />
            <span className="opacity-50">XP</span>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Suspense
          fallback={
            <div className="grid min-h-[60vh] place-items-center">
              <Spark size={44} className="spark-pulse" />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
    </div>
  );
}
