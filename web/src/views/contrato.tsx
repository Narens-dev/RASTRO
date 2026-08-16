import Link from "next/link";

import { fetchRastroApi } from "@/lib/rastro-api";
import { ApiError } from "@/lib/api";
import type { ContractTracking } from "@/types/rastro";
import { formatCOP, formatDate } from "@/utils/format";
import { ExecutionGauge } from "./contrato/execution-gauge";
import { SummaryTimeline } from "./contrato/summary-timeline";
import { ExecutionTable } from "./contrato/execution-table";

interface ContratoViewProps {
  contractId?: string;
}

/** Seguimiento de contrato (Módulo 4). Literal port of the Stitch mockup. Async Server Component: fetched server-side, no client loading state on first paint. */
export const ContratoView = async ({ contractId }: ContratoViewProps) => {
  if (!contractId) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-page items-center justify-center px-6 py-24 text-center">
        <h1 className="font-display text-2xl font-bold">Falta el identificador del contrato.</h1>
      </main>
    );
  }

  let tracking: ContractTracking | null = null;
  let errorMessage: string | null = null;

  try {
    tracking = await fetchRastroApi<ContractTracking>(`/api/contract/${encodeURIComponent(contractId)}`);
  } catch (err) {
    errorMessage = err instanceof ApiError ? err.message : "No fue posible cargar el contrato.";
  }

  const c = tracking?.contract;
  const alignment = tracking?.alignment;

  return (
    <main className="flex flex-grow flex-col">
      <header className="bg-[#0a0a0a] px-6 py-12 text-white md:px-12 lg:px-24">
        <div className="mx-auto flex max-w-page flex-col gap-6">
          <Link
            href="/"
            className="group inline-flex w-fit items-center gap-2 text-surface-variant transition-colors hover:text-white"
          >
            <span className="material-symbols-outlined text-sm transition-transform group-hover:-translate-x-1">arrow_back</span>
            <span className="font-label text-sm font-semibold tracking-wider uppercase">Ir al inicio</span>
          </Link>

          <div className="mt-4 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-surface-variant/20 px-3 py-1 font-label text-xs font-bold tracking-widest text-surface-variant uppercase">
                Contrato SECOP
              </span>
            </div>
            <h1 className="max-w-4xl font-display text-4xl leading-tight font-extrabold tracking-tight md:text-5xl lg:text-6xl">
              {errorMessage
                ? "No fue posible cargar el contrato."
                : c?.object.slice(0, 110) + ((c?.object.length ?? 0) > 110 ? "…" : "")}
            </h1>

            {errorMessage ? (
              <p className="text-[0.9rem] text-red-300">{errorMessage}</p>
            ) : (
              c && (
                <div className="mt-6 grid grid-cols-1 gap-6 border-t border-surface-variant/20 pt-6 md:grid-cols-3">
                  <div className="flex flex-col gap-1">
                    <span className="font-label text-xs tracking-wider text-surface-variant uppercase">Entidad Contratante</span>
                    <span className="font-body text-lg font-semibold">{c.entity}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-label text-xs tracking-wider text-surface-variant uppercase">Contratista</span>
                    <span className="font-body text-lg font-semibold">{c.provider || "No especificado"}</span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-label text-xs tracking-wider text-surface-variant uppercase">Número de Contrato</span>
                    <span className="font-mono text-lg text-primary-fixed">{c.contractId}</span>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </header>

      {c && alignment && (
        <div className="w-full flex-grow bg-surface-bright">
          <div className="mx-auto -mt-6 flex max-w-page flex-col gap-8 px-6 py-12 md:px-12 lg:px-24">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <ExecutionGauge alignment={alignment} />

              <div className="relative col-span-1 flex flex-col gap-6 overflow-hidden rounded-lg border border-outline-variant/40 bg-surface-container-lowest p-6 shadow-sm md:col-span-2">
                <h2 className="font-label text-xs font-semibold tracking-wider text-on-surface-variant uppercase">Ejecución Financiera</h2>

                <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4">
                  <div className="min-w-0">
                    <p className="font-label text-xs text-on-surface-variant">Valor Total</p>
                    <p className="truncate font-display text-xl font-bold text-on-surface" title={c.totalValueFormatted}>{c.totalValueFormatted}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-label text-xs text-on-surface-variant">Facturado</p>
                    <p className="truncate font-display text-xl font-bold text-on-surface" title={c.invoicedFormatted}>{c.invoicedFormatted}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-label text-xs text-on-surface-variant">Pagado</p>
                    <p className="truncate font-display text-xl font-bold text-primary-container" title={c.paidToDateFormatted}>{c.paidToDateFormatted}</p>
                  </div>
                  <div className="min-w-0">
                    <p className="font-label text-xs text-on-surface-variant">Pendiente</p>
                    <p className="truncate font-display text-xl font-bold text-on-surface-variant" title={c.pendingFormatted}>{c.pendingFormatted}</p>
                  </div>
                </div>

                {(() => {
                  const total = c.totalValue || 1;
                  const paidPct = Math.max(0, Math.min(100, ((c.paidToDate ?? 0) / total) * 100));
                  const invoicedPct = Math.max(paidPct, Math.min(100, (c.invoicedValue / total) * 100));
                  return (
                    <div>
                      <div className="flex h-4 w-full overflow-hidden rounded bg-surface-container-high">
                        <div className="h-full bg-primary-container" style={{ width: `${paidPct}%` }} title={`Pagado: ${Math.round(paidPct)}%`} />
                        <div className="h-full bg-brand-accent" style={{ width: `${invoicedPct - paidPct}%` }} title="Facturado no pagado" />
                      </div>
                      <div className="mt-2 flex justify-between font-mono text-xs text-on-surface-variant">
                        <span>0%</span>
                        <span>{Math.round(invoicedPct)}% Facturado</span>
                        <span>100%</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            <SummaryTimeline contract={c} alignment={alignment} />

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <ExecutionTable contract={c} />

              <section className="flex h-full flex-col gap-6 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-8 shadow-sm">
                <div className="flex items-center gap-3 border-b border-surface-container pb-4">
                  <span className="material-symbols-outlined text-primary-container">verified_user</span>
                  <h2 className="font-display text-xl font-bold text-on-surface">Garantías y Pólizas</h2>
                </div>

                {c.guarantees.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">Sin pólizas registradas para este contrato.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {c.guarantees.map((g, i) => (
                      <div
                        key={i}
                        className="flex flex-col items-start justify-between gap-4 rounded-lg border border-surface-container-high p-4 transition-colors hover:bg-surface-container-low sm:flex-row sm:items-center"
                      >
                        <div className="flex flex-col gap-1">
                          <span className="font-label text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
                            {g.insurer || "Aseguradora no especificada"}
                          </span>
                          <h4 className="font-display text-lg font-bold text-on-surface">{g.type || "Póliza"}</h4>
                          <span className="mt-1 inline-flex w-fit items-center gap-1 rounded bg-primary-container/10 px-2 py-0.5 text-xs text-primary-container">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span>
                            Vigente {formatDate(g.validFrom)} → {formatDate(g.validTo)}
                          </span>
                        </div>
                        <div className="flex flex-col sm:items-end">
                          <span className="font-label text-xs tracking-wider text-on-surface-variant uppercase">Valor Asegurado</span>
                          <span className="font-display text-xl font-bold text-on-surface">{formatCOP(g.value)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
