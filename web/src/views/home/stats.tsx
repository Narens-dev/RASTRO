import { Inview } from "@/components/animation/springs/in-view";

interface Stat {
  value: string;
  colorClass: string;
  label: string;
  detail: string;
}

const STATS: Stat[] = [
  {
    value: "6",
    colorClass: "text-primary",
    label: "Fuentes Cruzadas",
    detail: "SECOP, RUES, Rama Judicial, Procuraduría, Contraloría, Contaduría",
  },
  {
    value: "0",
    colorClass: "text-brand-accent",
    label: "Veredictos Emitidos",
    detail: "Los datos hablan, nosotros no juzgamos.",
  },
  {
    value: "100%",
    colorClass: "text-on-surface",
    label: "Información Pública",
    detail: "Transparencia basada en datos abiertos legales.",
  },
];

/** Stats band — literal port of the Stitch mockup's stats section. */
export const Stats = () => {
  return (
    <section className="border-y border-outline-variant/30 bg-surface-container-lowest px-6 py-16">
      <div className="mx-auto grid max-w-page grid-cols-1 divide-y divide-outline-variant/50 text-center md:grid-cols-3 md:divide-x md:divide-y-0">
        {STATS.map((stat, i) => (
          <Inview
            key={stat.label}
            tag="div"
            from={{ opacity: 0, y: 18 }}
            to={{ opacity: 1, y: 0 }}
            mode="once"
            delayIn={i * 90}
            className="px-6 py-4"
          >
            <div className={`mb-2 font-display text-4xl font-black ${stat.colorClass}`}>{stat.value}</div>
            <div className="font-label text-sm font-semibold tracking-wider text-on-surface-variant uppercase">
              {stat.label}
            </div>
            <p className="mt-2 text-xs text-outline">{stat.detail}</p>
          </Inview>
        ))}
      </div>
    </section>
  );
};
