"use client";

import { useEffect, useState } from "react";

import { apiFetch } from "@/lib/api-client";
import type { MetaResponse } from "@/types/rastro";

type BadgeState = "loading" | "live" | "degraded" | "mock" | "error";

const FOOTER_LINKS = ["Fuentes Oficiales", "Términos de Uso", "Privacidad", "Metodología de Riesgo"];

/**
 * Site-wide footer — mounted once in the root layout. Literal port of the
 * Stitch mockup's footer (wordmark + nav links + copyright), with the
 * functional live-data-source badge (Módulo 7 — resiliencia) preserved
 * below the copyright line. Client Component: fetches `/api/meta` after
 * mount to show whether Croma is live or the request degraded to the
 * local fallback.
 */
export const SiteFooter = () => {
  const [state, setState] = useState<BadgeState>("loading");

  useEffect(() => {
    let cancelled = false;
    apiFetch<MetaResponse>("/api/meta")
      .then((meta) => {
        if (cancelled) return;
        if (meta.degraded) setState("degraded");
        else if (meta.dataSource === "croma") setState("live");
        else setState("mock");
      })
      .catch(() => !cancelled && setState("error"));
    return () => {
      cancelled = true;
    };
  }, []);

  const badgeCopy: Record<BadgeState, string> = {
    loading: "Cargando fuente de datos…",
    live: "Conectado a Croma en vivo",
    degraded: "Fuente: respaldo local (Croma no disponible)",
    mock: "Modo demo (datos de respaldo)",
    error: "Fuente de datos no disponible",
  };

  return (
    <footer className="mt-auto flex w-full flex-col items-center gap-8 border-t border-on-surface-variant/30 bg-inverse-surface px-6 py-12 text-surface-variant">
      <span className="font-display text-lg font-black tracking-tighter text-primary-fixed uppercase">RASTRO</span>

      <nav aria-label="Legal" className="flex flex-wrap justify-center gap-6 font-label text-sm">
        {FOOTER_LINKS.map((label) => (
          <a
            key={label}
            href="#"
            className="text-surface-variant decoration-primary-fixed transition-colors hover:text-primary-fixed hover:underline"
          >
            {label}
          </a>
        ))}
      </nav>

      <p className="max-w-xl text-center text-xs opacity-80">
        RASTRO no crea información nueva ni emite veredictos. Toda la evidencia mostrada es pública por ley, con su fuente oficial
        citada y fecha de consulta — preservando la presunción de inocencia.
      </p>

      <div className="flex flex-col items-center gap-2 text-xs opacity-70">
        <span>Hackathon Croma / Datos Abiertos Colombia — RASTRO, {new Date().getFullYear()}.</span>
        <span className="inline-flex items-center gap-2 rounded-full border border-surface-variant/20 bg-surface-variant/10 px-3 py-1">
          <span
            className={`size-1.75 rounded-full ${state === "live" ? "bg-primary-fixed" : "bg-brand-accent"}`}
            aria-hidden="true"
          />
          {badgeCopy[state]}
        </span>
      </div>
    </footer>
  );
};
