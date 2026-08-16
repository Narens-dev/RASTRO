/**
 * Site-wide configuration — the single source of truth for SEO.
 *
 * Consumed by the metadata generator, `robots.ts`, `sitemap.ts`, and the
 * JSON-LD structured-data helper.
 */
import { publicEnv } from "@/env";

export const siteConfig = {
  name: "RASTRO",
  description:
    "Sigue el rastro del dinero público. RASTRO cruza en segundos seis fuentes oficiales del Estado colombiano para generar un expediente de riesgo trazable y alertas de oportunidad de negocio para pymes.",
  /**
   * Public origin, no trailing slash. Drives canonical URLs, OG tags, the
   * sitemap, and JSON-LD. Set `NEXT_PUBLIC_SITE_URL` in production.
   */
  url: publicEnv.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100",
  /** Default Open Graph / Twitter share image (path under `public/`). */
  ogImage: "/open-graph.png",
  twitterHandle: "@rastro",
  author: "RASTRO",
  /** Browser theme-color (address bar / PWA). */
  themeColor: "#08090a",
} as const;
