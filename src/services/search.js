import { cascadeQueries, isDocumentNumber, cleanDocumentNumber } from "./normalize.js";

/**
 * Módulo 3 — Búsqueda y normalización.
 * Un NIT/cédula va directo a RUES para confirmar identidad; un nombre pasa
 * por la cascada de normalización hasta encontrar candidatos, sin asumir
 * automáticamente una coincidencia ambigua cuando hay más de una.
 */
export async function search(source, rawQuery) {
  const query = (rawQuery || "").trim();
  if (!query) return { queryType: "empty", candidates: [] };

  if (isDocumentNumber(query)) {
    const doc = cleanDocumentNumber(query);
    const rues = await source.ruesByNit(doc);
    if (rues.found) {
      return {
        queryType: "document",
        candidates: [{ doc, docType: "NIT", name: rues.entity.name, status: rues.entity.status, source: "RUES" }],
      };
    }
    // No aparece en RUES: puede ser una persona natural (cédula) sin registro mercantil.
    return {
      queryType: "document",
      candidates: [{ doc, docType: "CC", name: null, status: null, source: null }],
    };
  }

  for (const variant of cascadeQueries(query)) {
    const result = await source.ruesByName(variant, 1);
    if (result.total > 0) {
      return {
        queryType: "name",
        matchedVariant: variant,
        candidates: result.entities.map((e) => ({
          doc: e.doc,
          docType: e.docType || "NIT",
          name: e.name,
          status: e.status,
          source: "RUES",
        })),
      };
    }
  }

  return { queryType: "name", candidates: [] };
}
