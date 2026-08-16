import { normalizeText } from "./normalize.js";

/**
 * Módulo — Concentración de contratistas (Modo Transparencia).
 *
 * Para una entidad contratante, mide qué tan repartidas o concentradas están
 * sus adjudicaciones entre proveedores. Es la versión honesta del "mapa de
 * relaciones entre consorcios/UT" del documento de proyecto: Croma no expone
 * los integrantes de un consorcio como datos estructurados (no son persona
 * jurídica propia, no se registran en RUES — verificado consultando Croma
 * directamente), así que en vez de adivinar integrantes a partir del nombre
 * en texto libre, esto usa el proveedor y valor REALES de cada adjudicación
 * (secopProcess) y solo marca `isGroup` cuando el ganador fue un consorcio/UT,
 * sin inventar su composición.
 *
 * No se filtra por `phase` para decidir qué proceso ya está "cerrado": Croma
 * es inconsistente ahí (`procedure_status` puede decir "Seleccionado" con
 * `phase` todavía en una fase temprana — el propio Módulo 5 ya documentó esto
 * en opportunitySeeds.js). La única señal confiable de que hubo adjudicación
 * es que el detalle del proceso traiga `contracts` con valor — así que se
 * abre en detalle una muestra de los procesos más recientes y se deja que esa
 * señal real decida, en vez de adivinar con el texto de `phase`.
 */

function withTimeout(promise, ms, onTimeoutValue) {
  let timer;
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => resolve(onTimeoutValue), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

// Acota cuántos procesos se abren en detalle por consulta: cada uno es una
// llamada Croma aparte (secopProcess), en paralelo pero cada una puede tardar
// hasta 30s del lado de Croma. No todos los de la muestra van a tener
// adjudicación todavía (varios seguirán en trámite) — el tope es generoso
// para compensar eso.
const SAMPLE_CAP = 20;
const PROCESS_TIMEOUT_MS = 12000;
const TOP_N = 5;

function providerKey(name) {
  return normalizeText(name || "").toLowerCase().trim();
}

export async function buildConcentration(source, entityNit, { windowDays = 365 } = {}) {
  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - windowDays);
  const fromDateStr = fromDate.toISOString().slice(0, 10);

  // Más generoso que el tope de 10s de Modo Oportunidad (services/opportunities.js):
  // esto es una consulta de insight bajo demanda, no un listado que el usuario
  // espera ver instantáneo — vale la pena darle más margen a Croma antes de
  // degradar a "sin datos suficientes todavía".
  const { processes } = await withTimeout(
    source.secopProcessesByEntity(entityNit, { fromDate: fromDateStr }),
    18000,
    { processes: [] },
  );

  const sorted = [...processes].sort((a, b) => (b.publishedDate || "").localeCompare(a.publishedDate || ""));
  const entityName = sorted[0]?.entity || null;
  const sample = sorted.slice(0, SAMPLE_CAP);

  const details = await Promise.all(
    sample.map((p) =>
      withTimeout(source.secopProcess(p.noticeUid), PROCESS_TIMEOUT_MS, { found: false, contracts: [] }),
    ),
  );

  const providers = new Map();
  let totalValueAnalyzed = 0;
  let processesOpened = 0;
  const awardedProcessKeys = new Set();

  for (const [i, detail] of details.entries()) {
    if (!detail?.found) continue;
    processesOpened += 1;
    for (const c of detail.contracts || []) {
      if (typeof c.value !== "number" || c.value <= 0 || !c.provider) continue;
      awardedProcessKeys.add(sample[i].noticeUid);
      const key = providerKey(c.provider);
      if (!providers.has(key)) {
        providers.set(key, { name: c.provider, document: c.providerDocument || null, contractCount: 0, totalValue: 0, hasGroupContract: false, lastDate: null });
      }
      const entry = providers.get(key);
      entry.contractCount += 1;
      entry.totalValue += c.value;
      entry.hasGroupContract = entry.hasGroupContract || !!c.isGroup;
      if (!entry.lastDate || (c.signDate && c.signDate > entry.lastDate)) entry.lastDate = c.signDate || entry.lastDate;
      totalValueAnalyzed += c.value;
    }
  }

  const ranked = [...providers.values()].sort((a, b) => b.totalValue - a.totalValue);
  const topProviders = ranked.slice(0, TOP_N).map((p) => ({
    ...p,
    pctOfValue: totalValueAnalyzed > 0 ? Math.round((p.totalValue / totalValueAnalyzed) * 1000) / 10 : 0,
  }));
  const top3Value = ranked.slice(0, 3).reduce((sum, p) => sum + p.totalValue, 0);

  return {
    entityNit,
    entityName,
    windowDays,
    totalProcessesInWindow: sorted.length,
    sampleSize: sample.length,
    processesOpened,
    processesAwarded: awardedProcessKeys.size,
    capped: sorted.length > sample.length,
    totalValueAnalyzed,
    providerCount: providers.size,
    topProviders,
    top3ConcentrationPct: totalValueAnalyzed > 0 ? Math.round((top3Value / totalValueAnalyzed) * 1000) / 10 : null,
    generatedAt: new Date().toISOString(),
  };
}
