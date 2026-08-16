"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Transparencia" },
  { href: "/oportunidades", label: "Modo Oportunidad" },
  { href: "/empresas", label: "Empresas" },
] as const;

/**
 * Sticky site navigation — mounted once in the root layout. Matches the
 * Stitch mockup nav 1:1 (logo, active-link underline, "Ingresar" pill).
 * Client Component: needs `usePathname` for the active-link state.
 */
export const SiteNav = () => {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 flex w-full items-center justify-between border-b border-on-surface-variant/20 bg-inverse-surface px-6 py-4 shadow-sm">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo-rastro-transparent.png"
            alt="RASTRO — Transparencia y Datos Abiertos Colombia"
            width={408}
            height={142}
            className="h-10 w-auto"
            priority
          />
        </Link>

        <nav aria-label="Principal" className="hidden gap-6 font-display text-sm tracking-tight md:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`pb-1 transition-colors hover:text-primary-fixed ${
                  active ? "border-b-2 border-primary-fixed text-primary-fixed" : "text-surface-variant"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <Link
          href="/empresas/login"
          className="hidden items-center justify-center rounded-full bg-primary px-6 py-2.5 font-label text-sm font-bold text-on-primary shadow-sm transition-colors hover:bg-brand-emerald-dark md:inline-flex"
        >
          Ingresar
        </Link>
      </div>
    </header>
  );
};
