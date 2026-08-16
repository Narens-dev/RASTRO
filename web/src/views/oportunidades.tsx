import { Explorer } from "./oportunidades/explorer";
import { ConcentrationPanel } from "./oportunidades/concentration-panel";

/** Modo Oportunidad (Módulo 5) — literal port of the Stitch mockup's dark hero + filters/results (client). */
export const OportunidadesView = () => {
  return (
    <main>
      <header className="relative overflow-hidden bg-inverse-surface px-6 pt-16 pb-20 text-inverse-on-surface">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-container/20 to-transparent" />
        <div className="relative z-10 mx-auto max-w-page">
          <h1 className="mb-6 font-display text-5xl font-extrabold tracking-tight text-surface-container-lowest md:text-6xl">
            Modo Oportunidad
          </h1>
          <p className="max-w-3xl font-body text-lg leading-relaxed text-surface-variant md:text-xl">
            Licitaciones <strong className="font-semibold text-primary-fixed">activas</strong> de SECOP. Filtra por sector y ubicación
            para encontrar oportunidades de negocio reales, descartando procesos cerrados.
          </p>
        </div>
      </header>

      <section className="px-6 py-12">
        <div className="mx-auto flex max-w-page flex-col gap-8">
          <ConcentrationPanel />
          <Explorer />
        </div>
      </section>
    </main>
  );
};
