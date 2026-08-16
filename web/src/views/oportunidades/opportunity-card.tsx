"use client";

import { Inview } from "@/components/animation/springs/in-view";
import type { Opportunity } from "@/types/rastro";
import { formatCOP, formatDate } from "@/utils/format";

interface OpportunityCardProps {
  opportunity: Opportunity;
  index: number;
}

/** Literal port of the Stitch mockup's opportunity card. */
export const OpportunityCard = ({ opportunity: o, index }: OpportunityCardProps) => {
  return (
    <Inview
      tag="div"
      from={{ opacity: 0, y: 18 }}
      to={{ opacity: 1, y: 0 }}
      mode="once"
      delayIn={Math.min((index % 6) * 60, 300)}
      className="group h-full"
    >
      <a
        href={o.url}
        target="_blank"
        rel="noopener noreferrer"
        className="relative flex h-full flex-col rounded-xl border border-outline-variant bg-surface-container-lowest p-6 transition-shadow hover:shadow-md"
      >
        <div className="absolute top-0 right-0 flex items-center gap-1 rounded-tr-xl rounded-bl-lg bg-secondary-container px-3 py-1 text-xs font-bold text-on-secondary-container">
          <span aria-hidden="true" className="size-2 animate-pulse rounded-full bg-[#046A38]" />
          Activo
        </div>

        <div className="mb-4">
          <span className="mb-3 inline-block rounded bg-surface-container-high px-2 py-1 font-label text-xs font-semibold tracking-wider text-on-surface-variant uppercase">
            {o.modality || "Proceso SECOP"}
          </span>
          <h3 className="mb-2 font-headline text-xl leading-tight font-bold text-on-surface transition-colors group-hover:text-primary-container">
            {o.name || o.reference}
          </h3>
          <p className="flex items-center gap-1 font-body text-sm text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px]">account_balance</span>
            {o.entity}
            {o.entityLocation ? `, ${o.entityLocation}` : ""}
          </p>
        </div>

        <div className="mt-auto mb-6 rounded-lg border border-outline-variant/50 bg-surface-container p-3">
          <p className="mb-1 flex items-center gap-1 font-label text-xs font-semibold text-on-surface-variant">
            <span className="material-symbols-outlined text-[14px]">history</span>
            Ganadores anteriores en procesos similares:
          </p>
          {o.previousWinners?.length ? (
            <p className="truncate font-body text-sm text-on-surface">
              {o.previousWinners.map((w) => `${w.name} (${w.count})`).join(", ")}
            </p>
          ) : (
            <p className="font-body text-sm text-on-surface-variant italic">No hay datos suficientes para esta entidad.</p>
          )}
        </div>

        <div className="flex items-end justify-between border-t border-outline-variant/30 pt-4">
          <div>
            <span className="mb-1 block font-label text-xs tracking-wide text-on-surface-variant uppercase">Valor Base</span>
            <span className="font-display text-2xl font-extrabold text-brand-accent">{formatCOP(o.basePrice)}</span>
          </div>
          <div className="text-right">
            <span className="mb-1 block font-label text-xs tracking-wide text-on-surface-variant uppercase">Publicación</span>
            <span className="font-body text-sm font-medium text-on-surface-variant">{formatDate(o.publishedDate)}</span>
          </div>
        </div>
      </a>
    </Inview>
  );
};
