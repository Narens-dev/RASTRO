/**
 * Módulo 2 — Motor de score (nombre heredado; en realidad nunca calcula un
 * score numérico — ver Principio transversal en el documento de proyecto).
 *
 * Dispara en paralelo las seis fuentes oficiales y clasifica cada una en un
 * nivel de evidencia (alto / sin hallazgo / limpio), cada una con su
 * fuente y fecha de consulta. Nunca se combinan en un número único: el
 * resultado es siempre la lista completa, para preservar la presunción de
 * inocencia y la trazabilidad hacia la fuente primaria.
 */

import { LEVEL, evidence, safe } from "./evidence.js";

export { LEVEL };

export async function buildExpediente(source, { doc, docType, name }) {
  const [rues, sanctions, procuraduria, contraloria, ramaJudicial, contaduria, contracts] = await Promise.all([
    safe(source.ruesByNit(doc), { found: false }),
    safe(source.secopSanctionsByProvider(doc), { count: 0, sanctions: [] }),
    safe(source.procuraduriaRecords(doc, docType), { found: false, hasRecords: false }),
    // El boletín SIBOR de responsabilidad fiscal solo certifica personas naturales
    // (CC/CE/TI/PA/PEP/PPT) — no acepta NIT. Para personas jurídicas se omite la
    // consulta en vez de forzar un tipo de documento inválido contra Croma.
    docType === "NIT"
      ? Promise.resolve({ found: false, isFiscalResponsible: false, __skipped: "no aplica a personas jurídicas" })
      : safe(source.contraloriaFiscalRecords(doc, docType), { found: false, isFiscalResponsible: false }),
    name
      ? safe(source.ramaJudicialByEntity(name, docType === "NIT" ? "juridical" : "natural"), { total: 0, cases: [] })
      : Promise.resolve({ total: 0, cases: [], __skipped: "sin nombre para consultar" }),
    safe(source.contaduriaDelinquentDebtor(doc, docType), { found: false, delinquentDebtor: false }),
    safe(source.secopContractsByProvider(doc), { count: 0, contracts: [] }),
  ]);

  const resolvedName = name || rues?.entity?.name || null;

  const evidenceList = [
    ruesEvidence(rues),
    sanctionsEvidence(sanctions),
    procuraduriaEvidence(procuraduria),
    contraloriaEvidence(contraloria),
    ramaJudicialEvidence(ramaJudicial),
    contaduriaEvidence(contaduria),
  ];

  const counts = evidenceList.reduce(
    (acc, e) => ({ ...acc, [e.level]: acc[e.level] + 1 }),
    { alto: 0, sin_hallazgo: 0, limpio: 0 }
  );

  return {
    doc,
    docType,
    name: resolvedName,
    consultedAt: new Date().toISOString(),
    rues: rues.found ? rues.entity : null,
    evidence: evidenceList,
    counts,
    contractHistory: {
      count: contracts.count ?? contracts.contracts?.length ?? 0,
      contracts: contracts.contracts ?? [],
    },
  };
}

function ruesEvidence(rues) {
  if (rues.__error) return evidence("RUES", "Registro Único Empresarial y Social", LEVEL.SIN_HALLAZGO, "No fue posible consultar RUES en este momento.", { detail: rues.__error });
  if (!rues.found) return evidence("RUES", "Registro Único Empresarial y Social", LEVEL.SIN_HALLAZGO, "No registra en RUES — puede tratarse de una persona natural sin registro mercantil.");
  const activa = rues.entity.status === "ACTIVA";
  return evidence(
    "RUES",
    "Registro Único Empresarial y Social",
    activa ? LEVEL.LIMPIO : LEVEL.ALTO,
    activa ? `Registro mercantil activo (${rues.entity.chamberName || "cámara no especificada"}).` : `Registro mercantil en estado "${rues.entity.status}" — verificar vigencia antes de contratar.`,
    { detail: rues.entity }
  );
}

function sanctionsEvidence(s) {
  if (s.__error) return evidence("SECOP — sanciones", "SECOP / Colombia Compra Eficiente", LEVEL.SIN_HALLAZGO, "No fue posible consultar el histórico de sanciones en este momento.", { detail: s.__error });
  if (!s.count) return evidence("SECOP — sanciones", "SECOP / Colombia Compra Eficiente", LEVEL.SIN_HALLAZGO, "Sin sanciones registradas en SECOP. Este dato tiene subregistro documentado (Circular 002/2026): ausencia de hallazgo no equivale a historial limpio.");
  return evidence("SECOP — sanciones", "SECOP / Colombia Compra Eficiente", LEVEL.ALTO, `${s.count} sanción(es) registradas por incumplimiento contractual.`, { detail: s.sanctions });
}

export function procuraduriaEvidence(p) {
  if (p.__error) return evidence("Procuraduría", "Procuraduría General de la Nación (SIRI)", LEVEL.SIN_HALLAZGO, "No fue posible consultar antecedentes disciplinarios en este momento.", { detail: p.__error });
  if (!p.found) return evidence("Procuraduría", "Procuraduría General de la Nación (SIRI)", LEVEL.SIN_HALLAZGO, "Documento no registrado en el sistema de antecedentes de la Procuraduría.");
  if (p.hasRecords) return evidence("Procuraduría", "Procuraduría General de la Nación (SIRI)", LEVEL.ALTO, "Registra antecedentes disciplinarios, penales, contractuales o fiscales.", { detail: p.records });
  return evidence("Procuraduría", "Procuraduría General de la Nación (SIRI)", LEVEL.LIMPIO, "Verificación positiva: sin antecedentes registrados.");
}

export function contraloriaEvidence(c) {
  if (c.__error) return evidence("Contraloría", "Contraloría General de la República (SIBOR)", LEVEL.SIN_HALLAZGO, "No fue posible consultar responsabilidad fiscal en este momento.", { detail: c.__error });
  if (c.__skipped) return evidence("Contraloría", "Contraloría General de la República (SIBOR)", LEVEL.SIN_HALLAZGO, "El boletín SIBOR certifica personas naturales, no personas jurídicas — no aplica para este NIT. Consulta a los representantes legales individualmente si es necesario.");
  if (!c.found) return evidence("Contraloría", "Contraloría General de la República (SIBOR)", LEVEL.SIN_HALLAZGO, "Sin certificación disponible para este documento.");
  if (c.isFiscalResponsible) return evidence("Contraloría", "Contraloría General de la República (SIBOR)", LEVEL.ALTO, "Reportado como responsable fiscal en el boletín SIBOR.", { detail: { verificationCode: c.verificationCode } });
  return evidence("Contraloría", "Contraloría General de la República (SIBOR)", LEVEL.LIMPIO, "Verificación positiva: no reportado como responsable fiscal.", { detail: { verificationCode: c.verificationCode } });
}

export function ramaJudicialEvidence(r) {
  if (r.__error) return evidence("Rama Judicial", "Consulta de Procesos Nacional Unificada", LEVEL.SIN_HALLAZGO, "No fue posible consultar procesos judiciales en este momento.", { detail: r.__error });
  if (r.__skipped) return evidence("Rama Judicial", "Consulta de Procesos Nacional Unificada", LEVEL.SIN_HALLAZGO, "No se consultó: se necesita el nombre completo para buscar en la Rama Judicial.");
  if (!r.total) return evidence("Rama Judicial", "Consulta de Procesos Nacional Unificada", LEVEL.LIMPIO, "Sin procesos judiciales activos encontrados a nombre de la entidad o persona buscada.");
  return evidence(
    "Rama Judicial",
    "Consulta de Procesos Nacional Unificada",
    LEVEL.ALTO,
    `${r.total} proceso(s) judicial(es) asociados al nombre buscado. Un proceso activo no implica responsabilidad — revisar cada radicado.`,
    { detail: r.cases }
  );
}

function contaduriaEvidence(c) {
  if (c.__error) return evidence("Contaduría", "Boletín de Deudores Morosos del Estado", LEVEL.SIN_HALLAZGO, "No fue posible consultar morosidad con el Estado en este momento.", { detail: c.__error });
  if (!c.found) return evidence("Contaduría", "Boletín de Deudores Morosos del Estado", LEVEL.SIN_HALLAZGO, "Sin reporte disponible para este documento.");
  if (c.delinquentDebtor || c.defaultedAgreement) {
    const reasons = [c.delinquentDebtor && "deudor moroso del Estado (Ley 901/2004)", c.defaultedAgreement && "incumplimiento de acuerdo de pago (Ley 1066/2006)"].filter(Boolean);
    return evidence("Contaduría", "Boletín de Deudores Morosos del Estado", LEVEL.ALTO, `Reportado como ${reasons.join(" y ")}.`);
  }
  return evidence("Contaduría", "Boletín de Deudores Morosos del Estado", LEVEL.LIMPIO, "Verificación positiva: sin reporte de morosidad con el Estado.");
}
