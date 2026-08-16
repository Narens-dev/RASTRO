"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api-client";
import type { MetaResponse, OpportunitiesResponse } from "@/types/rastro";
import { OpportunityCard } from "./opportunity-card";

const VALUE_RANGES = [
  { label: "Cualquier Valor", value: "" },
  { label: "Hasta $50M", value: "0-50000000" },
  { label: "$50M – $200M", value: "50000000-200000000" },
  { label: "$200M – $500M", value: "200000000-500000000" },
  { label: "Más de $500M", value: "500000000-" },
] as const;

const SELECT_CLASS =
  "appearance-none rounded-full border border-outline-variant bg-surface-container-lowest py-2 pr-10 pl-4 font-body text-sm text-on-surface focus:border-primary focus:ring-2 focus:ring-primary";

const Select = ({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) => (
  <div className="relative">
    <select value={value} onChange={(e) => onChange(e.target.value)} className={SELECT_CLASS}>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
    <span
      aria-hidden="true"
      className="material-symbols-outlined pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-on-surface-variant"
    >
      expand_more
    </span>
  </div>
);

/** Filters + results grid for Modo Oportunidad — literal port of the Stitch mockup. Owns all filter state and refetches on change. */
export const Explorer = () => {
  const [sectors, setSectors] = useState<string[]>(["Todos"]);
  const [locations, setLocations] = useState<string[]>(["Todas"]);
  const [sector, setSector] = useState("Todos");
  const [location, setLocation] = useState("Todas");
  const [valueRange, setValueRange] = useState("");
  const [showWinners, setShowWinners] = useState(true);
  const [data, setData] = useState<OpportunitiesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<MetaResponse>("/api/meta")
      .then((meta) => {
        setSectors(meta.sectors);
        setLocations(meta.locations);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    const [minValue, maxValue] = valueRange.split("-");
    const params = new URLSearchParams();
    if (sector) params.set("sector", sector);
    if (location) params.set("location", location);
    if (minValue) params.set("minValue", minValue);
    if (maxValue) params.set("maxValue", maxValue);
    params.set("winners", String(showWinners));

    apiFetch<OpportunitiesResponse>(`/api/opportunities?${params.toString()}`)
      .then((res) => !cancelled && setData(res))
      .catch((err) => !cancelled && setError(err instanceof Error ? err.message : "Error"))
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [sector, location, valueRange, showWinners]);

  return (
    <>
      <section className="flex flex-col items-start justify-between gap-6 rounded-xl border border-outline-variant bg-surface-container-low p-4 md:flex-row md:items-center">
        <div className="flex w-full flex-wrap items-center gap-3 md:w-auto">
          <span className="mr-2 hidden font-label text-sm font-semibold tracking-wider text-on-surface-variant uppercase md:block">
            Filtros
          </span>
          <Select value={sector} onChange={setSector} options={sectors.map((s) => ({ label: s === "Todos" ? "Todos los Sectores" : s, value: s }))} />
          <Select
            value={location}
            onChange={setLocation}
            options={locations.map((l) => ({ label: l === "Todas" ? "Nivel Nacional" : l, value: l }))}
          />
          <Select value={valueRange} onChange={setValueRange} options={VALUE_RANGES as unknown as { label: string; value: string }[]} />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="show-winners"
            type="checkbox"
            checked={showWinners}
            onChange={(e) => setShowWinners(e.target.checked)}
            className="size-5 rounded border-outline-variant text-primary accent-primary-container focus:ring-primary"
          />
          <label htmlFor="show-winners" className="cursor-pointer font-body text-sm text-on-surface-variant">
            Mostrar ganadores anteriores
          </label>
        </div>
      </section>

      <section className="relative flex flex-col items-center justify-between gap-6 overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm md:flex-row">
        <div aria-hidden="true" className="absolute inset-y-0 left-0 w-2 bg-primary-container" />
        <div className="z-10 flex items-start gap-4">
          <span className="material-symbols-outlined mt-1 text-2xl text-primary-container" aria-hidden="true">
            campaign
          </span>
          <div>
            <h3 className="mb-1 font-headline text-lg font-bold text-on-surface">Automatiza tu búsqueda</h3>
            <p className="font-body text-on-surface-variant">
              No esperes a revisar esta página — recibe un correo apenas salga una oportunidad nueva en tu sector y ubicación.
            </p>
          </div>
        </div>
        <Link
          href="/empresas/registro"
          className="z-10 w-full shrink-0 rounded-lg bg-primary-container px-6 py-3 text-center font-label font-bold whitespace-nowrap text-on-primary shadow-sm transition-colors hover:bg-primary md:w-auto"
        >
          Suscribirme a alertas
        </Link>
      </section>

      <div className="mt-4 flex items-end justify-between border-b border-outline-variant pb-2">
        <span className="font-body text-sm font-medium text-on-surface-variant">
          {loading && "Buscando…"}
          {!loading && error && error}
          {!loading && !error && data && (
            <>
              Mostrando <strong className="text-on-surface">{data.count}</strong> licitaciones activas
            </>
          )}
        </span>
        <span className="flex items-center gap-1 font-body text-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-xs">info</span> Actualizado hace instantes
        </span>
      </div>

      {loading && (
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-20 text-center text-on-surface-variant">
          Cargando licitaciones activas…
        </div>
      )}

      {!loading && data && data.count === 0 && (
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-20 text-center text-on-surface-variant">
          <div className="material-symbols-outlined mb-3 text-3xl" aria-hidden="true">
            search_off
          </div>
          Sin licitaciones activas con estos filtros. Prueba ampliando el rango de valor o el sector.
        </div>
      )}

      {!loading && data && data.count > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {data.opportunities.map((o, i) => (
            <OpportunityCard key={o.noticeUid} opportunity={o} index={i} />
          ))}
        </div>
      )}
    </>
  );
};
