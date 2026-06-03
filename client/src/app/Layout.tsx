import { Outlet, Link } from "react-router-dom";
import { useUserStore } from "../stores/user";
import { Spark } from "../components/ui/Spark";

/** Каркас приложения: липкая стеклянная шапка с брендом и XP-орбом. */
export function Layout() {
  const xp = useUserStore((s) => s.xp);

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col">
      <header className="glass sticky top-0 z-20 flex items-center justify-between px-5 py-3.5">
        <Link to="/" className="flex items-center gap-2">
          <Spark size={26} />
          <span className="font-display text-lg font-extrabold tracking-tight">
            OnFive
          </span>
        </Link>
        <div className="press flex items-center gap-1.5 rounded-full bg-ink px-3.5 py-1.5 text-sm font-bold text-white">
          <span className="aurora-text">✦</span>
          <span className="tabular-nums">{xp}</span>
          <span className="text-white/50">XP</span>
        </div>
      </header>
      <main className="flex-1 px-5 py-6">
        <Outlet />
      </main>
    </div>
  );
}
