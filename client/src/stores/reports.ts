import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChatMessage, ReportLength, ReportMode, SubjectId } from "@onfive/shared";

/** Доклад ученика: чат с AI + накопленный текст. */
export interface Report {
  id: string;
  subject: SubjectId;
  topic: string;
  length: ReportLength;
  mode: ReportMode;
  messages: ChatMessage[];
  draft: string;
  createdAt: string;
  updatedAt: string;
}

interface CreateInput {
  subject: SubjectId;
  topic: string;
  length: ReportLength;
  mode: ReportMode;
}

interface ReportsState {
  reports: Report[];
  create: (input: CreateInput) => string;
  get: (id: string) => Report | undefined;
  update: (id: string, patch: Partial<Report>) => void;
  appendToDraft: (id: string, text: string) => void;
  remove: (id: string) => void;
}

function nowIso(): string {
  return new Date().toISOString();
}

export const useReportsStore = create<ReportsState>()(
  persist(
    (set, get) => ({
      reports: [],

      create: (input) => {
        const id = crypto.randomUUID();
        const ts = nowIso();
        const report: Report = {
          id,
          ...input,
          messages: [],
          draft: "",
          createdAt: ts,
          updatedAt: ts,
        };
        set((s) => ({ reports: [report, ...s.reports] }));
        return id;
      },

      get: (id) => get().reports.find((r) => r.id === id),

      update: (id, patch) =>
        set((s) => ({
          reports: s.reports.map((r) =>
            r.id === id ? { ...r, ...patch, updatedAt: nowIso() } : r,
          ),
        })),

      appendToDraft: (id, text) =>
        set((s) => ({
          reports: s.reports.map((r) =>
            r.id === id
              ? { ...r, draft: r.draft ? `${r.draft}\n\n${text}` : text, updatedAt: nowIso() }
              : r,
          ),
        })),

      remove: (id) => set((s) => ({ reports: s.reports.filter((r) => r.id !== id) })),
    }),
    { name: "onfive-reports" },
  ),
);
