"use client";

import { useState } from "react";

import { apiFetch, ApiClientError } from "@/lib/api-client";
import type { EvidenceItem, EvidenceLevel, PersonaDocType, PersonaDossier } from "@/types/rastro";
import { formatEvidenceDetail } from "@/utils/format-evidence-detail";
import { AiSummary } from "@/views/expediente/ai-summary";

const inputClass =
  "rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-3 text-sm focus:border-primary-container focus:ring-2 focus:ring-primary-container focus:outline-none";

const SOURCE_ICON: Record<string, string> = {
  "Policía Nacional": "local_police",
  Procuraduría: "gavel",
  Contraloría: "account_balance",
  "Rama Judicial": "balance",
  ADRES: "health_and_safety",
  SIMIT: "directions_car",
};

const BADGE_CLASS: Record<EvidenceLevel, string> = {
  alto: "bg-error text-on-error shadow-sm",
  limpio: "bg-secondary-container text-primary-container",
  sin_hallazgo: "border border-outline-variant bg-surface-container-high text-on-surface-variant",
};

const BADGE_ICON: Record<EvidenceLevel, string> = {
  alto: "warning",
  limpio: "check_circle",
  sin_hallazgo: "remove",
};

const CARD_CLASS: Record<EvidenceLevel, string> = {
  alto: "border-error-container",
  limpio: "border-outline-variant hover:border-outline",
  sin_hallazgo: "border-outline-variant hover:border-outline",
};

const ICON_BOX_CLASS: Record<EvidenceLevel, string> = {
  alto: "bg-error-container/30 text-error group-hover:bg-error-container/50",
  limpio: "bg-surface-container text-on-surface-variant group-hover:bg-surface-container-high",
  sin_hallazgo: "bg-surface-container text-on-surface-variant group-hover:bg-surface-container-high",
};

function formatCheckedAt(iso: string) {
  try {
    return new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

const PersonaEvidenceCard = ({ item }: { item: EvidenceItem }) => {
  const [open, setOpen] = useState(false);
  const detailText = formatEvidenceDetail(item.detail);
  const icon = SOURCE_ICON[item.source] ?? "description";

  return (
    <article
      className={`group relative flex flex-col gap-4 overflow-hidden rounded-xl border bg-surface-container-lowest p-5 shadow-sm transition-colors md:flex-row md:items-center md:gap-8 md:p-6 ${CARD_CLASS[item.level]}`}
    >
      {item.level === "alto" && <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-error" />}
      <div className={`flex shrink-0 items-center gap-4 md:w-1/4 ${item.level === "alto" ? "pl-2" : ""}`}>
        <div className={`flex size-12 shrink-0 items-center justify-center rounded-lg transition-colors ${ICON_BOX_CLASS[item.level]}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <h4 className="leading-tight font-bold text-on-surface">
          {item.source}
          <br />
          <span className="text-xs font-normal text-outline">{item.sourceLabel}</span>
        </h4>
      </div>

      <div className="flex-1">
        <p className="text-sm font-medium text-on-surface-variant md:text-base">{item.summary}</p>
        {detailText && (
          <button type="button" onClick={() => setOpen((v) => !v)} className="mt-2 text-xs font-semibold text-primary-container">
            {open ? "Ocultar detalle ↑" : "Ver detalle ↓"}
          </button>
        )}
        {open && detailText && (
          <pre className="mt-3 max-h-70 overflow-auto rounded-lg bg-background p-4 font-mono text-[0.75rem] whitespace-pre-wrap">
            {detailText}
          </pre>
        )}
      </div>

      <div className="flex shrink-0 flex-row items-center justify-between gap-2 md:w-1/5 md:flex-col md:items-end">
        <span className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold ${BADGE_CLASS[item.level]}`}>
          <span className="material-symbols-outlined text-[14px]" style={item.level === "alto" ? { fontVariationSettings: "'FILL' 1" } : undefined}>
            {BADGE_ICON[item.level]}
          </span>
          {item.levelLabel}
        </span>
        <span className="font-mono text-xs text-outline">{formatCheckedAt(item.checkedAt)}</span>
      </div>
    </article>
  );
};

/**
 * Estudio de seguridad por cédula — cruza Policía, Procuraduría, Contraloría,
 * Rama Judicial, ADRES y SIMIT en un solo dossier (backgroundCheck.js).
 * Literal port of the Stitch mockup's estudio-de-seguridad result cards.
 */
export const PersonaSearch = () => {
  const [docType, setDocType] = useState<PersonaDocType>("CC");
  const [doc, setDoc] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dossier, setDossier] = useState<PersonaDossier | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doc.trim()) return;
    setLoading(true);
    setError(null);
    setDossier(null);
    try {
      const qs = name.trim() ? `?name=${encodeURIComponent(name.trim())}` : "";
      const result = await apiFetch<PersonaDossier>(`/api/personas/${docType}/${encodeURIComponent(doc.trim())}${qs}`);
      setDossier(result);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "No fue posible construir el estudio de seguridad.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1.5 text-sm font-semibold text-on-surface">
          Tipo
          <select value={docType} onChange={(e) => setDocType(e.target.value as PersonaDocType)} className={inputClass}>
            <option value="CC">Cédula (CC)</option>
            <option value="CE">Cédula extranjería (CE)</option>
          </select>
        </label>
        <label className="flex min-w-50 flex-1 flex-col gap-1.5 text-sm font-semibold text-on-surface">
          Número de documento
          <input required value={doc} onChange={(e) => setDoc(e.target.value)} placeholder="79123456" className={inputClass} />
        </label>
        <label className="flex min-w-50 flex-1 flex-col gap-1.5 text-sm font-semibold text-on-surface">
          Nombre completo (opcional, mejora la búsqueda en Rama Judicial)
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-sm transition-colors hover:bg-primary-container disabled:opacity-60"
        >
          {loading ? "Consultando…" : "Consultar"}
        </button>
      </form>

      {error && <p className="mt-4 text-sm text-error">{error}</p>}

      {dossier && (
        <div className="mt-8 flex flex-col gap-6">
          <AiSummary doc={dossier.doc} docType={dossier.docType} name={dossier.name ?? undefined} basePath="/api/personas" />

          <div className="flex items-end justify-between border-b border-outline-variant pb-4">
            <h3 className="font-display text-xl font-bold text-on-surface">Evidencia por fuente</h3>
            <span className="text-sm font-medium text-outline">{dossier.evidence.length} fuentes cruzadas</span>
          </div>

          <div className="flex flex-col gap-4">
            {dossier.evidence.map((item) => (
              <PersonaEvidenceCard key={item.source} item={item} />
            ))}
          </div>

          <p className="mt-2 flex items-start gap-3 text-xs leading-relaxed text-outline">
            <span className="material-symbols-outlined shrink-0 text-[20px]">policy</span>
            Este reporte es confidencial y de uso exclusivo para propósitos de vinculación corporativa y análisis interno. La
            información proviene de fuentes públicas oficiales y se presenta tal como fue recuperada en la fecha de consulta.
            RASTRO no crea información, no altera registros oficiales ni emite juicios de valor o &quot;puntajes de riesgo&quot;
            definitivos. El tratamiento de esta información debe ceñirse a la Ley de Habeas Data (Ley 1581 de 2012).
          </p>
        </div>
      )}
    </div>
  );
};
