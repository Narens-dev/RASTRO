"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { apiFetch, ApiClientError } from "@/lib/api-client";
import type { MetaResponse } from "@/types/rastro";

const inputWrapClass = "relative";
const inputClass =
  "block w-full rounded-lg border border-outline-variant bg-surface py-3 pr-3 pl-10 font-body text-sm text-on-surface transition-colors focus:border-primary focus:ring-2 focus:ring-primary";
const labelClass = "mb-1.5 block font-label text-sm font-semibold text-on-surface";
const iconClass = "material-symbols-outlined pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-outline";

/** Registro self-service — literal port of the Stitch mockup's card. Exige un NIT activo en RUES (mismo `source` que el resto de RASTRO) — no verifica representante legal. */
export const RegistroView = () => {
  const router = useRouter();
  const [sectors, setSectors] = useState<string[]>(["Todos"]);
  const [locations, setLocations] = useState<string[]>(["Todas"]);
  const [nit, setNit] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sector, setSector] = useState("Todos");
  const [location, setLocation] = useState("Todas");
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    setError(null);
    try {
      await apiFetch("/api/companies/register", {
        method: "POST",
        body: JSON.stringify({ nit, email, password, sector, location }),
      });
      router.push("/empresas/panel");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "No fue posible completar el registro.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex flex-col items-center px-4 py-16">
      <Image src="/logo-rastro-transparent.png" alt="RASTRO" width={408} height={142} className="mb-8 h-16 w-auto" priority />

      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-outline-variant/30 bg-surface-container-lowest shadow-lg">
        <div className="p-8 sm:p-10">
          <div className="mb-8 text-center">
            <h1 className="mb-3 font-headline text-2xl font-extrabold tracking-tight text-on-surface">Crea tu cuenta de empresa</h1>
            <p className="text-sm leading-relaxed text-on-surface-variant">
              Verificamos tu NIT contra el Registro Único Empresarial y Social (RUES) para garantizar un ecosistema transparente.
            </p>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label htmlFor="nit" className={labelClass}>NIT de la Empresa</label>
              <div className={inputWrapClass}>
                <span className={iconClass}>domain</span>
                <input
                  id="nit"
                  required
                  value={nit}
                  onChange={(e) => setNit(e.target.value)}
                  placeholder="Ej: 900.123.456-7"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className={labelClass}>Correo Corporativo</label>
              <div className={inputWrapClass}>
                <span className={iconClass}>mail</span>
                <input
                  id="email"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contacto@tuempresa.com.co"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>Contraseña</label>
              <div className={inputWrapClass}>
                <span className={iconClass}>lock</span>
                <input
                  id="password"
                  required
                  type="password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="sector" className={labelClass}>Sector de Interés</label>
              <div className={inputWrapClass}>
                <select id="sector" value={sector} onChange={(e) => setSector(e.target.value)} className={`${inputClass} appearance-none pl-3`}>
                  {sectors.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-outline">
                  expand_more
                </span>
              </div>
            </div>

            <div>
              <label htmlFor="location" className={labelClass}>Ubicación de Interés</label>
              <div className={inputWrapClass}>
                <select id="location" value={location} onChange={(e) => setLocation(e.target.value)} className={`${inputClass} appearance-none pl-3`}>
                  {locations.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-outline">
                  expand_more
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-outline-variant/30 bg-surface-container-low p-4">
              <span
                className="material-symbols-outlined mt-0.5 shrink-0 text-xl text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                notifications_active
              </span>
              <p className="text-xs leading-relaxed text-on-surface-variant">
                Recibirás un correo automático apenas RASTRO detecte una licitación nueva en SECOP que coincida con tu sector y
                ubicación.
              </p>
            </div>

            {error && <p className="text-sm text-error">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-lg border border-transparent bg-primary px-4 py-3.5 font-label text-sm font-bold text-on-primary shadow-sm transition-colors hover:bg-brand-emerald-dark disabled:opacity-60"
            >
              {loading ? "Creando cuenta…" : "Crear cuenta"}
            </button>
          </form>
        </div>

        <div className="border-t border-outline-variant/20 bg-surface-container px-8 py-5 text-center">
          <p className="text-sm text-on-surface-variant">
            ¿Ya tienes una cuenta verificada?{" "}
            <Link href="/empresas/login" className="font-bold text-brand-accent transition-colors hover:text-on-surface">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-4 font-label text-xs text-outline">
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">shield</span> Datos seguros
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <span className="material-symbols-outlined text-sm">verified</span> Conexión RUES
        </span>
      </div>
    </main>
  );
};
