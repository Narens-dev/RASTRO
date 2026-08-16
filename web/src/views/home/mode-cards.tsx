import Link from "next/link";

import { Inview } from "@/components/animation/springs/in-view";
import { Hover } from "@/components/animation/springs/hover";

interface ModeCardProps {
  href: string;
  tone: "transparencia" | "oportunidad";
  icon: string;
  title: string;
  description: string;
  cta: string;
  delayIn: number;
}

const ICON_BOX_STYLES: Record<ModeCardProps["tone"], string> = {
  transparencia: "bg-primary-container/10 text-primary",
  oportunidad: "bg-brand-accent/10 text-brand-accent",
};

const CORNER_STYLES: Record<ModeCardProps["tone"], string> = {
  transparencia: "bg-primary/5",
  oportunidad: "bg-brand-accent/5",
};

const CTA_STYLES: Record<ModeCardProps["tone"], string> = {
  transparencia: "text-primary hover:text-brand-emerald-dark",
  oportunidad: "text-brand-accent hover:opacity-80",
};

const ModeCard = ({ href, tone, icon, title, description, cta, delayIn }: ModeCardProps) => (
  <Inview tag="div" from={{ opacity: 0, y: 24 }} to={{ opacity: 1, y: 0 }} mode="once" delayIn={delayIn}>
    <Hover tag="div" from={{ y: 0 }} to={{ y: -4 }} config={{ tension: 260, friction: 22 }}>
      <Link
        href={href}
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface p-8 shadow-sm transition-shadow hover:shadow-md"
      >
        <div aria-hidden="true" className={`absolute top-0 right-0 -z-10 size-32 rounded-bl-[6.25rem] transition-transform group-hover:scale-110 ${CORNER_STYLES[tone]}`} />
        <div className="mb-6 flex items-center gap-4">
          <div className={`grid size-12 place-items-center rounded-xl ${ICON_BOX_STYLES[tone]}`}>
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
              {icon}
            </span>
          </div>
          <h2 className="font-display text-2xl font-bold text-on-surface">{title}</h2>
        </div>
        <p className="mb-8 flex-grow font-body text-on-surface-variant">{description}</p>
        <span className={`inline-flex items-center gap-2 font-label font-bold transition-colors ${CTA_STYLES[tone]}`}>
          {cta}
          <span className="material-symbols-outlined transition-transform group-hover:translate-x-1" aria-hidden="true">
            arrow_forward
          </span>
        </span>
      </Link>
    </Hover>
  </Inview>
);

/**
 * Bento grid — literal port of the Stitch mockup's "Modo Transparencia" /
 * "Modo Oportunidad" cards. Server Component; `Inview`/`Hover` are the
 * client leaves.
 */
export const ModeCards = () => {
  return (
    <div className="grid gap-8 md:grid-cols-2">
      <ModeCard
        href="/#buscar"
        tone="transparencia"
        icon="policy"
        title="Modo Transparencia"
        description="Accede a expedientes de riesgo sobre cualquier NIT o empresa. Cruzamos múltiples fuentes para presentarte niveles de evidencia claros y objetivos, sin emitir juicios de valor. Ideal para periodistas, veedurías y ciudadanos."
        cta="Ver ejemplo de expediente"
        delayIn={0}
      />
      <ModeCard
        href="/oportunidades"
        tone="oportunidad"
        icon="lightbulb"
        title="Modo Oportunidad"
        description="Licitaciones activas de SECOP filtrables por sector y ubicación. Pensado para que pymes encuentren oportunidades reales de negocio con el Estado. Suscríbete para recibir alertas automáticas."
        cta="Explorar licitaciones"
        delayIn={120}
      />
    </div>
  );
};
