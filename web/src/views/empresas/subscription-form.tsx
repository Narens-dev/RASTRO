"use client";

import { useEffect, useState } from "react";

import { apiFetch, ApiClientError } from "@/lib/api-client";
import type { Company, MetaResponse } from "@/types/rastro";

const selectClass =
  "w-full rounded-lg border border-outline-variant bg-surface-container-low p-3 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-container";

/** Preferencias de alerta de Modo Oportunidad — literal port of the Stitch mockup's "Alertas de Oportunidad" card. Client leaf dentro del panel (Server Component). */
export const SubscriptionForm = ({ company }: { company: Company }) => {
  const [sectors, setSectors] = useState<string[]>(["Todos"]);
  const [locations, setLocations] = useState<string[]>(["Todas"]);
  const [active, setActive] = useState(company.subscription.active);
  const [sector, setSector] = useState(company.subscription.sector);
  const [location, setLocation] = useState(company.subscription.location);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<MetaResponse>("/api/meta")
      .then((meta) => {
        setSectors(meta.sectors);
        setLocations(meta.locations);
      })
      .catch(() => {});
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await apiFetch("/api/companies/me", {
        method: "PUT",
        body: JSON.stringify({ active, sector, location }),
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "No fue posible guardar los cambios.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex h-full flex-col justify-between">
      <div>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="flex items-center gap-2 font-headline text-xl font-bold text-on-surface">
              <span className="material-symbols-outlined text-primary-container">campaign</span>
              Alertas de Oportunidad
            </h2>
            <p className="mt-1 text-sm text-on-surface-variant">Recibe notificaciones automáticas de nuevas licitaciones en SECOP.</p>
          </div>
          <label className="relative inline-flex shrink-0 cursor-pointer items-center">
            <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="peer sr-only" />
            <div className="h-6 w-11 rounded-full bg-surface-variant transition-colors after:absolute after:top-[2px] after:left-[2px] after:size-5 after:rounded-full after:border after:border-outline after:bg-white after:transition-all after:content-[''] peer-checked:bg-primary-container peer-checked:after:translate-x-full peer-checked:after:border-white" />
            <span className="ml-3 text-sm font-medium text-on-surface-variant">Activas</span>
          </label>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold tracking-wide text-on-surface-variant uppercase">Sector de Interés</label>
            <select value={sector} onChange={(e) => setSector(e.target.value)} className={selectClass}>
              {sectors.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-xs font-semibold tracking-wide text-on-surface-variant uppercase">Ubicación</label>
            <select value={location} onChange={(e) => setLocation(e.target.value)} className={selectClass}>
              {locations.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        {error && <p className="text-sm text-error">{error}</p>}
        {saved && !error && <p className="text-sm text-primary">Preferencias guardadas.</p>}
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-primary-container px-6 py-2.5 text-sm font-semibold text-on-primary-container transition-opacity hover:opacity-90 disabled:opacity-60"
        >
          {saving ? "Guardando…" : "Guardar Cambios"}
          <span className="material-symbols-outlined text-sm">save</span>
        </button>
      </div>
    </form>
  );
};
