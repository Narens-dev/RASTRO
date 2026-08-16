import { OPPORTUNITY_SEED_ENTITIES, SECTOR_KEYWORDS, OPEN_PHASES } from "../config/opportunitySeeds.js";
import { normalizeText } from "./normalize.js";

/**
 * Módulo 5 — Oportunidades pyme (Modo Oportunidad).
 * Mismo motor de datos que Módulo 2, usado en dirección contraria: en vez de
 * buscar riesgo, busca licitaciones activas que coinciden con el sector de
 * una pyme. Nunca incluye procesos ya cerrados. Público y sin restricción
 * de acceso — no expone juicios de riesgo sobre personas o empresas.
 */

function withTimeout(promise, ms, onTimeoutValue) {
  let timer;
  const timeout = new Promise((resolve) => {
    timer = setTimeout(() => resolve(onTimeoutValue), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function isOpenPhase(phase) {
  if (!phase) return false;
  const p = normalizeText(phase).toLowerCase();
  return OPEN_PHASES.some((open) => p.includes(normalizeText(open).toLowerCase()));
}

export function matchesSector(process, sector) {
  if (!sector || sector === "Todos") return true;
  const keywords = SECTOR_KEYWORDS[sector] || [];
  const haystack = normalizeText(`${process.name} ${process.reference} ${process.contractType}`).toLowerCase();
  return keywords.some((kw) => haystack.includes(normalizeText(kw).toLowerCase()));
}

function matchesValue(process, minValue, maxValue) {
  if (minValue != null && (process.basePrice ?? 0) < minValue) return false;
  if (maxValue != null && (process.basePrice ?? 0) > maxValue) return false;
  return true;
}

// Croma reutiliza el campo "name" del resumen de proceso: a veces es el
// nombre del contratista seleccionado, a veces el título/objeto del proceso
// (ej. "PRESTACION DE SERVICIOS PROFESIONALES") — ambos en mayúsculas, sin
// marcador que los distinga. Sin un campo de ganador explícito, un
// heurístico de "no empieza con verbo de descripción" no basta: se exige
// además una señal positiva de identidad (sufijo de persona jurídica, o
// patrón de nombre propio de 2-4 palabras sin sustantivos administrativos
// genéricos). Omitir un ganador dudoso es preferible a mostrar uno incorrecto.
const LEGAL_SUFFIX_RE = /\b(S\.?A\.?S\.?|LTDA\.?|S\.?A\.?|E\.?U\.?|Y\s+CIA\.?)\b/i;
const GENERIC_NOUNS = ["servicio", "servicios", "profesional", "profesionales", "prestacion", "gestion", "apoyo", "actividad", "actividades", "proceso", "contrato", "convenio", "suministro", "obra", "obras", "mantenimiento", "interventoria", "consultoria"];

function looksLikeAWinnerName(name) {
  if (!name) return false;
  const words = name.trim().split(/\s+/);
  if (words.length < 2 || words.length > 6) return false;
  const normalized = normalizeText(name).toLowerCase();
  if (GENERIC_NOUNS.some((n) => normalized.includes(n))) return false;
  return LEGAL_SUFFIX_RE.test(name) || words.length <= 4;
}

function extractWinners(closedProcesses, contractType, limit = 3) {
  const sameType = closedProcesses.filter((p) => p.contractType === contractType && p.modality === "Contratación directa" && looksLikeAWinnerName(p.name));
  const seen = new Map();
  for (const p of sameType) {
    if (!seen.has(p.name)) seen.set(p.name, { name: p.name, count: 0, lastDate: p.publishedDate });
    const entry = seen.get(p.name);
    entry.count += 1;
    if (p.publishedDate > entry.lastDate) entry.lastDate = p.publishedDate;
  }
  return [...seen.values()].sort((a, b) => b.count - a.count).slice(0, limit);
}

export async function listOpportunities(source, { sector, location, minValue, maxValue, includeWinners = false } = {}) {
  const seeds = location && location !== "Todas"
    ? OPPORTUNITY_SEED_ENTITIES.filter((e) => e.location === location)
    : OPPORTUNITY_SEED_ENTITIES;

  // Entidades de alto volumen (ej. Bogotá) acumulan decenas de miles de procesos
  // históricos; acotar a los últimos ~180 días mantiene la consulta rápida y es
  // semánticamente correcto para "oportunidades activas" — no interesa el histórico.
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);
  const fromDate = sixMonthsAgo.toISOString().slice(0, 10);

  // Croma puede tardar >30s en entidades de muy alto volumen (ej. Bogotá). Un
  // usuario real de Modo Oportunidad no debería esperar eso: se acota cada
  // semilla a 10s — si una entidad no responde a tiempo, se omite de esta
  // respuesta (la llamada real sigue en curso y queda cacheada para la próxima).
  const results = await Promise.all(
    seeds.map(async (seed) => {
      try {
        const { processes } = await withTimeout(source.secopProcessesByEntity(seed.nit, { fromDate }), 10000, { processes: [], __timedOut: true });
        return { seed, processes };
      } catch (err) {
        return { seed, processes: [], error: err.message };
      }
    })
  );

  const opportunities = [];
  for (const { seed, processes } of results) {
    const open = processes.filter((p) => isOpenPhase(p.phase));
    const closed = processes.filter((p) => !isOpenPhase(p.phase));

    for (const p of open) {
      if (!matchesSector(p, sector)) continue;
      if (!matchesValue(p, minValue, maxValue)) continue;
      opportunities.push({
        ...p,
        entityLocation: seed.location,
        previousWinners: includeWinners ? extractWinners(closed, p.contractType) : undefined,
      });
    }
  }

  opportunities.sort((a, b) => (b.publishedDate || "").localeCompare(a.publishedDate || ""));

  // Sin filtro de sector, las 5 entidades semilla pueden sumar miles de procesos
  // activos simultáneos — se acota la respuesta a las más recientes para que la
  // pyme vea algo navegable; `totalMatched` conserva el conteo real para que el
  // frontend pueda invitar a filtrar en vez de esconder el volumen real.
  const MAX_RESULTS = 150;
  const totalMatched = opportunities.length;
  const capped = opportunities.slice(0, MAX_RESULTS);

  return {
    count: capped.length,
    totalMatched,
    capped: totalMatched > MAX_RESULTS,
    filters: { sector: sector || "Todos", location: location || "Todas", minValue: minValue ?? null, maxValue: maxValue ?? null },
    opportunities: capped,
  };
}
