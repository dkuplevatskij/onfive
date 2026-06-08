import { supabase } from "./supabase";
import type { Report } from "../stores/reports";
import type { GamificationSnapshot } from "./sync/merge";
import type { Grade, ReportLength, ReportMode, SubjectId } from "@onfive/shared";

/**
 * Тонкая обёртка над таблицами Supabase. Все функции безопасны при
 * незаконфигурированном облаке: возвращают null / [] и ничего не делают.
 * Маппинг snake_case (БД) ↔ camelCase (приложение) живёт только здесь.
 */

/** Профиль ученика в облаке: идентичность + геймификация. */
export interface CloudProfile extends GamificationSnapshot {
  nickname: string;
  firstName: string;
  lastName: string;
  telegram: string;
  vk: string;
  avatar: string;
  grade: Grade | null;
  goals: string[];
}

/** Строка рейтинга (публичный срез профиля — без личных контактов). */
export interface LeaderboardEntry {
  id: string;
  nickname: string;
  avatar: string;
  xp: number;
  streak: number;
  grade: Grade | null;
}

interface ProfileRow {
  id: string;
  nickname: string | null;
  first_name: string | null;
  last_name: string | null;
  telegram: string | null;
  vk: string | null;
  avatar: string | null;
  grade: number | null;
  goals: string[] | null;
  xp: number | null;
  coins: number | null;
  streak: number | null;
  last_active: string | null;
  daily_bonus_date: string | null;
}

/** Публичная строка, которую возвращает RPC рейтинга (только безопасные поля). */
interface LeaderboardRow {
  id: string;
  nickname: string | null;
  avatar: string | null;
  xp: number | null;
  streak: number | null;
  grade: number | null;
}

interface ReportRow {
  id: string;
  subject: string;
  topic: string;
  length: string;
  mode: string;
  messages: Report["messages"];
  draft: string | null;
  created_at: string;
  updated_at: string;
}

/** Загружает облачный профиль или null (нет данных / облако выключено). */
export async function fetchProfile(userId: string): Promise<CloudProfile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle<ProfileRow>();
  if (error || !data) return null;
  return {
    nickname: data.nickname ?? "",
    firstName: data.first_name ?? "",
    lastName: data.last_name ?? "",
    telegram: data.telegram ?? "",
    vk: data.vk ?? "",
    avatar: data.avatar ?? "",
    grade: (data.grade as Grade | null) ?? null,
    goals: data.goals ?? [],
    xp: data.xp ?? 0,
    coins: data.coins ?? 0,
    streak: data.streak ?? 0,
    lastActive: data.last_active,
    dailyBonusDate: data.daily_bonus_date,
  };
}

/** Создаёт/обновляет облачный профиль текущего ученика. */
export async function upsertProfile(userId: string, p: CloudProfile): Promise<void> {
  if (!supabase) return;
  await supabase.from("profiles").upsert({
    id: userId,
    nickname: p.nickname,
    first_name: p.firstName,
    last_name: p.lastName,
    telegram: p.telegram,
    vk: p.vk,
    avatar: p.avatar,
    grade: p.grade,
    goals: p.goals,
    xp: p.xp,
    coins: p.coins,
    streak: p.streak,
    last_active: p.lastActive,
    daily_bonus_date: p.dailyBonusDate,
    updated_at: new Date().toISOString(),
  });
}

/** Загружает доклады ученика из облака. */
export async function fetchReports(userId: string): Promise<Report[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("user_id", userId)
    .returns<ReportRow[]>();
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id,
    subject: r.subject as SubjectId,
    topic: r.topic,
    length: r.length as ReportLength,
    mode: r.mode as ReportMode,
    messages: r.messages ?? [],
    draft: r.draft ?? "",
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }));
}

/** Пишет доклады ученика в облако (upsert по id). */
export async function upsertReports(userId: string, reports: Report[]): Promise<void> {
  if (!supabase || reports.length === 0) return;
  await supabase.from("reports").upsert(
    reports.map((r) => ({
      id: r.id,
      user_id: userId,
      subject: r.subject,
      topic: r.topic,
      length: r.length,
      mode: r.mode,
      messages: r.messages,
      draft: r.draft,
      created_at: r.createdAt,
      updated_at: r.updatedAt,
    })),
  );
}

/** Тянет топ рейтинга через защищённую RPC (видны только публичные поля). */
export async function fetchLeaderboard(limit = 100): Promise<LeaderboardEntry[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc("onfive_leaderboard", { limit_count: limit });
  if (error || !data) return [];
  return (data as LeaderboardRow[]).map((r) => ({
    id: r.id,
    nickname: r.nickname ?? "",
    avatar: r.avatar ?? "",
    xp: r.xp ?? 0,
    streak: r.streak ?? 0,
    grade: (r.grade as Grade | null) ?? null,
  }));
}
