import { Hero } from "./home/hero";
import { ModeCards } from "./home/mode-cards";
import { Stats } from "./home/stats";
import { EvidenceBand } from "./home/evidence-band";

/**
 * Home view — literal port of the Stitch mockup's page structure: hero →
 * bento grid (mode cards) → stats band → evidence-levels band. Server
 * Component: every animated/interactive piece is a client leaf imported
 * from `home/`.
 */
export const HomeView = () => {
  return (
    <main>
      <Hero />

      <section className="mx-auto max-w-page px-6 py-24">
        <ModeCards />
      </section>

      <Stats />
      <EvidenceBand />
    </main>
  );
};
