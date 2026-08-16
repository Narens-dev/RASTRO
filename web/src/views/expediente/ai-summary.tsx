"use client";

import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api-client";
import type { AiSummaryResponse } from "@/types/rastro";

interface AiSummaryProps {
  doc: string;
  docType: string;
  name?: string;
}

/**
 * Módulo 6 — resumen ejecutivo con IA. Client leaf: fetched after mount so it
 * never blocks the (server-rendered) main expediente content, and hides
 * itself entirely when the model narrates nothing (`available: false`) —
 * matching aiSummary.js's safe-degradation contract. Literal port of the
 * Stitch mockup's gradient card.
 */
export const AiSummary = ({ doc, docType, name }: AiSummaryProps) => {
  const [state, setState] = useState<"loading" | "hidden" | AiSummaryResponse>("loading");

  useEffect(() => {
    let cancelled = false;
    const qs = name ? `?name=${encodeURIComponent(name)}` : "";
    apiFetch<AiSummaryResponse>(`/api/entity/${docType}/${encodeURIComponent(doc)}/summary${qs}`)
      .then((res) => !cancelled && setState(res.available ? res : "hidden"))
      .catch(() => !cancelled && setState("hidden"));
    return () => {
      cancelled = true;
    };
  }, [doc, docType, name]);

  if (state === "hidden") return null;

  return (
    <div className="relative -mt-16 mb-12 overflow-hidden rounded-2xl border border-primary-container/30 bg-gradient-to-br from-inverse-surface to-brand-emerald-dark p-6 shadow-lg lg:p-8">
      <span aria-hidden="true" className="material-symbols-outlined absolute top-0 right-0 p-4 text-8xl text-primary-fixed opacity-10">
        psychology
      </span>
      <div className="relative z-10 flex flex-col gap-4">
        <h2 className="flex items-center gap-2 font-headline text-lg font-bold text-primary-fixed">
          <span className="material-symbols-outlined text-[20px]">insights</span>
          Resumen ejecutivo — IA
        </h2>
        {state === "loading" ? (
          <p className="font-body text-base text-surface-variant lg:text-lg">Generando resumen…</p>
        ) : (
          <p className="max-w-4xl font-body text-base leading-relaxed text-surface-variant lg:text-lg">{state.text}</p>
        )}
      </div>
    </div>
  );
};
