import type { Metadata } from "next";

import { fetchRastroApi } from "@/lib/rastro-api";
import { ApiError } from "@/lib/api";
import type { DocType, Expediente } from "@/types/rastro";
import { generateMetadata as buildMetadata } from "@/utils/seo/generate-page-metadata";

import { EntityHeader } from "./expediente/entity-header";
import { EvidenceList } from "./expediente/evidence-list";
import { ContractHistory } from "./expediente/contract-history";
import { AiSummary } from "./expediente/ai-summary";

interface ExpedienteViewProps {
  doc?: string;
  docType?: string;
  name?: string;
}

const VALID_DOC_TYPES: DocType[] = ["NIT", "CC", "CE"];

function isValidDocType(value?: string): value is DocType {
  return !!value && (VALID_DOC_TYPES as string[]).includes(value);
}

export function buildExpedienteMetadata({ name, doc }: ExpedienteViewProps): Metadata {
  const title = name ? `${name} — Expediente RASTRO` : "Expediente — RASTRO";
  return buildMetadata({ title, description: `Expediente de riesgo trazable para ${name || doc || "el documento consultado"}.` });
}

/**
 * Ficha de expediente (Módulo 2 — scoreEngine). Async Server Component: el
 * expediente se resuelve server-side (sin spinner en la carga inicial); el
 * resumen con IA se pide aparte, client-side, porque puede tardar más.
 */
export const ExpedienteView = async ({ doc, docType, name }: ExpedienteViewProps) => {
  if (!doc || !isValidDocType(docType)) {
    return (
      <main className="mx-auto flex min-h-[60vh] w-full max-w-page items-center justify-center px-6 py-24 text-center">
        <div>
          <h1 className="font-display text-2xl font-bold">Falta el documento a consultar.</h1>
          <p className="mt-3 text-foreground/62">
            Vuelve al inicio y busca un NIT, cédula o nombre.
          </p>
        </div>
      </main>
    );
  }

  let expediente: Expediente | null = null;
  let errorMessage: string | null = null;

  try {
    const qs = name ? `?name=${encodeURIComponent(name)}` : "";
    expediente = await fetchRastroApi<Expediente>(`/api/entity/${docType}/${encodeURIComponent(doc)}${qs}`);
  } catch (err) {
    errorMessage = err instanceof ApiError ? err.message : "No fue posible construir el expediente.";
  }

  return (
    <main className="flex flex-grow flex-col">
      <EntityHeader doc={doc} docType={docType} name={name} expediente={expediente} error={errorMessage} />

      {expediente && (
        <div className="flex-grow bg-surface-bright pb-24">
          <div className="mx-auto max-w-page px-6 pt-8 lg:px-12">
            <AiSummary doc={doc} docType={docType} name={name} />

            <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
              <div className="flex flex-col gap-6 xl:col-span-2">
                <h3 className="flex items-center gap-2 border-b border-outline-variant/30 pb-4 font-headline text-2xl font-bold text-on-surface">
                  <span className="material-symbols-outlined text-primary">fact_check</span>
                  Evidencia por fuente
                </h3>
                <EvidenceList evidence={expediente.evidence} />
              </div>

              <div className="flex flex-col gap-6 xl:col-span-1">
                <h3 className="flex items-center gap-2 border-b border-outline-variant/30 pb-4 font-headline text-2xl font-bold text-on-surface">
                  <span className="material-symbols-outlined text-primary">history</span>
                  Historial SECOP
                </h3>
                <ContractHistory contractHistory={expediente.contractHistory} />
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
