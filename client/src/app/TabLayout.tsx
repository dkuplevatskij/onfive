import { Outlet } from "react-router-dom";
import { TabBar } from "../components/nav/TabBar";

/** Обёртка для вкладок: контент + нижняя таб-навигация. */
export function TabLayout() {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      <div className="flex-1 px-5 py-6">
        <Outlet />
      </div>
      <TabBar />
    </div>
  );
}
