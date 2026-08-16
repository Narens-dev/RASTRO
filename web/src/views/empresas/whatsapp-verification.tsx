"use client";

import { useState } from "react";

import { apiFetch, ApiClientError } from "@/lib/api-client";
import type { Company } from "@/types/rastro";

const inputClass =
  "w-full rounded-lg border border-outline-variant bg-surface-container-low p-3 text-sm focus:border-transparent focus:ring-2 focus:ring-primary-container";

interface RequestCodeResponse {
  phone: string;
  expiresAt: string;
  devCode?: string;
}

/**
 * Verificación de WhatsApp — pide un número, envía un código de 6 dígitos y
 * lo confirma. Sin un proveedor real de WhatsApp Business API conectado
 * (WHATSAPP_PROVIDER), el backend usa un adaptador simulado y devuelve el
 * código en la respuesta en vez de fingir un envío real — se muestra aquí
 * marcado explícitamente como "modo demo", nunca como si hubiera llegado un
 * mensaje real al teléfono.
 */
export const WhatsAppVerification = ({ company }: { company: Company }) => {
  const [whatsapp, setWhatsapp] = useState(company.whatsapp ?? null);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [stage, setStage] = useState<"idle" | "code_sent">("idle");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<RequestCodeResponse>("/api/companies/me/whatsapp/request-code", {
        method: "POST",
        body: JSON.stringify({ phone: phone.trim() }),
      });
      setStage("code_sent");
      setDevCode(res.devCode ?? null);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "No fue posible enviar el código.");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await apiFetch<{ company: Company }>("/api/companies/me/whatsapp/verify", {
        method: "POST",
        body: JSON.stringify({ code: code.trim() }),
      });
      setWhatsapp(res.company.whatsapp ?? null);
      setStage("idle");
      setDevCode(null);
      setCode("");
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "No fue posible verificar el código.");
    } finally {
      setLoading(false);
    }
  };

  if (whatsapp) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-lg border border-outline-variant bg-surface-container-low p-4">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary-container">check_circle</span>
          <div>
            <p className="text-sm font-semibold text-on-surface">{whatsapp.number}</p>
            <p className="text-xs text-on-surface-variant">Verificado</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setWhatsapp(null)}
          className="text-xs font-semibold text-primary-container hover:underline"
        >
          Cambiar número
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {stage === "idle" && (
        <form onSubmit={requestCode} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-2 block text-xs font-semibold tracking-wide text-on-surface-variant uppercase">
              Número de WhatsApp
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+57 300 1234567"
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-primary-container px-6 py-3 text-sm font-semibold text-on-primary-container transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Enviando…" : "Enviar código"}
          </button>
        </form>
      )}

      {stage === "code_sent" && (
        <form onSubmit={verifyCode} className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="mb-2 block text-xs font-semibold tracking-wide text-on-surface-variant uppercase">
              Código de 6 dígitos enviado a {phone}
            </label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="123456"
              maxLength={6}
              className={inputClass}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-primary-container px-6 py-3 text-sm font-semibold text-on-primary-container transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {loading ? "Verificando…" : "Verificar"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStage("idle");
                setDevCode(null);
              }}
              className="rounded-lg border border-outline-variant px-4 py-3 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}

      {devCode && (
        <p className="rounded-lg border border-brand-accent/40 bg-brand-accent/10 p-3 text-xs text-on-surface">
          <strong>Modo demo — sin proveedor de WhatsApp real conectado.</strong> No se envió un mensaje de verdad; tu código es{" "}
          <span className="font-mono font-bold">{devCode}</span>.
        </p>
      )}

      {error && <p className="text-sm text-error">{error}</p>}
    </div>
  );
};
