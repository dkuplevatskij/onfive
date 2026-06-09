import { jsPDF } from "jspdf";

const SIGNATURE = "Подготовлено с помощью OnFive AI";
const FONT_URL = "/fonts/PTSans-Regular.ttf";

/**
 * Собирает PDF доклада. Если передан fontBase64 (кириллический шрифт в base64),
 * регистрирует его; иначе использует дефолтный шрифт (без кириллицы — для тестов).
 */
export async function buildPdfBlob(
  topic: string,
  draft: string,
  fontBase64: string,
): Promise<Blob> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const marginX = 56;
  const marginTop = 64;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const maxWidth = pageWidth - marginX * 2;

  let font = "helvetica";
  if (fontBase64) {
    doc.addFileToVFS("PTSans-Regular.ttf", fontBase64);
    doc.addFont("PTSans-Regular.ttf", "PTSans", "normal");
    font = "PTSans";
  }

  doc.setFont(font, "normal");
  doc.setFontSize(18);
  let y = marginTop;
  for (const line of doc.splitTextToSize(topic, maxWidth)) {
    doc.text(line, marginX, y);
    y += 24;
  }

  doc.setFontSize(12);
  y += 8;
  const paragraphs = draft.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  for (const p of paragraphs) {
    for (const line of doc.splitTextToSize(p, maxWidth)) {
      if (y > pageHeight - marginTop) {
        doc.addPage();
        y = marginTop;
      }
      doc.text(line, marginX, y);
      y += 18;
    }
    y += 10;
  }

  doc.setFontSize(10);
  doc.setTextColor(136, 136, 136);
  doc.text(SIGNATURE, marginX, pageHeight - 40);

  return doc.output("blob");
}

/** Загружает кириллический шрифт из public/ и возвращает base64 (без префикса data:). */
export async function loadFontBase64(): Promise<string> {
  const res = await fetch(FONT_URL);
  const buf = await res.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buf);
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
