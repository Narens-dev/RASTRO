import Link from "next/link";

import type { ContractHistoryItem } from "@/types/rastro";
import { formatCOP, formatDate } from "@/utils/format";

interface ContractHistoryProps {
  contractHistory: { count: number; contracts: ContractHistoryItem[] };
}

/** SECOP contract history — literal port of the Stitch mockup's compact "Historial SECOP" card. */
export const ContractHistory = ({ contractHistory }: ContractHistoryProps) => {
  if (!contractHistory.count) {
    return (
      <div className="rounded-xl border border-outline-variant/50 bg-surface-container-lowest p-10 text-center text-on-surface-variant shadow-sm">
        <span aria-hidden="true" className="material-symbols-outlined mb-2 text-3xl text-outline">
          description
        </span>
        <p className="text-sm">Sin contratos registrados en SECOP para este documento.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-outline-variant/50 bg-surface-container-lowest shadow-sm">
      <div className="flex items-center justify-between border-b border-outline-variant/30 bg-surface-container-low px-3 py-3">
        <span className="font-label text-xs font-semibold tracking-wide text-on-surface-variant uppercase">Entidad / Objeto</span>
        <span className="font-label text-xs font-semibold tracking-wide text-on-surface-variant uppercase">Valor</span>
      </div>
      <ul className="divide-y divide-outline-variant/20">
        {contractHistory.contracts.map((c) => (
          <li key={c.contractId}>
            <Link
              href={`/contrato?id=${encodeURIComponent(c.contractId)}`}
              className="flex items-start justify-between gap-3 p-3 transition-colors hover:bg-surface-container-low"
            >
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-xs font-semibold text-on-surface">{c.entity}</span>
                <span className="line-clamp-2 text-xs text-on-surface-variant">{c.description}</span>
                <span className="mt-1 inline-flex w-max items-center rounded bg-secondary-fixed/50 px-1.5 py-0.5 text-[10px] font-medium text-on-secondary-fixed">
                  {c.status}
                </span>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="text-sm font-semibold text-on-surface">{formatCOP(c.value)}</span>
                <span className="text-[10px] text-outline">{formatDate(c.signDate)}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};
