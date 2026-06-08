import { useEffect, useRef } from "react";
import { useUserStore } from "../../stores/user";
import { useReportsStore } from "../../stores/reports";
import { useAuthStore } from "../../stores/auth";
import {
  fetchProfile,
  fetchReports,
  upsertProfile,
  upsertReports,
  type CloudProfile,
} from "../cloud";
import { mergeGamification, mergeReports, type GamificationSnapshot } from "./merge";

/** Собирает снимок геймификации из локального стора. */
function localSnapshot(): GamificationSnapshot {
  const s = useUserStore.getState();
  return {
    xp: s.xp,
    coins: s.coins,
    streak: s.streak,
    lastActive: s.lastActive,
    dailyBonusDate: s.dailyBonusDate,
  };
}

/** Собирает полный облачный профиль из локального состояния. */
function localProfile(): CloudProfile {
  const s = useUserStore.getState();
  return {
    ...localSnapshot(),
    nickname: s.nickname,
    firstName: s.firstName,
    lastName: s.lastName,
    telegram: s.telegram,
    vk: s.vk,
    avatar: s.avatar,
    grade: s.grade,
    goals: s.goals,
  };
}

/**
 * Первая синхронизация устройства: тянем облако, сливаем без потерь с локальным
 * состоянием, применяем результат локально и возвращаем его в облако. Так
 * прогресс, накопленный офлайн, не теряется ни на одной из сторон.
 */
export async function pullAndMerge(userId: string): Promise<void> {
  const [cloud, cloudReports] = await Promise.all([
    fetchProfile(userId),
    fetchReports(userId),
  ]);

  // Геймификация: конфликт-свободный max-merge.
  const merged = cloud ? mergeGamification(localSnapshot(), cloud) : localSnapshot();

  // Идентичность и настройки: облако дополняет пустые локальные поля
  // (новое устройство подхватывает имя/класс/цели прошлой сессии).
  const local = useUserStore.getState();
  useUserStore.setState({
    xp: merged.xp,
    coins: merged.coins,
    streak: merged.streak,
    lastActive: merged.lastActive,
    dailyBonusDate: merged.dailyBonusDate,
    nickname: local.nickname || (cloud?.nickname ?? ""),
    firstName: local.firstName || (cloud?.firstName ?? ""),
    lastName: local.lastName || (cloud?.lastName ?? ""),
    telegram: local.telegram || (cloud?.telegram ?? ""),
    vk: local.vk || (cloud?.vk ?? ""),
    avatar: local.avatar || (cloud?.avatar ?? ""),
    grade: local.grade ?? cloud?.grade ?? null,
    goals: local.goals.length > 0 ? local.goals : cloud?.goals ?? [],
  });

  // Доклады: объединяем по id.
  const mergedReports = mergeReports(useReportsStore.getState().reports, cloudReports);
  useReportsStore.setState({ reports: mergedReports });

  // Возвращаем объединённое состояние в облако.
  await Promise.all([
    upsertProfile(userId, localProfile()),
    upsertReports(userId, mergedReports),
  ]);
}

/** Выгружает текущее локальное состояние в облако. */
export async function pushSnapshot(userId: string): Promise<void> {
  await Promise.all([
    upsertProfile(userId, localProfile()),
    upsertReports(userId, useReportsStore.getState().reports),
  ]);
}

/**
 * Хук фоновой синхронизации. Монтируется один раз (в Layout): дожидается
 * готовности анонимной сессии, делает начальный merge, затем выгружает
 * изменения в облако с дебаунсом. Без облака — полный no-op.
 */
export function useCloudSync(): void {
  const status = useAuthStore((s) => s.status);
  const userId = useAuthStore((s) => s.userId);
  const init = useAuthStore((s) => s.init);
  const mergedFor = useRef<string | null>(null);

  // Старт анонимной авторизации.
  useEffect(() => {
    void init();
  }, [init]);

  // Начальный merge и подписка на изменения сторов для выгрузки.
  useEffect(() => {
    if (status !== "ready" || !userId) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const start = async () => {
      if (mergedFor.current !== userId) {
        mergedFor.current = userId;
        await pullAndMerge(userId).catch(() => {});
      }
      if (cancelled) return;

      const schedulePush = () => {
        clearTimeout(timer);
        timer = setTimeout(() => void pushSnapshot(userId).catch(() => {}), 1500);
      };
      const unsubUser = useUserStore.subscribe(schedulePush);
      const unsubReports = useReportsStore.subscribe(schedulePush);
      cleanup = () => {
        clearTimeout(timer);
        unsubUser();
        unsubReports();
      };
    };

    let cleanup = () => {};
    void start();

    return () => {
      cancelled = true;
      clearTimeout(timer);
      cleanup();
    };
  }, [status, userId]);
}
