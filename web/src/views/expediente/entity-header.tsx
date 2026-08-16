import type { Expediente, EvidenceLevel } from "@/types/rastro";

interface EntityHeaderProps {
  doc: string;
  docType: string;
  name?: string;
  expediente: Expediente | null;
  error: string | null;
}

const LEVEL_ORDER: EvidenceLevel[] = ["alto", "sin_hallazgo", "limpio"];
const LEVEL_NOUN: Record<EvidenceLevel, string> = {
  alto: "Alto",
  sin_hallazgo: "Sin hallazgo",
  limpio: "Limpio",
};
const LEVEL_COUNTER_CLASS: Record<EvidenceLevel, string> = {
  alto: "bg-error-container/20 border-error-container/30 text-tertiary-fixed-dim",
  sin_hallazgo: "bg-surface-variant/10 border-surface-variant/20 text-surface-variant",
  limpio: "bg-primary-container/30 border-primary-fixed/30 text-primary-fixed",
};

/** Dark header banner — literal port of the Stitch expediente mockup's hero. */
export const EntityHeader = ({ doc, docType, expediente, error }: EntityHeaderProps) => {
  const displayName = expediente?.name || `Documento ${doc}`;

  const chips = [{ icon: "tag", label: `${docType}: ${doc}` }];
  if (expediente?.rues) chips.push({ icon: "verified", label: `RUES: ${expediente.rues.status}` });

  return (
    <section className="relative shrink-0 overflow-hidden bg-[#0a0a0a] px-6 pt-12 pb-16 text-white lg:px-12">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary-container/20 to-transparent" />
      <div className="relative z-10 mx-auto flex max-w-page flex-col gap-6">
        <a
          href="/"
          className="inline-flex w-max items-center gap-2 font-label text-sm font-medium text-outline-variant transition-colors hover:text-primary-fixed"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Nueva búsqueda
        </a>

        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-end">
          <div className="flex flex-col gap-4">
            <h1 className="font-headline text-4xl leading-tight font-extrabold tracking-tight text-white lg:text-5xl">
              {error ? "No fue posible construir el expediente." : displayName}
            </h1>
            {error ? (
              <p className="text-[0.9rem] text-red-300">{error}</p>
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                {chips.map((chip) => (
                  <span
                    key={chip.label}
                    className="inline-flex items-center gap-1.5 rounded-full border border-surface-variant/20 bg-surface-variant/10 px-3 py-1 font-label text-sm text-surface-variant backdrop-blur-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">{chip.icon}</span>
                    {chip.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {expediente && (
            <div className="flex shrink-0 gap-3 self-start rounded-xl border border-white/5 bg-inverse-surface/50 p-2 backdrop-blur-md lg:self-auto">
              {LEVEL_ORDER.map((level) => (
                <div
                  key={level}
                  className={`flex min-w-[5.625rem] flex-col items-center justify-center rounded-lg border px-4 py-2 ${LEVEL_COUNTER_CLASS[level]}`}
                >
                  <span className="font-headline text-2xl font-bold">{expediente.counts[level]}</span>
                  <span className="text-center text-xs tracking-wider uppercase font-label">{LEVEL_NOUN[level]}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
