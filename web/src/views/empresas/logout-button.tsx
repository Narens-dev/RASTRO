"use client";

import { useRouter } from "next/navigation";

import { apiFetch } from "@/lib/api-client";

export const LogoutButton = () => {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await apiFetch("/api/companies/logout", { method: "POST" }).catch(() => {});
        router.push("/empresas/login");
        router.refresh();
      }}
      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-error-container hover:text-on-error-container"
    >
      <span className="material-symbols-outlined text-[18px]">logout</span>
      Cerrar sesión
    </button>
  );
};
