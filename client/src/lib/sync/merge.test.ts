import { describe, it, expect } from "vitest";
import { mergeGamification, mergeReports, type GamificationSnapshot } from "./merge";
import type { Report } from "../../stores/reports";

const snap = (p: Partial<GamificationSnapshot>): GamificationSnapshot => ({
  xp: 0,
  coins: 0,
  streak: 0,
  lastActive: null,
  dailyBonusDate: null,
  ...p,
});

const report = (p: Partial<Report> & { id: string }): Report => ({
  subject: "history",
  topic: "Тема",
  length: "medium",
  mode: "write",
  messages: [],
  draft: "",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  ...p,
});

describe("mergeGamification", () => {
  it("берёт максимум монотонных счётчиков", () => {
    const local = snap({ xp: 120, coins: 8, streak: 3 });
    const cloud = snap({ xp: 90, coins: 15, streak: 5 });
    expect(mergeGamification(local, cloud)).toMatchObject({ xp: 120, coins: 15, streak: 5 });
  });

  it("берёт самую позднюю дату активности и бонуса", () => {
    const local = snap({ lastActive: "2026-06-01", dailyBonusDate: "2026-06-01" });
    const cloud = snap({ lastActive: "2026-06-05", dailyBonusDate: null });
    const merged = mergeGamification(local, cloud);
    expect(merged.lastActive).toBe("2026-06-05");
    expect(merged.dailyBonusDate).toBe("2026-06-01");
  });

  it("коммутативен — порядок аргументов не меняет результат", () => {
    const a = snap({ xp: 50, coins: 1, streak: 2, lastActive: "2026-06-02" });
    const b = snap({ xp: 70, coins: 9, streak: 1, lastActive: "2026-06-04" });
    expect(mergeGamification(a, b)).toEqual(mergeGamification(b, a));
  });

  it("ничего не теряет при пустом облаке (первая синхронизация)", () => {
    const local = snap({ xp: 200, coins: 10, streak: 4, lastActive: "2026-06-06" });
    expect(mergeGamification(local, snap({}))).toEqual(local);
  });
});

describe("mergeReports", () => {
  it("объединяет непересекающиеся доклады", () => {
    const local = [report({ id: "a", createdAt: "2026-01-02T00:00:00.000Z" })];
    const cloud = [report({ id: "b", createdAt: "2026-01-01T00:00:00.000Z" })];
    const merged = mergeReports(local, cloud);
    expect(merged.map((r) => r.id)).toEqual(["a", "b"]);
  });

  it("при конфликте оставляет более свежую версию", () => {
    const local = [report({ id: "a", draft: "старое", updatedAt: "2026-01-01T00:00:00.000Z" })];
    const cloud = [report({ id: "a", draft: "новое", updatedAt: "2026-02-01T00:00:00.000Z" })];
    const merged = mergeReports(local, cloud);
    expect(merged).toHaveLength(1);
    expect(merged[0].draft).toBe("новое");
  });

  it("сортирует по createdAt — новые сверху", () => {
    const merged = mergeReports(
      [report({ id: "old", createdAt: "2026-01-01T00:00:00.000Z" })],
      [report({ id: "new", createdAt: "2026-03-01T00:00:00.000Z" })],
    );
    expect(merged.map((r) => r.id)).toEqual(["new", "old"]);
  });

  it("коммутативен по набору id", () => {
    const a = [report({ id: "x" }), report({ id: "y" })];
    const b = [report({ id: "y" }), report({ id: "z" })];
    const ids = (rs: Report[]) => rs.map((r) => r.id).sort();
    expect(ids(mergeReports(a, b))).toEqual(ids(mergeReports(b, a)));
  });
});
