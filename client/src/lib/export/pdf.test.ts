import { describe, it, expect } from "vitest";
import { buildPdfBlob } from "./pdf";

describe("buildPdfBlob", () => {
  it("возвращает непустой PDF-Blob", async () => {
    // fontBase64 = "" → используем дефолтный шрифт (тест проверяет компоновку, не кириллицу).
    const blob = await buildPdfBlob("Topic", "Intro.\n\nBody.", "");
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
    expect(blob.type).toBe("application/pdf");
  });
});
