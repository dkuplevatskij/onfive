import { describe, it, expect } from "vitest";
import { buildDocxBlob } from "./docx";

describe("buildDocxBlob", () => {
  it("возвращает непустой Blob нужного типа", async () => {
    const blob = await buildDocxBlob("Пётр I", "Введение.\n\nОсновная часть.");
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
    expect(blob.type).toContain("officedocument.wordprocessingml");
  });
});
