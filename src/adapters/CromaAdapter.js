import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { GovDataSource } from "../ports/GovDataSource.js";

/**
 * Adaptador real — cliente MCP conectado directo desde el backend a Croma
 * (`CROMA_MCP_URL`), sin pasar por un LLM en cada consulta. Cada método
 * mapea la forma cruda de la herramienta Croma a la forma normalizada que
 * define el puerto GovDataSource, para que scoreEngine/search/etc. nunca
 * tengan que conocer el formato original de cada fuente oficial.
 */
export class CromaAdapter extends GovDataSource {
  constructor({ mcpUrl, apiKey } = {}) {
    super();
    this.mcpUrl = mcpUrl || process.env.CROMA_MCP_URL || "https://api.croma.run/mcp";
    this.apiKey = apiKey || process.env.CROMA_API_KEY || "";
    this._client = null;
    this._connecting = null;
  }

  async _getClient() {
    if (this._client) return this._client;
    if (this._connecting) return this._connecting;

    this._connecting = (async () => {
      const transport = new StreamableHTTPClientTransport(new URL(this.mcpUrl), {
        requestInit: {
          headers: this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {},
        },
      });
      const client = new Client({ name: "rastro-backend", version: "1.0.0" }, { capabilities: {} });
      await client.connect(transport);
      this._client = client;
      return client;
    })();

    return this._connecting;
  }

  async _call(toolName, args, _retried = false) {
    let result;
    try {
      const client = await this._getClient();
      result = await client.callTool({ name: toolName, arguments: args }, undefined, {
        // Entidades de alto volumen (SECOP) pueden tardar más de 15s en responder;
        // 30s da margen sin bloquear indefinidamente una consulta colgada.
        timeout: 30000,
      });
    } catch (err) {
      // La sesión MCP persistente puede caerse (idle timeout del lado de
      // Croma, blip de red) y quedar "viva" en `this._client` pero rota —
      // toda llamada posterior fallaría igual con "fetch failed" hasta un
      // reinicio manual. Se descarta el cliente cacheado y se reintenta una
      // vez con una conexión nueva antes de rendirse.
      this._client = null;
      this._connecting = null;
      if (_retried) throw err;
      return this._call(toolName, args, true);
    }
    if (result.isError) {
      const msg = result.content?.[0]?.text || `Croma tool "${toolName}" returned an error`;
      throw new Error(msg);
    }
    let payload = result.structuredContent;
    if (!payload) {
      const text = result.content?.find((c) => c.type === "text")?.text;
      if (!text) throw new Error(`Croma tool "${toolName}" returned no parseable content`);
      payload = JSON.parse(text);
    }
    // Algunas consultas lentas (ej. Contaduría) responden con un job asíncrono
    // en vez del resultado directo: { status: "pending", job_id, status_url }.
    if (payload?.status === "pending" && payload?.status_url) {
      payload = await this._pollJob(payload.status_url, toolName);
    }
    if (payload?.status === "failed") {
      throw new Error(payload.error || `Croma job para "${toolName}" falló`);
    }
    return payload;
  }

  async _pollJob(statusUrl, toolName, { intervalMs = 1500, maxAttempts = 20 } = {}) {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
      const res = await fetch(statusUrl, {
        headers: this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {},
      });
      const body = await res.json();
      if (body.status === "completed" || body.status === "failed") return body;
    }
    throw new Error(`Tiempo de espera agotado consultando el job de "${toolName}"`);
  }

  async ruesByNit(documentNumber) {
    const res = await this._call("rues_entity_by_nit", { document_number: documentNumber });
    const d = res?.data ?? res;
    if (!d?.found || !d?.entity) return { found: false, entity: null };
    const e = d.entity;
    return {
      found: true,
      entity: {
        nit: e.nit,
        name: e.name,
        status: e.registration_status,
        chamberName: e.chamber_name,
        legalOrg: e.legal_organization,
        primaryActivity: e.primary_activity,
        secondaryActivity: e.secondary_activity,
        registrationDate: e.registration_date,
        lastRenewalDate: e.last_renewal_date,
        updatedDate: e.updated_date,
        cancellationDate: e.cancellation_date,
        cancellationReason: e.cancellation_reason,
      },
    };
  }

  async ruesByName(name, page = 1) {
    const res = await this._call("rues_entities_by_name", { name, page });
    const d = res?.data ?? res;
    const entities = (d?.entities || []).map((e) => ({
      doc: e.nit,
      docType: e.nit ? "NIT" : null,
      name: e.name,
      status: e.registration_status,
      chamberName: e.chamber_name,
      primaryActivity: e.detail?.primary_activity,
    }));
    return { total: d?.pagination?.total ?? entities.length, entities };
  }

  async secopSanctionsByProvider(documentNumber) {
    const res = await this._call("secop_sanctions_by_provider", { document_number: documentNumber });
    const d = res?.data ?? res;
    const sanctions = (d?.sanctions || []).map((s) => ({
      entity: s.sanctioning_entity ?? s.entity ?? null,
      resolutionNumber: s.resolution_number ?? null,
      value: s.value ?? null,
      publishedDate: s.published_date ?? null,
      finalDate: s.final_date ?? null,
    }));
    return { count: d?.count ?? sanctions.length, sanctions };
  }

  async secopContractsByProvider(documentNumber, opts = {}) {
    const res = await this._call("secop_contracts_by_provider", {
      document_number: documentNumber,
      entity_nit: opts.entityNit || "",
      from_date: opts.fromDate || "",
      to_date: opts.toDate || "",
      page: opts.page || 1,
    });
    const d = res?.data ?? res;
    const contracts = (d?.contracts || []).map((c) => ({
      contractId: c.contract_id ?? c.id,
      entity: c.entity,
      entityNit: c.entity_nit,
      value: c.value,
      status: c.status,
      signDate: c.sign_date,
      description: c.description ?? c.object,
    }));
    return { count: d?.pagination?.total ?? contracts.length, contracts };
  }

  async secopProcessesByEntity(entityNit, opts = {}) {
    const res = await this._call("secop_processes_by_entity", {
      document_number: entityNit,
      from_date: opts.fromDate || "",
      to_date: opts.toDate || "",
      page: opts.page || 1,
    });
    const d = res?.data ?? res;
    const processes = (d?.processes || []).map((p) => ({
      noticeUid: p.notice_uid,
      processId: p.process_id,
      reference: p.reference,
      name: p.name,
      entity: p.entity,
      entityNit: p.entity_nit,
      modality: p.modality,
      contractType: p.contract_type,
      basePrice: p.base_price,
      phase: p.phase,
      procedureStatus: p.procedure_status,
      publishedDate: p.published_date,
      url: p.url,
    }));
    return { count: d?.pagination?.total ?? processes.length, processes };
  }

  async secopContract(contractId) {
    const res = await this._call("secop_contract", { contract_id: contractId });
    const d = res?.data ?? res;
    if (!d?.found) return { found: false, contract: null };
    const c = d.contract;
    return {
      found: true,
      contract: {
        contractId: c.contract_id ?? contractId,
        entity: c.entity,
        entityNit: c.entity_nit,
        provider: c.provider,
        providerDocument: c.provider_document,
        value: c.value,
        object: c.object,
        signDate: c.sign_date,
        startDate: c.start_date,
        endDate: c.end_date,
        status: c.status,
        // Croma llama a esta satélite "execution_items" (no "delivery_plan"); sus campos
        // no están documentados a detalle (siempre vacío en las muestras observadas), se
        // mapean con fallbacks defensivos. Las adiciones registradas ("addition_id",
        // "type", "registered_date") no siempre traen un valor monetario explícito.
        additions: (d.additions || []).map((a) => ({ date: a.registered_date ?? a.date, value: a.value ?? null, description: a.description ?? a.type })),
        guarantees: (d.guarantees || []).map((g) => ({ insurer: g.insurer, type: g.policy_type ?? g.type, validFrom: g.policy_created_date ?? g.created_date, validTo: g.policy_end_date, value: g.value })),
        deliveryPlan: (d.execution_items || []).map((p) => ({ item: p.item ?? p.name, plannedPct: p.planned_pct ?? p.planned_progress ?? p.planned_percentage, actualPct: p.actual_pct ?? p.actual_progress ?? p.actual_percentage, plannedDate: p.planned_date ?? p.date })),
        paidToDate: c.paid_value ?? null,
        pendingPaymentValue: c.pending_payment_value ?? null,
      },
    };
  }

  // Único lugar donde Croma da el proveedor real (con NIT/cédula cuando lo
  // tiene) y el valor de cada adjudicación de un proceso — la lista liviana
  // de secopProcessesByEntity no trae ninguno de los dos. `is_group` marca
  // consorcios/uniones temporales, sin desglose de integrantes (Croma no lo
  // expone: no son persona jurídica propia, no se registran en RUES).
  async secopProcess(noticeUid) {
    const res = await this._call("secop_process", { notice_uid: noticeUid });
    const d = res?.data ?? res;
    if (!d?.found) return { found: false, process: null, contracts: [] };
    const p = d.process;
    const contracts = (d.contracts || []).map((c) => ({
      contractId: c.contract_id,
      provider: c.provider,
      providerDocument: c.provider_document,
      isGroup: !!c.is_group,
      value: c.value,
      signDate: c.sign_date,
    }));
    return {
      found: true,
      process: {
        noticeUid: p.notice_uid,
        name: p.name,
        entity: p.entity,
        entityNit: p.entity_nit,
        contractType: p.contract_type,
        phase: p.phase,
        publishedDate: p.published_date,
      },
      contracts,
    };
  }

  async procuraduriaRecords(documentNumber, documentType = "CC") {
    const res = await this._call("procuraduria_disciplinary_records", { document_number: documentNumber, document_type: documentType });
    const d = res?.data ?? res;
    return {
      found: !!d?.found,
      hasRecords: !!d?.has_records,
      fullName: d?.full_name ?? null,
      status: d?.status ?? d?.message ?? null,
      records: d?.records || [],
    };
  }

  async contraloriaFiscalRecords(documentNumber, documentType = "CC") {
    const res = await this._call("contraloria_fiscal_records", { document_number: documentNumber, document_type: documentType });
    const d = res?.data ?? res;
    return {
      found: !!d?.found,
      isFiscalResponsible: !!d?.is_fiscal_responsible,
      verificationCode: d?.verification_code ?? null,
      certifiedAt: d?.certified_at ?? null,
    };
  }

  async ramaJudicialByEntity(name, entityType = "juridical", opts = {}) {
    const res = await this._call("rama_judicial_cases_by_entity", {
      name,
      entity_type: entityType,
      active_only: !!opts.activeOnly,
      court_code: opts.courtCode || "",
      page: opts.page || 1,
    });
    const d = res?.data ?? res;
    const cases = (d?.cases || []).map((c) => ({
      registrationNumber: c.registration_number,
      court: c.court,
      department: c.department,
      startDate: c.start_date,
      lastActionDate: c.last_action_date,
      partiesText: c.parties_text,
      isPrivate: !!c.is_private,
    }));
    return { total: d?.pagination?.total ?? cases.length, cases };
  }

  async contaduriaDelinquentDebtor(documentNumber, documentType = "CC") {
    const res = await this._call("contaduria_state_delinquent_debtors", { document_number: documentNumber, document_type: documentType });
    const d = res?.data ?? res;
    // Este endpoint no expone found:false — siempre certifica una respuesta definitiva
    // para el documento consultado, con dos verdictos independientes (Ley 901/2004 y Ley 1066/2006).
    return {
      found: true,
      delinquentDebtor: !!d?.deudor_moroso?.reported,
      defaultedAgreement: !!d?.incumplimiento_acuerdos?.reported,
    };
  }

  async policiaCriminalRecords(documentNumber, documentType = "CC") {
    const res = await this._call("policia_criminal_records", { document_number: documentNumber, document_type: documentType });
    const d = res?.data ?? res;
    return {
      found: !!d?.found,
      hasRecords: !!(d?.has_records ?? d?.hasRecords),
      status: d?.status ?? d?.message ?? null,
      records: d?.records || [],
    };
  }

  // El campo estructurado exacto de "affiliations" no está documentado a detalle
  // por Croma (sin muestra con found:true disponible durante el desarrollo) —
  // se mapea de forma defensiva con los nombres de campo más probables, con
  // "history" crudo como respaldo para no perder información no anticipada.
  async adresAffiliation(documentNumber, documentType = "CC") {
    const res = await this._call("adres_affiliation_status", { document_number: documentNumber, document_type: documentType });
    const d = res?.data ?? res;
    if (!d?.found) return { found: false, currentAffiliation: null, history: [] };
    const history = d.affiliations || d.records || d.history || [];
    const current = history.find((a) => !a?.end_date && !a?.fecha_fin) || history[0] || null;
    return {
      found: true,
      currentAffiliation: current
        ? {
            eps: current.eps ?? current.entity ?? current.entidad ?? null,
            regimen: current.regimen ?? current.regime ?? null,
            status: current.status ?? current.estado ?? null,
            affiliateType: current.affiliate_type ?? current.tipo_afiliado ?? null,
            startDate: current.start_date ?? current.fecha_afiliacion ?? null,
          }
        : null,
      history,
    };
  }

  async simitAccountStatus(documentNumber) {
    const res = await this._call("simit_account_status", { document_number: documentNumber });
    const d = res?.data ?? res;
    return {
      found: !!d?.found,
      clear: !!d?.clear,
      totalFines: d?.summary?.total_fines ?? 0,
      payableTotal: d?.summary?.payable_total ?? 0,
      fines: d?.fines || [],
      agreements: d?.payment_agreements || [],
    };
  }
}
