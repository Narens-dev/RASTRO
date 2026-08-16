import Link from "next/link";

import { fetchRastroApi } from "@/lib/rastro-api";
import { ApiError } from "@/lib/api";
import type { ContractTracking, AlignmentStatus } from "@/types/rastro";
import { formatCOP, formatDate } from "@/utils/format";
import { ProgressBar } from "./contrato/progress-bar";

const SIGNAL_ICON: Record<AlignmentStatus, string> = {
  alineado: "check_circle",
  adelantado: "rocket_launch",
  alerta_atraso: "warning",
  sin_datos: "info",
};

const SIGNAL_CLASS: Record<AlignmentStatus, { bg: string; border: string; icon: string; iconBg: string; title: string; body: string }> = {
  alineado: {
    bg: "bg-primary-container/10",
    border: "border-primary-container",
    icon: "text-primary-container",
    iconBg: "bg-primary-container/10",
    title: "text-primary-container",
    body: "text-on-surface-variant",
  },
  adelantado: {
    bg: "bg-primary-container/10",
    border: "border-primary-container",
    icon: "text-primary-container",
    iconBg: "bg-primary-container/10",
    title: "text-primary-container",
    body: "text-on-surface-variant",
  },
  alerta_atraso: {
    bg: "bg-[#FFF0F0]",
    border: "border-[#BA1A1A]",
    icon: "text-[#BA1A1A]",
    iconBg: "bg-[#BA1A1A]/10",
    title: "text-[#93000A]",
    body: "text-[#7C2A35]",
  },
  sin_datos: {
    bg: "bg-surface-container-low",
    border: "border-outline",
    icon: "text-outline",
    iconBg: "bg-outline/10",
    title: "text-on-surface",
    body: "text-on-surface-variant",
  },
};

const TIMELINE_DOT_CLASS: Record<TimelineEventType, string> = {
  firma: "bg-primary-container",
  inicio: "bg-primary-container",
  adicion: "bg-brand-accent",
  hito: "bg-brand-accent",
  fin: "bg-outline",
};

type TimelineEventType = "firma" | "inicio" | "adicion" | "hito" | "fin";

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
  const signal = alignment ? SIGNAL_CLASS[alignment.status] : null;

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

      {c && alignment && signal && (
        <div className="w-full flex-grow bg-surface-bright">
          <div className="mx-auto -mt-6 flex max-w-page flex-col gap-8 px-6 py-12 md:px-12 lg:px-24">
            <div className={`flex items-start gap-4 rounded-r-lg border-l-4 p-6 shadow-sm ${signal.bg} ${signal.border}`}>
              <div className={`mt-1 shrink-0 rounded-full p-2 ${signal.iconBg}`}>
                <span
                  className={`material-symbols-outlined ${signal.icon}`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  {SIGNAL_ICON[alignment.status]}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <h3 className={`font-display text-lg font-bold ${signal.title}`}>{alignment.label}</h3>
                <p className={`font-body text-sm leading-relaxed ${signal.body}`}>{alignment.detail}</p>
              </div>
            </div>

            <section className="relative flex flex-col gap-8 overflow-hidden rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-8 shadow-sm">
              <div aria-hidden="true" className="absolute top-0 right-0 -mt-16 -mr-16 size-32 rounded-bl-full bg-primary-container/5" />
              <div className="flex items-center gap-3 border-b border-surface-container pb-4">
                <span className="material-symbols-outlined text-primary-container">account_balance_wallet</span>
                <h2 className="font-display text-2xl font-bold text-on-surface">Ejecución Financiera</h2>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="flex flex-col gap-2 rounded-lg bg-surface-container-low p-4">
                  <span className="font-label text-xs font-semibold tracking-wider text-on-surface-variant uppercase">Valor Total</span>
                  <span className="font-display text-3xl font-extrabold text-on-surface">{c.totalValueFormatted}</span>
                  <span className="font-body text-xs text-on-surface-variant">COP</span>
                </div>
                <div className="flex flex-col gap-2 rounded-lg border-l-4 border-primary-container bg-surface-container-low p-4">
                  <span className="font-label text-xs font-semibold tracking-wider text-on-surface-variant uppercase">Pagado a la fecha</span>
                  <span className="font-display text-3xl font-extrabold text-primary-container">{c.paidToDateFormatted}</span>
                  <span className="font-body text-xs text-on-surface-variant">
                    {c.totalValue ? Math.round(((c.paidToDate ?? 0) / c.totalValue) * 100) : 0}% del total
                  </span>
                </div>
                <div className="flex flex-col gap-2 rounded-lg bg-surface-container-low p-4">
                  <span className="font-label text-xs font-semibold tracking-wider text-on-surface-variant uppercase">Pendiente por pagar</span>
                  <span className="font-display text-3xl font-extrabold text-on-surface-variant">{c.pendingFormatted}</span>
                  <span className="font-body text-xs text-on-surface-variant">
                    {c.totalValue ? Math.round((c.pending / c.totalValue) * 100) : 0}% del total
                  </span>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-6">
                <ProgressBar label="Plazo Transcurrido" pct={alignment.timeElapsedPct ?? 0} />
                <ProgressBar label="Ejecución Financiera (Pagado)" pct={alignment.paidPct ?? alignment.physicalProgressPct ?? 0} gold />
              </div>
            </section>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <section className="flex h-full flex-col gap-6 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-8 shadow-sm">
                <div className="flex items-center gap-3 border-b border-surface-container pb-4">
                  <span className="material-symbols-outlined text-primary-container">timeline</span>
                  <h2 className="font-display text-xl font-bold text-on-surface">Línea de Tiempo</h2>
                </div>

                {tracking!.timeline.length === 0 ? (
                  <p className="text-sm text-on-surface-variant">Sin fechas registradas para construir la línea de tiempo.</p>
                ) : (
                  <div className="relative flex flex-col gap-8 py-2 pl-6 before:absolute before:inset-y-0 before:left-[11px] before:w-[2px] before:bg-surface-container-high">
                    {tracking!.timeline.map((ev, i) => (
                      <div key={`${ev.date}-${i}`} className="relative">
                        <div
                          aria-hidden="true"
                          className={`absolute -left-[30px] top-1 size-3 rounded-full ring-4 ring-surface-container-lowest ${TIMELINE_DOT_CLASS[ev.type]}`}
                        />
                        <div className="flex flex-col gap-1">
                          <span className="font-label text-xs font-bold tracking-wider text-primary-container uppercase">
                            {formatDate(ev.date)}
                          </span>
                          <h4 className="font-display font-bold text-on-surface">{ev.label}</h4>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

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
