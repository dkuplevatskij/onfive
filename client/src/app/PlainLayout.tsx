import { Outlet } from "react-router-dom";

/** Обёртка для экранов без таб-навигации (воронка обучения, онбординг). */
export function PlainLayout() {
  return (
    <div className="px-5 py-6">
      <Outlet />
    </div>
  );
}
