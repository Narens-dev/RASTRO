import { redirect } from "next/navigation";

import { fetchRastroApi } from "@/lib/rastro-api";
import { ApiError } from "@/lib/api";
import { getAuthToken } from "@/lib/auth-cookie";
import type { Company, OpportunityNotification } from "@/types/rastro";

import { SubscriptionForm } from "./subscription-form";
import { PersonaSearch } from "./persona-search";
import { LogoutButton } from "./logout-button";

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("es-CO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
  } catch {
    return iso;
  }
}

const SIDEBAR_LINKS = [
  { icon: "dashboard", label: "Panel Principal", active: true },
  { icon: "notifications_active", label: "Mis Alertas", active: false },
  { icon: "shield_person", label: "Estudios de Seguridad", active: false },
];

/** Panel de empresa — literal port of the Stitch mockup's sidebar + bento grid. Server Component: resuelve sesión + datos server-side, deja la interacción a los leaves. */
export const PanelView = async () => {
  const token = await getAuthToken();
  if (!token) redirect("/empresas/login");

  let company: Company;
  let notifications: OpportunityNotification[] = [];

  try {
    const authHeader = { Authorization: `Bearer ${token}` };
    const [meRes, notifRes] = await Promise.all([
      fetchRastroApi<{ company: Company }>("/api/companies/me", { headers: authHeader }),
      fetchRastroApi<{ notifications: OpportunityNotification[] }>("/api/companies/me/notifications", { headers: authHeader }),
    ]);
    company = meRes.company;
    notifications = notifRes.notifications;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) redirect("/empresas/login");
    throw err;
  }

  return (
    <main className="mx-auto flex w-full max-w-page flex-col gap-8 px-6 py-12 lg:flex-row lg:px-12">
      <aside className="hidden w-64 shrink-0 flex-col rounded-xl border-r border-outline-variant bg-surface-container-low py-6 font-body text-sm lg:flex">
        <div className="mb-8 px-6">
          <div className="mb-2 font-headline text-xl font-bold text-on-surface">Panel Principal</div>
          <div className="text-xs text-on-surface-variant">Suscripción Activa</div>
        </div>
        <nav className="flex flex-1 flex-col gap-2 px-4">
          {SIDEBAR_LINKS.map((link) => (
            <a
              key={link.label}
              href="#"
              className={`mx-2 flex items-center gap-3 rounded-lg p-3 transition-all ${
                link.active
                  ? "bg-secondary-container font-semibold text-on-secondary-container"
                  : "text-on-surface-variant hover:bg-surface-variant"
              }`}
            >
              <span className="material-symbols-outlined">{link.icon}</span>
              {link.label}
            </a>
          ))}
        </nav>
        <div className="mt-auto px-6">
          <a
            href="#estudio-seguridad"
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-container py-3 font-semibold text-on-primary-container transition-opacity hover:opacity-90"
          >
            <span className="material-symbols-outlined">add</span>
            Nueva Búsqueda
          </a>
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-outline-variant px-4 pt-4">
          <a href="#" className="mx-2 flex items-center gap-3 rounded-lg p-2 text-sm text-on-surface-variant transition-all hover:bg-surface-variant">
            <span className="material-symbols-outlined text-sm">settings</span>
            Configuración
          </a>
          <a href="#" className="mx-2 flex items-center gap-3 rounded-lg p-2 text-sm text-on-surface-variant transition-all hover:bg-surface-variant">
            <span className="material-symbols-outlined text-sm">help_outline</span>
            Soporte
          </a>
        </div>
      </aside>

      <div className="flex flex-1 flex-col gap-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-black text-on-surface">Mi Empresa</h1>
            <p className="mt-2 text-on-surface-variant">Gestiona tus alertas de contratación y estudios de seguridad.</p>
            <p className="mt-1 text-sm text-on-surface-variant">
              NIT {company.nit} · {company.email}
            </p>
          </div>
          <LogoutButton />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          <div className="col-span-1 flex flex-col justify-between rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm md:col-span-2">
            <SubscriptionForm company={company} />
          </div>

          <div className="group relative col-span-1 flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-brand-emerald-dark to-[#00210d] p-6 text-on-primary shadow-md">
            <div aria-hidden="true" className="absolute -top-12 -right-12 size-48 rounded-full bg-primary-container opacity-20 blur-3xl transition-opacity duration-700 group-hover:opacity-40" />
            <div>
              <div className="mb-6 flex size-12 items-center justify-center rounded-full border border-primary-container/30 bg-inverse-surface shadow-inner">
                <span className="material-symbols-outlined text-brand-accent">shield_lock</span>
              </div>
              <h2 className="mb-3 font-headline text-xl font-bold text-surface-bright">Estudio de Seguridad</h2>
              <p className="mb-6 text-sm leading-relaxed text-surface-dim">
                Herramienta restringida para consultar antecedentes de una persona por cédula antes de contratar. Acceso exclusivo
                para empresas verificadas.
              </p>
            </div>
            <a
              href="#estudio-seguridad"
              className="mt-auto flex w-full items-center justify-center gap-2 rounded-lg bg-brand-accent px-4 py-3 text-sm font-bold text-inverse-surface transition-opacity hover:opacity-90"
            >
              <span className="material-symbols-outlined text-sm">search</span>
              Buscar por Cédula
            </a>
          </div>

          <div className="col-span-1 rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm xl:col-span-3">
            <h2 className="mb-4 flex items-center gap-2 font-headline text-lg font-bold text-on-surface">
              <span className="material-symbols-outlined text-primary">history</span>
              Historial de notificaciones enviadas
            </h2>

            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-on-surface-variant">
                Aún no se ha enviado ninguna alerta a tu correo. Cuando salga una oportunidad nueva que coincida con tu
                sector/ubicación aparecerá aquí.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start gap-4 rounded-xl border border-transparent p-4 transition-colors hover:border-outline-variant/30 hover:bg-surface-container-low"
                  >
                    <div className="mt-1 rounded-lg bg-secondary-container/50 p-2 text-on-secondary-container">
                      <span className="material-symbols-outlined text-sm">mail</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-on-surface">{n.subject}</h3>
                    </div>
                    <span className="text-xs font-medium whitespace-nowrap text-outline">{formatDate(n.sentAt)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <section id="estudio-seguridad" className="scroll-mt-24 rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
          <h2 className="mb-1 flex items-center gap-2 font-headline text-lg font-bold text-on-surface">
            <span className="material-symbols-outlined text-primary">shield_person</span>
            Estudio de seguridad por cédula
          </h2>
          <p className="mb-4 text-sm text-on-surface-variant">
            Antecedentes penales, disciplinarios y fiscales, procesos judiciales, afiliación a EPS y multas de tránsito —
            cruzados en un solo dossier. Uso restringido a encargados de contratación/RRHH; consultar a alguien sin su
            consentimiento puede tener implicaciones legales bajo la Ley de Habeas Data (Ley 1581/2012).
          </p>
          <PersonaSearch />
        </section>
      </div>
    </main>
  );
};
