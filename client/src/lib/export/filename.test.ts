import { describe, it, expect } from "vitest";
import { safeFileName } from "./filename";

describe("safeFileName", () => {
  it("заменяет пробелы и спецсимволы на дефисы", () => {
    expect(safeFileName("Пётр I: реформы")).toBe("Пётр-I-реформы");
  });
  it("обрезает повторяющиеся и крайние дефисы", () => {
    expect(safeFileName("  Тема   доклада!!  ")).toBe("Тема-доклада");
  });
  it("пустую строку заменяет на 'доклад'", () => {
    expect(safeFileName("   ")).toBe("доклад");
  });
});
