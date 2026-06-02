import { Outlet, Link } from "react-router-dom";
import { useUserStore } from "../stores/user";

/** Общий каркас приложения: шапка с брендом и XP, контентная область. */
export function Layout() {
  const xp = useUserStore((s) => s.xp);

  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-black/5 bg-[#f2f2f7]/80 px-4 py-3 backdrop-blur-xl">
        <Link to="/" className="text-lg font-semibold tracking-tight">
          OnFive<span className="text-blue-500">.</span>
        </Link>
        <div className="rounded-full bg-white px-3 py-1 text-sm font-medium shadow-sm">
          ⭐ {xp} XP
        </div>
      </header>
      <main className="flex-1 px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
