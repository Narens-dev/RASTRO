/**
 * Normalización de texto para búsqueda por nombre — Módulo 3.
 * Quita tildes/mayúsculas y sufijos legales comunes para que una búsqueda
 * funcione aunque el usuario no escriba el nombre exactamente como aparece
 * en el registro oficial.
 */

const LEGAL_SUFFIXES = [
  "S\\.?A\\.?S\\.?",
  "LTDA\\.?",
  "S\\.?A\\.?",
  "E\\.?U\\.?",
  "Y\\s+CIA\\.?",
  "EN LIQUIDACION",
  "SOCIEDAD ANONIMA",
  "SOCIEDAD POR ACCIONES SIMPLIFICADA",
];

const SUFFIX_RE = new RegExp(`\\b(${LEGAL_SUFFIXES.join("|")})\\b\\.?\\s*$`, "i");

export function stripAccents(text) {
  return text.normalize("NFD").replace(/[̀-ͯ]/g, "");
}

export function normalizeText(text) {
  return stripAccents(text)
    .toUpperCase()
    .replace(/[.,]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function stripLegalSuffix(text) {
  let prev = text;
  let curr = text.replace(SUFFIX_RE, "").trim();
  // Un nombre puede llevar más de un sufijo encadenado (ej. "... SAS EN LIQUIDACION").
  while (curr !== prev) {
    prev = curr;
    curr = curr.replace(SUFFIX_RE, "").trim();
  }
  return curr;
}

/**
 * Genera variantes de búsqueda en orden de especificidad decreciente:
 * 1. Nombre normalizado tal cual.
 * 2. Sin sufijos legales (SAS, LTDA, S.A., ...).
 * 3. Solo las primeras dos palabras significativas.
 * Cada variante solo se usa si la anterior no devolvió resultados —
 * nunca se salta directo a la más laxa para no introducir falsos positivos.
 */
export function cascadeQueries(rawName) {
  const normalized = normalizeText(rawName);
  const withoutSuffix = stripLegalSuffix(normalized);
  const words = withoutSuffix.split(" ").filter((w) => w.length > 1);
  const firstTwo = words.slice(0, 2).join(" ");

  const variants = [normalized];
  if (withoutSuffix && withoutSuffix !== normalized) variants.push(withoutSuffix);
  if (firstTwo && firstTwo !== withoutSuffix && words.length > 2) variants.push(firstTwo);

  return [...new Set(variants)].filter((v) => v.length >= 3);
}

export function isDocumentNumber(query) {
  return /^\d{4,15}$/.test(query.replace(/[.\-\s]/g, ""));
}

export function cleanDocumentNumber(query) {
  return query.replace(/[.\-\s]/g, "");
}
