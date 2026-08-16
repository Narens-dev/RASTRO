"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { apiFetch, ApiClientError } from "@/lib/api-client";
import type { SearchCandidate, SearchResponse } from "@/types/rastro";
import { Handle } from "@/components/animation/springs/handle";

const SAMPLE_QUERIES = [
  { label: "Constructora Bolívar Bogotá", query: "Constructora Bolivar Bogota" },
  { label: "NIT 900555333", query: "900555333" },
] as const;

type Status = "idle" | "loading" | "results" | "empty" | "error";

/**
 * Hero search — Módulo 3 (búsqueda + cascada de normalización). Client leaf:
 * owns the query state and navigates to the expediente once a document is
 * resolved. Kept out of `HomeView` so the view stays a Server Component.
 */
export const SearchBox = () => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [candidates, setCandidates] = useState<SearchCandidate[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const goToExpediente = (candidate: SearchCandidate) => {
    if (!candidate.doc) {
      setMessage(
        "Este registro está cancelado y no tiene NIT activo para consultar. Elige otra coincidencia.",
      );
      return;
    }
    const params = new URLSearchParams({ doc: candidate.doc, docType: candidate.docType });
    if (candidate.name) params.set("name", candidate.name);
    router.push(`/expediente?${params.toString()}`);
  };

  const runSearch = async (raw: string) => {
    const q = raw.trim();
    if (!q) return;

    setStatus("loading");
    setMessage(null);
    setCandidates([]);

    try {
      const result = await apiFetch<SearchResponse>(`/api/search?q=${encodeURIComponent(q)}`);

      if (result.queryType === "document" && result.candidates.length === 1) {
        goToExpediente(result.candidates[0]);
        return;
      }

      if (!result.candidates.length) {
        setStatus("empty");
        return;
      }

      setCandidates(result.candidates);
      setStatus("results");
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof ApiClientError ? err.message : "No fue posible completar la búsqueda.");
    }
  };

  const runSample = (sampleQuery: string) => {
    setQuery(sampleQuery);
    inputRef.current?.focus();
    void runSearch(sampleQuery);
  };

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void runSearch(query);
        }}
      >
        <div className="relative flex w-full items-center rounded-full border border-outline-variant/30 bg-surface p-2 shadow-lg transition-all focus-within:ring-4 focus-within:ring-primary/20">
          <span className="material-symbols-outlined pointer-events-none absolute left-6 text-outline" aria-hidden="true">
            search
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Busca un NIT, cédula o nombre de empresa o entidad…"
            aria-label="Buscar NIT, cédula o nombre"
            className="w-full bg-transparent py-4 pr-32 pl-14 font-body text-on-surface placeholder:font-light placeholder:text-outline focus:ring-0 focus:outline-none"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="absolute top-2 right-2 bottom-2 shrink-0 rounded-full bg-brand-accent px-6 font-label font-bold whitespace-nowrap text-inverse-surface shadow-sm transition-opacity hover:opacity-90 disabled:opacity-60 md:px-8"
          >
            {status === "loading" ? "Buscando…" : "Consultar"}
          </button>
        </div>
      </form>

      <p className="mt-3.5 text-[0.813rem] text-foreground-inverse/62">
        Prueba, por ejemplo:{" "}
        {SAMPLE_QUERIES.map((sample, i) => (
          <span key={sample.query}>
            {i > 0 && " · "}
            <button
              type="button"
              onClick={() => runSample(sample.query)}
              className="font-semibold text-accent-gold-soft transition-colors duration-[var(--duration-fast)] ease-entrance hover:underline"
            >
              {sample.label}
            </button>
          </span>
        ))}
      </p>

      <Handle
        tag="div"
        from={{ opacity: 0, y: -8 }}
        to={{ opacity: 1, y: 0 }}
        className="mt-4"
      >
        {status === "empty" && (
          <p className="max-w-[40rem] text-[0.813rem] text-foreground-inverse/62">
            Sin coincidencias en RUES. Verifica el nombre o intenta con el NIT/cédula
            directamente.
          </p>
        )}
        {status === "error" && message && (
          <p className="max-w-[40rem] text-[0.813rem] text-red-300">{message}</p>
        )}
        {status === "results" && (
          <div className="flex max-w-[40rem] flex-col gap-2">
            {message && <p className="text-[0.813rem] text-foreground-inverse/62">{message}</p>}
            <p className="text-[0.813rem] text-foreground-inverse/62">
              {candidates.length} coincidencia(s) — elige la correcta:
            </p>
            {candidates.map((candidate, i) => (
              <button
                key={`${candidate.doc ?? "sin-doc"}-${i}`}
                type="button"
                onClick={() => goToExpediente(candidate)}
                className="flex items-center justify-between gap-3 rounded-2xl border border-foreground-inverse/12 bg-foreground-inverse/6 px-5 py-4 text-left transition-colors duration-[var(--duration-fast)] ease-entrance hover:bg-foreground-inverse/11"
              >
                <span>
                  <span className="block text-[0.9375rem] font-semibold text-foreground-inverse">
                    {candidate.name || `Documento ${candidate.doc}`}
                  </span>
                  <span className="mt-0.5 block text-[0.781rem] text-foreground-inverse/62">
                    {candidate.docType}
                    {candidate.doc ? ` · ${candidate.doc}` : ""}
                    {candidate.status ? ` · ${candidate.status}` : ""}
                  </span>
                </span>
                <span className="text-accent-gold-soft" aria-hidden="true">
                  →
                </span>
              </button>
            ))}
          </div>
        )}
      </Handle>
    </div>
  );
};
