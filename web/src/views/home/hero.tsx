import TextEngine from "spring-text-engine";

import { Inview } from "@/components/animation/springs/in-view";
import { SearchBox } from "./search-box";

/**
 * Hero — literal port of the Stitch mockup's hero section (gradient bg,
 * decorative blur orbs, gradient headline text, white search pill). Server
 * Component: the text reveal and search interactivity live in client leaves
 * (`TextEngine`, `Inview`, `SearchBox`), not in this file.
 */
export const Hero = () => {
  return (
    <section className="hero-gradient-bg relative flex flex-col items-center justify-center overflow-hidden px-6 py-24 text-center md:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/4 left-1/4 size-96 rounded-full bg-primary/20 blur-[6.25rem]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-1/4 bottom-1/4 size-96 rounded-full bg-brand-accent/10 blur-[6.25rem]"
      />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center gap-8">
        <Inview
          tag="div"
          from={{ opacity: 0, y: 10 }}
          to={{ opacity: 1, y: 0 }}
          mode="once"
          className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 font-label text-sm text-primary-fixed backdrop-blur-sm"
        >
          <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
            emoji_events
          </span>
          Hackathon Croma · Datos Abiertos Colombia
        </Inview>

        <TextEngine
          tag="h1"
          mode="once"
          overflow
          className="text-5xl leading-display font-display font-extrabold tracking-tight text-white justify-center text-center md:text-7xl"
          lineIn={{ y: "0%", opacity: 1 }}
          lineOut={{ y: "100%", opacity: 0 }}
          lineStagger={90}
          lineConfig={{ tension: 210, friction: 26 }}
        >
          Sigue el <span className="gradient-text-brand">rastro</span> del dinero público.
        </TextEngine>

        <TextEngine
          tag="p"
          mode="once"
          className="max-w-3xl font-body text-lg leading-relaxed text-surface-variant justify-center text-center md:text-xl"
          wordIn={{ y: 0, opacity: 1 }}
          wordOut={{ y: 14, opacity: 0 }}
          wordStagger={12}
          wordConfig={{ tension: 220, friction: 24 }}
          delayIn={150}
        >
          Cruzamos en segundos 6 fuentes oficiales del Estado (SECOP, RUES, Rama
          Judicial, Procuraduría, Contraloría, Contaduría) para generar expedientes
          de riesgo trazables. Toda la evidencia es pública. RASTRO nunca emite un
          veredicto, solo cruza e interpreta.
        </TextEngine>

        <Inview
          tag="div"
          id="buscar"
          from={{ opacity: 0, y: 16 }}
          to={{ opacity: 1, y: 0 }}
          mode="once"
          delayIn={300}
          className="mt-8 w-full max-w-2xl scroll-mt-24"
        >
          <SearchBox />
        </Inview>
      </div>
    </section>
  );
};
