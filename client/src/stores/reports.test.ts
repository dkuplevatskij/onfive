import { describe, it, expect, beforeEach } from "vitest";
import { useReportsStore } from "./reports";

beforeEach(() => {
  // Сброс store и localStorage между тестами.
  localStorage.clear();
  useReportsStore.setState({ reports: [] });
});

describe("useReportsStore", () => {
  it("create добавляет доклад и возвращает id", () => {
    const id = useReportsStore.getState().create({
      subject: "history",
      topic: "Пётр I",
      length: "medium",
      mode: "write",
    });
    const reports = useReportsStore.getState().reports;
    expect(reports).toHaveLength(1);
    expect(reports[0].id).toBe(id);
    expect(reports[0].topic).toBe("Пётр I");
    expect(reports[0].draft).toBe("");
    expect(reports[0].messages).toEqual([]);
  });

  it("get возвращает доклад по id", () => {
    const id = useReportsStore.getState().create({
      subject: "biology", topic: "Клетка", length: "short", mode: "draft",
    });
    expect(useReportsStore.getState().get(id)?.topic).toBe("Клетка");
    expect(useReportsStore.getState().get("нет")).toBeUndefined();
  });

  it("update патчит поля и обновляет updatedAt", () => {
    const id = useReportsStore.getState().create({
      subject: "biology", topic: "Клетка", length: "short", mode: "draft",
    });
    const before = useReportsStore.getState().get(id)!.updatedAt;
    useReportsStore.getState().update(id, { draft: "Новый текст" });
    const after = useReportsStore.getState().get(id)!;
    expect(after.draft).toBe("Новый текст");
    expect(after.updatedAt >= before).toBe(true);
  });

  it("appendToDraft дописывает текст с разделителем", () => {
    const id = useReportsStore.getState().create({
      subject: "biology", topic: "Клетка", length: "short", mode: "draft",
    });
    useReportsStore.getState().appendToDraft(id, "Абзац 1");
    useReportsStore.getState().appendToDraft(id, "Абзац 2");
    expect(useReportsStore.getState().get(id)!.draft).toBe("Абзац 1\n\nАбзац 2");
  });

  it("remove удаляет доклад", () => {
    const id = useReportsStore.getState().create({
      subject: "biology", topic: "Клетка", length: "short", mode: "draft",
    });
    useReportsStore.getState().remove(id);
    expect(useReportsStore.getState().reports).toHaveLength(0);
  });
});
