"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { apiFetch, ApiClientError } from "@/lib/api-client";

const inputClass =
  "block w-full rounded-lg border border-outline-variant bg-surface-container-lowest py-3 pr-3 pl-10 font-body text-sm text-on-surface placeholder-outline transition-shadow focus:border-primary-container focus:ring-2 focus:ring-primary-container";
const labelClass = "mb-1.5 block font-label text-sm font-medium text-on-surface-variant";
const iconClass = "material-symbols-outlined pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-surface-tint";

/** Literal port of the Stitch mockup's login card, with the two soft blur orbs behind it. */
export const LoginView = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await apiFetch("/api/companies/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      router.push("/empresas/panel");
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "No fue posible iniciar sesión.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex flex-col items-center overflow-hidden px-4 py-16">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] size-[50%] rounded-full bg-primary-fixed/20 opacity-50 mix-blend-multiply blur-3xl" />
        <div className="absolute top-[60%] -right-[10%] size-[40%] rounded-full bg-secondary-fixed/20 opacity-50 mix-blend-multiply blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <Image src="/logo-rastro-transparent.png" alt="RASTRO" width={408} height={142} className="h-20 w-auto" priority />
        </div>

        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest/95 p-8 shadow-xl backdrop-blur-md sm:p-10">
          <h1 className="mb-8 text-center font-headline text-2xl font-bold tracking-tight text-on-surface">Inicia sesión</h1>

          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className={labelClass}>Correo electrónico</label>
              <div className="relative">
                <span className={iconClass}>mail</span>
                <input
                  id="email"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ejemplo@empresa.com"
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className={labelClass}>Contraseña</label>
              <div className="relative">
                <span className={iconClass}>lock</span>
                <input
                  id="password"
                  required
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                />
              </div>
              <div className="mt-2 text-right">
                <a href="#" className="font-label text-sm font-medium text-primary-container transition-colors hover:text-primary-fixed-dim">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
            </div>

            {error && <p className="text-sm text-error">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-lg border border-transparent bg-primary-container px-4 py-3.5 font-headline text-base font-bold text-on-primary shadow-sm transition-colors hover:bg-surface-tint active:scale-[0.98] disabled:opacity-60"
            >
              {loading ? "Entrando…" : "Iniciar sesión"}
            </button>
          </form>

          <div className="mt-8 text-center font-body text-sm text-on-surface-variant">
            ¿No tienes cuenta?{" "}
            <Link href="/empresas/registro" className="font-headline font-bold text-brand-accent transition-opacity hover:opacity-80">
              Regístrate
            </Link>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 font-label text-xs text-outline">
          <span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
            shield
          </span>
          <span>Acceso seguro a datos sensibles</span>
        </div>
      </div>
    </main>
  );
};
