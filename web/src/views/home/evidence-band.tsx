import { Inview } from "@/components/animation/springs/in-view";

interface Level {
  label: string;
  dotClass: string;
  description: string;
}

const LEVELS: Level[] = [
  {
    label: "Alto",
    dotClass: "bg-error border-error",
    description:
      "Hallazgo verificable con impacto directo (financiero, judicial o disciplinario).",
  },
  {
    label: "Sin hallazgo",
    dotClass: "bg-outline border-outline",
    description:
      'Fuente consultada sin resultado. No es "limpio"; algunas fuentes tienen subregistro documentado.',
  },
  {
    label: "Limpio",
    dotClass: "bg-[#16a34a] border-[#16a34a]",
    description:
      "Verificación positiva explícita de la fuente oficial confirmando el buen estado.",
  },
];

/** Full-bleed dark band — literal port of the Stitch mockup's evidence-levels section. */
export const EvidenceBand = () => {
  return (
    <section className="bg-inverse-surface px-6 py-24 text-surface-variant">
      <div className="mx-auto max-w-5xl text-center">
        <Inview tag="h2" from={{ opacity: 0, y: 16 }} to={{ opacity: 1, y: 0 }} mode="once" className="mb-6 font-display text-3xl font-bold text-white">
          Niveles de Evidencia Claros
        </Inview>
        <p className="mx-auto mb-12 max-w-2xl font-body text-lg opacity-90">
          Nuestra interfaz visualiza la información de forma disciplinada.{" "}
          <strong className="text-white">Nunca combinamos hallazgos en un puntaje único de riesgo.</strong> Cada
          fuente mantiene su independencia.
        </p>
        <div className="grid gap-6 text-left md:grid-cols-3">
          {LEVELS.map((level, i) => (
            <Inview
              key={level.label}
              tag="div"
              from={{ opacity: 0, y: 16 }}
              to={{ opacity: 1, y: 0 }}
              mode="once"
              delayIn={i * 90}
              className="rounded-xl border border-surface/10 bg-surface/5 p-6 backdrop-blur-sm"
            >
              <div className="mb-4 flex items-center gap-3">
                <span className={`size-4 rounded-full border ${level.dotClass}`} />
                <h3 className="font-display text-lg font-bold text-white">{level.label}</h3>
              </div>
              <p className="font-body text-sm leading-relaxed opacity-80">{level.description}</p>
            </Inview>
          ))}
        </div>
      </div>
    </section>
  );
};
