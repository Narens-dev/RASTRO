import { LEVEL, evidence, safe } from "./evidence.js";
import { procuraduriaEvidence, contraloriaEvidence, ramaJudicialEvidence } from "./scoreEngine.js";

/**
 * Módulo — Estudio de seguridad de persona natural (apartado Empresas).
 *
 * Mismo principio que el expediente de NIT (scoreEngine.js): cruza fuentes
 * oficiales en paralelo y devuelve niveles de evidencia con fuente y fecha,
 * nunca un veredicto. Pensado para el chequeo que hoy hacen manualmente las
 * áreas de contratación/RRHH antes de vincular a alguien — hoy disperso en
 * seis portales distintos.
 *
 * Acceso restringido: se expone solo detrás de autenticación (ver
 * src/middleware/auth.js) — antecedentes penales, EPS y multas de una
 * persona no son consultables por cualquiera, a diferencia del expediente de
 * NIT/empresa que sí es público.
 */
export async function buildPersonaDossier(source, { doc, docType = "CC", name }) {
  const [procuraduria, contraloria, ramaJudicial, policia, adres, simit] = await Promise.all([
    safe(source.procuraduriaRecords(doc, docType), { found: false, hasRecords: false }),
    safe(source.contraloriaFiscalRecords(doc, docType), { found: false, isFiscalResponsible: false }),
    name
      ? safe(source.ramaJudicialByEntity(name, "natural"), { total: 0, cases: [] })
      : Promise.resolve({ total: 0, cases: [], __skipped: "sin nombre para consultar" }),
    safe(source.policiaCriminalRecords(doc, docType), { found: false, hasRecords: false }),
    safe(source.adresAffiliation(doc, docType), { found: false, currentAffiliation: null }),
    safe(source.simitAccountStatus(doc), { found: false, clear: false }),
  ]);

  const evidenceList = [
    policiaEvidence(policia),
    procuraduriaEvidence(procuraduria),
    contraloriaEvidence(contraloria),
    ramaJudicialEvidence(ramaJudicial),
    adresEvidence(adres),
    simitEvidence(simit),
  ];

  const counts = evidenceList.reduce(
    (acc, e) => ({ ...acc, [e.level]: acc[e.level] + 1 }),
    { alto: 0, sin_hallazgo: 0, limpio: 0 }
  );

  return {
    doc,
    docType,
    name: name || null,
    consultedAt: new Date().toISOString(),
    evidence: evidenceList,
    counts,
  };
}

function policiaEvidence(p) {
  if (p.__error) return evidence("Policía Nacional", "Antecedentes penales", LEVEL.SIN_HALLAZGO, "No fue posible consultar antecedentes penales en este momento.", { detail: p.__error });
  if (!p.found) return evidence("Policía Nacional", "Antecedentes penales", LEVEL.SIN_HALLAZGO, "Documento no registrado en el sistema de antecedentes de la Policía Nacional.");
  if (p.hasRecords) return evidence("Policía Nacional", "Antecedentes penales", LEVEL.ALTO, p.status || "Registra antecedente penal.", { detail: p.records });
  return evidence("Policía Nacional", "Antecedentes penales", LEVEL.LIMPIO, "Verificación positiva: sin antecedentes penales registrados.");
}

function adresEvidence(a) {
  if (a.__error) return evidence("ADRES", "Afiliación al sistema de salud (BDUA)", LEVEL.SIN_HALLAZGO, "No fue posible consultar afiliación a EPS en este momento.", { detail: a.__error });
  if (!a.found) return evidence("ADRES", "Afiliación al sistema de salud (BDUA)", LEVEL.SIN_HALLAZGO, "Documento no registrado en la Base de Datos Única de Afiliados.");
  const c = a.currentAffiliation;
  // ojo: "Inactivo" contiene la subcadena "activ" — no basta con test(/activ/i),
  // hay que exigir que el estado *empiece* con "activ" (tras normalizar espacios).
  const active = !!c?.status && /^activ/i.test(c.status.trim());
  if (active) return evidence("ADRES", "Afiliación al sistema de salud (BDUA)", LEVEL.LIMPIO, `EPS activa: ${c.eps || "no especificada"} (régimen ${c.regimen || "no especificado"}).`, { detail: c });
  return evidence("ADRES", "Afiliación al sistema de salud (BDUA)", LEVEL.ALTO, c ? `Sin afiliación activa — última EPS registrada: ${c.eps || "no especificada"} (estado "${c.status || "desconocido"}").` : "Sin afiliación activa registrada.", { detail: c });
}

function simitEvidence(s) {
  if (s.__error) return evidence("SIMIT", "Multas y sanciones de tránsito", LEVEL.SIN_HALLAZGO, "No fue posible consultar el estado de cuenta en SIMIT en este momento.", { detail: s.__error });
  if (!s.found) return evidence("SIMIT", "Multas y sanciones de tránsito", LEVEL.SIN_HALLAZGO, "Documento no registrado en SIMIT.");
  if (s.clear) return evidence("SIMIT", "Multas y sanciones de tránsito", LEVEL.LIMPIO, "Paz y salvo: sin comparendos ni multas pendientes.");
  return evidence("SIMIT", "Multas y sanciones de tránsito", LEVEL.ALTO, `${s.totalFines} multa(s) pendiente(s) por un total aproximado de $${(s.payableTotal || 0).toLocaleString("es-CO")}.`, { detail: s.fines });
}
