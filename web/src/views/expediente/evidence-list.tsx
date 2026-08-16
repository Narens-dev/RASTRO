"use client";

import { useState } from "react";

import { Inview } from "@/components/animation/springs/in-view";
import type { EvidenceItem, EvidenceLevel } from "@/types/rastro";
import { formatEvidenceDetail } from "@/utils/format-evidence-detail";

const SOURCE_ICON: Record<string, string> = {
  RUES: "business",
  "SECOP — sanciones": "receipt_long",
  Procuraduría: "balance",
  Contraloría: "account_balance",
  "Rama Judicial": "gavel",
  Contaduría: "request_quote",
};

const CARD_CLASS: Record<EvidenceLevel, string> = {
  alto: "border-error/20 hover:border-error/50",
  sin_hallazgo: "border-outline-variant/50 hover:border-outline-variant",
  limpio: "border-outline-variant/50 hover:border-primary-container/50",
};

const ICON_BOX_CLASS: Record<EvidenceLevel, string> = {
  alto: "bg-error/10 text-error",
  sin_hallazgo: "bg-outline/10 text-outline",
  limpio: "bg-primary/10 text-primary",
};

const PILL_CLASS: Record<EvidenceLevel, string> = {
  alto: "bg-error-container text-on-error-container",
  sin_hallazgo: "bg-surface-variant text-on-surface-variant",
  limpio: "bg-secondary-fixed text-on-secondary-fixed",
};

const PILL_ICON: Record<EvidenceLevel, string> = {
  alto: "warning",
  sin_hallazgo: "help",
  limpio: "check_circle",
};

const CTA_CLASS: Record<EvidenceLevel, string> = {
  alto: "text-error hover:text-on-error-container",
  sin_hallazgo: "text-outline hover:text-on-surface-variant",
  limpio: "text-primary hover:text-primary-container",
};

function formatCheckedAt(iso: string) {
  try {
    return new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

const EvidenceRow = ({ item, index }: { item: EvidenceItem; index: number }) => {
  const [open, setOpen] = useState(false);
  const detailText = formatEvidenceDetail(item.detail);
  const icon = SOURCE_ICON[item.source] ?? "description";

  return (
    <Inview
      tag="div"
      from={{ opacity: 0, y: 14 }}
      to={{ opacity: 1, y: 0 }}
      mode="once"
      delayIn={Math.min(index * 60, 300)}
      className={`group relative flex flex-col gap-4 rounded-xl border bg-surface-container-lowest p-5 shadow-sm transition-colors sm:flex-row sm:items-center sm:justify-between ${CARD_CLASS[item.level]}`}
    >
      {item.level === "alto" && <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-error" />}
      <div className={`flex flex-grow items-start gap-4 sm:items-center ${item.level === "alto" ? "pl-2" : ""}`}>
        <div className={`shrink-0 rounded-lg p-2 ${ICON_BOX_CLASS[item.level]}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-headline font-semibold text-on-surface">{item.sourceLabel}</h4>
            <span
              className={`inline-flex items-center gap-1 rounded px-2 py-0.5 font-label text-xs font-bold tracking-wider uppercase ${PILL_CLASS[item.level]}`}
            >
              <span className="material-symbols-outlined text-[14px]">{PILL_ICON[item.level]}</span>
              {item.levelLabel}
            </span>
          </div>
          <p className="font-body text-sm text-on-surface-variant">{item.summary}</p>
        </div>
      </div>

      <div className="flex shrink-0 flex-col gap-2 border-t border-outline-variant/30 pt-3 sm:items-end sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4">
        <span className="flex items-center gap-1 font-label text-xs text-outline">
          <span className="material-symbols-outlined text-[14px]">update</span>
          {formatCheckedAt(item.checkedAt)}
        </span>
        {detailText ? (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className={`flex items-center gap-1 text-sm font-medium transition-colors ${CTA_CLASS[item.level]}`}
          >
            {open ? "Ocultar detalle" : "Ver detalle"}
            <span className="material-symbols-outlined text-[16px] transition-transform group-hover:translate-x-1">
              {open ? "arrow_upward" : "arrow_forward"}
            </span>
          </button>
        ) : null}
      </div>

      {open && detailText && (
        <pre className="order-last mt-2 max-h-70 w-full overflow-auto rounded-xl bg-background p-4 font-mono text-[0.813rem] whitespace-pre-wrap">
          {detailText}
        </pre>
      )}
    </Inview>
  );
};

/** Evidence list — Módulo 2 output rendered one card per source. Literal port of the Stitch mockup's source cards. */
export const EvidenceList = ({ evidence }: { evidence: EvidenceItem[] }) => {
  return (
    <div className="flex flex-col gap-4">
      {evidence.map((item, i) => (
        <EvidenceRow key={item.source} item={item} index={i} />
      ))}
    </div>
  );
};
