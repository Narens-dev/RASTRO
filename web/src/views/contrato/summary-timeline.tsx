import type { ContractDetail, AlignmentSignal } from "@/types/rastro";
import { formatDate } from "@/utils/format";

interface SummaryTimelineProps {
  contract: ContractDetail;
  alignment: AlignmentSignal;
}

const Node = ({ label, date, done, current, muted }: { label: string; date: string; done?: boolean; current?: boolean; muted?: boolean }) => (
  <div className="flex flex-col items-center">
    <div
      className={`flex size-8 shrink-0 items-center justify-center rounded-full border-4 border-surface-container-lowest ${
        current
          ? "border-[3px] border-primary-container bg-surface-container-lowest"
          : done
            ? "bg-primary-container"
            : "bg-surface-container-high"
      }`}
    >
      {done && <span className="material-symbols-outlined text-sm text-on-primary">check</span>}
      {current && <span className="size-3 rounded-full bg-primary-container" />}
    </div>
    <div className={`mt-3 text-center ${muted ? "opacity-50" : ""}`}>
      <p className="font-label text-xs font-bold text-on-surface">{label}</p>
      <p className="font-mono text-xs text-on-surface-variant">{date}</p>
    </div>
  </div>
);

/** Línea de tiempo horizontal "a primera vista" — Firma / Inicio / Hoy / Fin previsto. Complementa (no reemplaza) el registro de ejecución detallado. */
export const SummaryTimeline = ({ contract, alignment }: SummaryTimelineProps) => {
  if (!contract.startDate && !contract.signDate) return null;

  const progressPct = Math.max(0, Math.min(100, alignment.timeElapsedPct ?? 0));
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-8">
      <h2 className="mb-10 font-label text-xs font-semibold tracking-wider text-on-surface-variant uppercase">Línea de Tiempo del Proyecto</h2>
      <div className="relative">
        <div aria-hidden="true" className="absolute top-4 left-0 h-0.5 w-full -translate-y-1/2 bg-surface-container-high" />
        <div
          aria-hidden="true"
          className="absolute top-4 left-0 h-0.5 -translate-y-1/2 bg-primary-container transition-[width]"
          style={{ width: `${progressPct}%` }}
        />
        <div className="relative flex justify-between">
          {contract.signDate && <Node label="Firma" date={formatDate(contract.signDate)} done />}
          {contract.startDate && <Node label="Inicio Obra" date={formatDate(contract.startDate)} done />}
          <Node label="Avance Actual" date={formatDate(today)} current />
          {contract.endDate && <Node label="Fin Previsto" date={formatDate(contract.endDate)} muted />}
        </div>
      </div>
    </div>
  );
};
