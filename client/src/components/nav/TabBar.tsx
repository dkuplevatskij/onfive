import { NavLink } from "react-router-dom";
import { House, ListChecks, Trophy, User } from "lucide-react";

const TABS = [
  { to: "/", label: "Главная", Icon: House, end: true },
  { to: "/tasks", label: "Задания", Icon: ListChecks, end: false },
  { to: "/leaderboard", label: "Рейтинг", Icon: Trophy, end: false },
  { to: "/profile", label: "Профиль", Icon: User, end: false },
];

/** Нижняя таб-навигация в стиле «Искра». */
export function TabBar() {
  return (
    <nav className="glass sticky bottom-0 z-20 flex items-stretch justify-around px-2 pb-[env(safe-area-inset-bottom)] pt-1.5">
      {TABS.map(({ to, label, Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className="press flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5"
        >
          {({ isActive }) => (
            <>
              <Icon
                size={22}
                strokeWidth={isActive ? 2.6 : 2}
                className={isActive ? "text-violet" : "text-ink-faint"}
              />
              <span
                className={`text-[11px] font-semibold ${
                  isActive ? "aurora-text" : "text-ink-faint"
                }`}
              >
                {label}
              </span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}
