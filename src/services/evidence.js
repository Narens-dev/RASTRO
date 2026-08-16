/**
 * Niveles de evidencia compartidos — usado por scoreEngine.js (expedientes de
 * NIT/empresa) y backgroundCheck.js (dossier de persona por cédula). Nunca se
 * combinan en un número único: el resultado es siempre la lista completa de
 * hallazgos, para preservar la presunción de inocencia y la trazabilidad
 * hacia la fuente primaria.
 */

export const LEVEL = { ALTO: "alto", SIN_HALLAZGO: "sin_hallazgo", LIMPIO: "limpio" };

const LEVEL_LABEL = {
  [LEVEL.ALTO]: "Alto",
  [LEVEL.SIN_HALLAZGO]: "Sin hallazgo",
  [LEVEL.LIMPIO]: "Limpio",
};

export function evidence(source, sourceLabel, level, summary, { detail = null, url = null } = {}) {
  return {
    source,
    sourceLabel,
    level,
    levelLabel: LEVEL_LABEL[level],
    summary,
    detail,
    url,
    checkedAt: new Date().toISOString(),
  };
}

export async function safe(promise, fallback) {
  try {
    return await promise;
  } catch (err) {
    return { __error: err.message, ...fallback };
  }
}
