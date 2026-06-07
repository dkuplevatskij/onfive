import { useNavigate } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { Plus, FileText, Trash2 } from "lucide-react";
import { useReportsStore } from "../stores/reports";
import { findSubject } from "../data/subjects";
import { findReportMode } from "../data/reportModes";

const stagger: Variants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const rise: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
};

/** Список созданных докладов + кнопка нового. */
export function ReportsList() {
  const navigate = useNavigate();
  const reports = useReportsStore((s) => s.reports);
  const remove = useReportsStore((s) => s.remove);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show">
      <motion.h1 variants={rise} className="mb-1 font-display text-2xl font-extrabold tracking-tight">
        📝 Доклады
      </motion.h1>
      <motion.p variants={rise} className="mb-5 text-sm text-ink-soft">
        AI поможет написать доклад — но думать будешь ты.
      </motion.p>

      <motion.button
        variants={rise}
        onClick={() => navigate("/reports/new")}
        className="press aurora mb-5 flex w-full items-center justify-center gap-2 rounded-[var(--radius-card)] p-4 font-bold text-white shadow-glow"
      >
        <Plus size={20} /> Новый доклад
      </motion.button>

      {reports.length === 0 ? (
        <motion.div variants={rise} className="rounded-[var(--radius-card)] bg-surface p-6 text-center text-ink-soft shadow-soft">
          Пока нет докладов. Создай первый!
        </motion.div>
      ) : (
        <div className="grid gap-3">
          {reports.map((r) => {
            const subject = findSubject(r.subject);
            const mode = findReportMode(r.mode);
            return (
              <motion.div
                key={r.id}
                variants={rise}
                className="press flex items-center gap-3 rounded-[var(--radius-card)] bg-surface p-4 shadow-soft hover:shadow-glow"
              >
                <button
                  onClick={() => navigate(`/reports/${r.id}`)}
                  className="flex flex-1 items-center gap-3 text-left"
                >
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-bg text-ink">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate font-bold tracking-tight">{r.topic}</div>
                    <div className="truncate text-sm text-ink-soft">
                      {subject?.title ?? r.subject} · {mode?.title ?? r.mode}
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => remove(r.id)}
                  aria-label="Удалить доклад"
                  className="press grid h-9 w-9 shrink-0 place-items-center rounded-full bg-bg text-ink-faint"
                >
                  <Trash2 size={16} />
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
