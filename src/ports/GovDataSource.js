/**
 * Puerto GovDataSource — contrato único entre el motor de RASTRO y cualquier
 * fuente de datos oficiales. Cualquier adaptador (Croma real, mock de
 * respaldo, o uno futuro) debe implementar exactamente estos métodos con
 * exactamente esta forma de retorno, para que el resto del sistema nunca
 * sepa de dónde vinieron los datos.
 *
 * Todos los métodos son async y nunca deben lanzar por "no encontrado":
 * en ese caso devuelven { found: false }. Solo lanzan ante fallas de
 * transporte (red, timeout, credenciales), que el llamador debe capturar.
 */
export class GovDataSource {
  /** @returns {Promise<{found:boolean, entity?: object}>} */
  async ruesByNit(_documentNumber) {
    throw new Error("not implemented");
  }

  /** @returns {Promise<{total:number, entities: object[]}>} */
  async ruesByName(_name, _page = 1) {
    throw new Error("not implemented");
  }

  /** @returns {Promise<{count:number, sanctions: object[]}>} */
  async secopSanctionsByProvider(_documentNumber) {
    throw new Error("not implemented");
  }

  /** @returns {Promise<{count:number, contracts: object[]}>} */
  async secopContractsByProvider(_documentNumber, _opts = {}) {
    throw new Error("not implemented");
  }

  /** @returns {Promise<{count:number, processes: object[]}>} */
  async secopProcessesByEntity(_entityNit, _opts = {}) {
    throw new Error("not implemented");
  }

  /** @returns {Promise<{found:boolean, contract?: object}>} */
  async secopContract(_contractId) {
    throw new Error("not implemented");
  }

  /** @returns {Promise<{found:boolean, process?: object, contracts?: object[]}>} */
  async secopProcess(_noticeUid) {
    throw new Error("not implemented");
  }

  /** @returns {Promise<{found:boolean, hasRecords?:boolean, records?: object[]}>} */
  async procuraduriaRecords(_documentNumber, _documentType = "CC") {
    throw new Error("not implemented");
  }

  /** @returns {Promise<{found:boolean, isFiscalResponsible?:boolean}>} */
  async contraloriaFiscalRecords(_documentNumber, _documentType = "CC") {
    throw new Error("not implemented");
  }

  /** @returns {Promise<{cases: object[], total:number}>} */
  async ramaJudicialByEntity(_name, _entityType = "juridical", _opts = {}) {
    throw new Error("not implemented");
  }

  /** @returns {Promise<{found:boolean, delinquentDebtor?:boolean, defaultedAgreement?:boolean}>} */
  async contaduriaDelinquentDebtor(_documentNumber, _documentType = "CC") {
    throw new Error("not implemented");
  }

  /** @returns {Promise<{found:boolean, hasRecords?:boolean, status?:string, records?: object[]}>} */
  async policiaCriminalRecords(_documentNumber, _documentType = "CC") {
    throw new Error("not implemented");
  }

  /** @returns {Promise<{found:boolean, currentAffiliation?: object|null, history?: object[]}>} */
  async adresAffiliation(_documentNumber, _documentType = "CC") {
    throw new Error("not implemented");
  }

  /** @returns {Promise<{found:boolean, clear?:boolean, totalFines?:number, payableTotal?:number, fines?: object[], agreements?: object[]}>} */
  async simitAccountStatus(_documentNumber) {
    throw new Error("not implemented");
  }
}
