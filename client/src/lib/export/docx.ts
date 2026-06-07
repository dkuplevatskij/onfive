import { Document, Packer, Paragraph, HeadingLevel, TextRun } from "docx";

const SIGNATURE = "Подготовлено с помощью OnFive AI";

/** Разбивает markdown-черновик на абзацы по пустым строкам. */
function toParagraphs(draft: string): Paragraph[] {
  return draft
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((text) => new Paragraph({ children: [new TextRun(text)], spacing: { after: 200 } }));
}

/** Собирает .docx-документ доклада в Blob. */
export async function buildDocxBlob(topic: string, draft: string): Promise<Blob> {
  const doc = new Document({
    sections: [
      {
        children: [
          new Paragraph({ text: topic, heading: HeadingLevel.HEADING_1 }),
          ...toParagraphs(draft),
          new Paragraph({
            children: [new TextRun({ text: SIGNATURE, italics: true, color: "888888" })],
            spacing: { before: 400 },
          }),
        ],
      },
    ],
  });
  return Packer.toBlob(doc);
}
