import { GovDataSource } from "../ports/GovDataSource.js";
import { ENTITIES, NAME_INDEX, CONTRACTS, OPPORTUNITY_SEED_ENTITIES, OPPORTUNITIES, PROCESS_DETAILS } from "./fixtures/fixtures.js";

const EMPTY = (doc) => ({
  doc,
  rues: { found: false, entity: null },
  sanctions: { count: 0, sanctions: [] },
  contracts: { count: 0, contracts: [] },
  procuraduria: { found: false, hasRecords: false, fullName: null, status: "No registrado en el sistema" },
  contraloria: { found: false, isFiscalResponsible: false, verificationCode: null, certifiedAt: null },
  ramaJudicial: { total: 0, cases: [] },
  contaduria: { found: false, delinquentDebtor: false, defaultedAgreement: false },
  policia: { found: false, hasRecords: false, status: "No registrado en el sistema", records: [] },
  adres: { found: false, currentAffiliation: null, history: [] },
  simit: { found: false, clear: false, totalFines: 0, payableTotal: 0, fines: [], agreements: [] },
});

/**
 * Fuente de respaldo — nunca falla, nunca tarda. Devuelve fixtures fieles a
 * la forma real de Croma para tres perfiles de demo (limpio, mixto, alto
 * riesgo) y "sin hallazgo" honesto para cualquier documento no registrado
 * en las fixtures, en vez de inventar datos.
 */
export class MockAdapter extends GovDataSource {
  async ruesByNit(documentNumber) {
    const e = ENTITIES[documentNumber];
    return e ? e.rues : { found: false, entity: null };
  }

  async ruesByName(name, page = 1) {
    const q = name.trim().toLowerCase();
    const matches = NAME_INDEX.filter((r) => r.name.toLowerCase().includes(q));
    return { total: matches.length, entities: matches };
  }

  async secopSanctionsByProvider(documentNumber) {
    const e = ENTITIES[documentNumber];
    return e ? e.sanctions : { count: 0, sanctions: [] };
  }

  async secopContractsByProvider(documentNumber) {
    const e = ENTITIES[documentNumber];
    return e ? e.contracts : { count: 0, contracts: [] };
  }

  async secopProcessesByEntity(entityNit) {
    const processes = OPPORTUNITIES.filter((o) => o.entityNit === entityNit);
    return { count: processes.length, processes };
  }

  async secopContract(contractId) {
    return CONTRACTS[contractId] || { found: false, contract: null };
  }

  async secopProcess(noticeUid) {
    const detail = PROCESS_DETAILS[noticeUid];
    const process = OPPORTUNITIES.find((o) => o.noticeUid === noticeUid);
    if (!detail || !process) return { found: false, process: null, contracts: [] };
    return { found: true, process, contracts: detail.contracts };
  }

  async procuraduriaRecords(documentNumber) {
    const e = ENTITIES[documentNumber];
    return e ? e.procuraduria : EMPTY(documentNumber).procuraduria;
  }

  async contraloriaFiscalRecords(documentNumber) {
    const e = ENTITIES[documentNumber];
    return e ? e.contraloria : EMPTY(documentNumber).contraloria;
  }

  async ramaJudicialByEntity(name) {
    const hit = Object.values(ENTITIES).find((e) => e.rues?.entity?.name?.toLowerCase() === name.trim().toLowerCase());
    return hit ? hit.ramaJudicial : { total: 0, cases: [] };
  }

  async contaduriaDelinquentDebtor(documentNumber) {
    const e = ENTITIES[documentNumber];
    return e ? e.contaduria : EMPTY(documentNumber).contaduria;
  }

  async policiaCriminalRecords(documentNumber) {
    const e = ENTITIES[documentNumber];
    return e ? e.policia : EMPTY(documentNumber).policia;
  }

  async adresAffiliation(documentNumber) {
    const e = ENTITIES[documentNumber];
    return e ? e.adres : EMPTY(documentNumber).adres;
  }

  async simitAccountStatus(documentNumber) {
    const e = ENTITIES[documentNumber];
    return e ? e.simit : EMPTY(documentNumber).simit;
  }

  // Métodos propios del mock, usados por el motor cuando la entidad se busca por NIT directamente.
  async fullProfileByDoc(documentNumber) {
    return ENTITIES[documentNumber] || EMPTY(documentNumber);
  }

  async opportunitySeedEntities() {
    return OPPORTUNITY_SEED_ENTITIES;
  }
}
