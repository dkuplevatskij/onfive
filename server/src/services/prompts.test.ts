import { describe, it, expect } from "vitest";
import { buildSystemPrompt } from "./prompts.js";
import type { ChatContext } from "@onfive/shared";

const base: ChatContext = {
  grade: 7,
  subject: "history",
  topic: "Пётр I",
  mode: "free",
};

describe("buildSystemPrompt — доклады", () => {
  it("write: содержит инструкцию вести вопросами и не писать за ученика", () => {
    const p = buildSystemPrompt({ ...base, reportMode: "write" });
    expect(p).toContain("ПОМОЩЬ С ДОКЛАДОМ");
    expect(p).toMatch(/НЕ пиши весь доклад/i);
  });
  it("draft: учитывает объём", () => {
    const p = buildSystemPrompt({ ...base, reportMode: "draft", reportLength: "long" });
    expect(p).toContain("ЧЕРНОВИК");
    expect(p).toContain("2000");
  });
  it("review: просит обратную связь без переписывания", () => {
    const p = buildSystemPrompt({ ...base, reportMode: "review" });
    expect(p).toContain("ПРОВЕРКА ДОКЛАДА");
    expect(p).toMatch(/не переписывай/i);
  });
  it("без reportMode остаётся обычным занятием", () => {
    const p = buildSystemPrompt(base);
    expect(p).toContain("СВОБОДНЫЙ ВОПРОС");
  });
});

describe("buildSystemPrompt — свободный чат (general)", () => {
  it("даёт общий промпт без привязки к предмету и хранит сократическое правило", () => {
    const p = buildSystemPrompt({ grade: 8, topic: "Свободный чат", mode: "free", general: true });
    expect(p).toContain("свободный чат");
    expect(p).toContain("Сам определи предмет");
    expect(p).toMatch(/НИКОГДА НЕ ДАВАЙ ГОТОВЫХ ОТВЕТОВ/);
    // Не подставляет название предмета, даже если оно случайно пришло.
    expect(p).not.toContain("Предмет: «");
  });
});
