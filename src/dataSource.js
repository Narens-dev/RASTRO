import { CromaAdapter } from "./adapters/CromaAdapter.js";
import { MockAdapter } from "./adapters/MockAdapter.js";
import { MemoryCache } from "./cache/memoryCache.js";

const PORT_METHODS = [
  "ruesByNit",
  "ruesByName",
  "secopSanctionsByProvider",
  "secopContractsByProvider",
  "secopProcessesByEntity",
  "secopContract",
  "secopProcess",
  "procuraduriaRecords",
  "contraloriaFiscalRecords",
  "ramaJudicialByEntity",
  "contaduriaDelinquentDebtor",
  "policiaCriminalRecords",
  "adresAffiliation",
  "simitAccountStatus",
];

const HEALTH_WINDOW = 12;

/**
 * Punto de composición único: decide qué adaptador es la fuente primaria
 * (Croma real o mock), envuelve cada llamada con caché en memoria, y
 * degrada automáticamente a MockAdapter si la fuente primaria falla —
 * para que una falla o saturación de Croma durante la demo nunca tumbe el
 * producto.
 *
 * Una sola petición HTTP dispara varias llamadas en paralelo (ej. el
 * expediente cruza 7 fuentes a la vez); si solo una de ellas degrada, no es
 * honesto reportar "Croma no disponible" globalmente. `source.degraded` por
 * eso no es un booleano de "la última llamada falló" sino el resultado de
 * una ventana móvil: solo se considera degradado si la mayoría de las
 * últimas `HEALTH_WINDOW` llamadas (de cualquier método, de cualquier
 * petición concurrente) cayeron a mock.
 */
export function buildDataSource({
  mode = process.env.DATA_SOURCE || "mock",
  cacheTtlMs = Number(process.env.CACHE_TTL_MS) || 10 * 60 * 1000,
} = {}) {
  const mock = new MockAdapter();
  const primary = mode === "croma" ? new CromaAdapter() : mock;
  const fallback = mode === "croma" ? mock : null;
  const cache = new MemoryCache(cacheTtlMs);

  const recentOutcomes = [];
  const recordOutcome = (ok) => {
    recentOutcomes.push(ok);
    if (recentOutcomes.length > HEALTH_WINDOW) recentOutcomes.shift();
  };

  const source = {
    mode,
    get degraded() {
      if (!recentOutcomes.length) return false;
      const failures = recentOutcomes.filter((ok) => !ok).length;
      return failures > recentOutcomes.length / 2;
    },
  };

  for (const method of PORT_METHODS) {
    source[method] = async (...args) => {
      return cache.wrap(method, args, async () => {
        try {
          const result = await primary[method](...args);
          recordOutcome(true);
          return result;
        } catch (err) {
          if (!fallback) throw err;
          console.warn(`[RASTRO] Croma falló en ${method}(${JSON.stringify(args)}): ${err.message}. Usando respaldo mock.`);
          recordOutcome(false);
          return fallback[method](...args);
        }
      });
    };
  }

  return source;
}
