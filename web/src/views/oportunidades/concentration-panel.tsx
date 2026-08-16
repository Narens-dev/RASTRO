"use client";

import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api-client";
import type { ConcentrationResponse, MetaResponse, SeedEntity } from "@/types/rastro";
import { formatCOP } from "@/utils/format";

type CardState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; data: ConcentrationResponse };

const ConcentrationCard = ({ entity }: { entity: SeedEntity }) => {
  const [state, setState] = useState<CardState>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    apiFetch<ConcentrationResponse>(`/api/concentration/${encodeURIComponent(entity.nit)}`)
      .then((data) => !cancelled && setState({ status: "ready", data }))
      .catch(() => !cancelled && setState({ status: "error" }));
    return () => {
      cancelled = true;
    };
  }, [entity.nit]);

  return (
    <div className="flex flex-col rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
      <p className="mb-1 flex items-center gap-1 font-body text-sm text-on-surface-variant">
        <span className="material-symbols-outlined text-[16px]">account_balance</span>
        {entity.name}, {entity.location}
      </p>

      {state.status === "loading" && (
        <p className="mt-4 font-body text-sm text-on-surface-variant italic">
          Analizando adjudicaciones recientes de esta entidad…
        </p>
      )}

      {state.status === "error" && (
        <p className="mt-4 font-body text-sm text-on-surface-variant italic">
          No fue posible calcular esto en este momento — Croma puede estar lento para esta entidad. Intenta de nuevo en unos segundos.
        </p>
      )}

      {state.status === "ready" && state.data.processesAwarded === 0 && (
        <p className="mt-4 font-body text-sm text-on-surface-variant italic">
          Sin adjudicaciones cerradas en los {state.data.sampleSize} procesos más recientes analizados — la mayoría sigue en trámite.
        </p>
      )}

      {state.status === "ready" && state.data.processesAwarded > 0 && (
        <div className="mt-3">
          <div className="mb-3 flex items-baseline gap-2">
            <span className="font-display text-3xl font-extrabold text-brand-accent">
              {state.data.top3ConcentrationPct}%
            </span>
            <span className="font-body text-sm text-on-surface-variant">
              del valor adjudicado analizado fue a los {Math.min(3, state.data.providerCount)} principales proveedores
            </span>
          </div>

          <ul className="flex flex-col gap-1.5">
            {state.data.topProviders.map((p) => (
              <li
                key={p.name}
                className="flex items-center justify-between gap-2 rounded-lg bg-surface-container px-3 py-2 text-sm"
              >
                <span className="truncate text-on-surface">
                  {p.hasGroupContract && <span title="Adjudicado a consorcio/unión temporal">🔗 </span>}
                  {p.name}
                  <span className="text-on-surface-variant"> ({p.contractCount})</span>
                </span>
                <span className="shrink-0 font-semibold text-on-surface">{p.pctOfValue}%</span>
              </li>
            ))}
          </ul>

          <p className="mt-3 font-body text-xs text-on-surface-variant">
            Muestra: {state.data.sampleSize} procesos más recientes ({state.data.processesAwarded} con adjudicación) ·{" "}
            {formatCOP(state.data.totalValueAnalyzed)} analizados
          </p>
        </div>
      )}
    </div>
  );
};

/**
 * Concentración de contratistas — para cada entidad semilla, qué tan
 * repartidas o concentradas están sus adjudicaciones recientes entre
 * proveedores. Ver src/services/concentration.js (backend) para el porqué
 * esto usa proveedor+valor real en vez de un mapa de integrantes de
 * consorcio (Croma no expone esa composición de forma estructurada).
 */
export const ConcentrationPanel = () => {
  const [entities, setEntities] = useState<SeedEntity[]>([]);

  useEffect(() => {
    apiFetch<MetaResponse>("/api/meta")
      .then((meta) => setEntities(meta.entities))
      .catch(() => {});
  }, []);

  if (!entities.length) return null;

  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="font-headline text-2xl font-bold text-on-surface">Concentración de contratistas</h2>
        <p className="mt-1 max-w-3xl font-body text-sm text-on-surface-variant">
          De una muestra de los procesos más recientes de cada entidad, qué porción del valor adjudicado se concentra en
          pocos proveedores. Dato real de SECOP — no es un juicio de irregularidad, es una señal para investigar más.
        </p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {entities.map((entity) => (
          <ConcentrationCard key={entity.nit} entity={entity} />
        ))}
      </div>
    </section>
  );
};
