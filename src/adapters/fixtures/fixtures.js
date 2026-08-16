/**
 * Fixtures de respaldo para MockAdapter.
 *
 * Estos perfiles no son inventados al azar: sus campos y formato reflejan
 * respuestas reales observadas en Croma durante el desarrollo de RASTRO
 * (RUES, SECOP, Procuraduría, Contraloría, Rama Judicial), anonimizados y
 * recompuestos en personas/empresas ficticias para poder demostrar los tres
 * niveles de evidencia sin exponer datos reales de terceros.
 */

export const ENTITIES = {
  // Empresa "limpia": sin hallazgos en ninguna fuente.
  "900111222": {
    doc: "900111222",
    docType: "NIT",
    rues: {
      found: true,
      entity: {
        nit: "900111222",
        name: "INGENIERIA ANDINA SAS",
        status: "ACTIVA",
        chamberName: "BOGOTA",
        legalOrg: "SOCIEDADES POR ACCIONES SIMPLIFICADAS SAS",
        primaryActivity: { code: "7112", description: "Actividades de ingeniería y otras actividades conexas de consultoría técnica" },
        secondaryActivity: { code: "4290", description: "Construcción de otras obras de ingeniería civil" },
        registrationDate: "2016-02-10",
        lastRenewalDate: "2026-03-11",
        updatedDate: "2026-04-02",
        cancellationDate: null,
        cancellationReason: null,
      },
    },
    sanctions: { count: 0, sanctions: [] },
    contracts: {
      count: 3,
      contracts: [
        { contractId: "CO1.PCCNTR.5501203", entity: "INSTITUTO DE DESARROLLO URBANO", entityNit: "899999101", value: 412000000, status: "En ejecución", signDate: "2026-02-18", description: "Interventoría técnica de obras de espacio público" },
        { contractId: "CO1.PCCNTR.5301884", entity: "SECRETARIA DISTRITAL DE MOVILIDAD", entityNit: "899999061", value: 189500000, status: "Terminado", signDate: "2024-06-02", description: "Estudios y diseños de señalización vial" },
        { contractId: "CO1.PCCNTR.5122340", entity: "EMPRESA DE ACUEDUCTO Y ALCANTARILLADO", entityNit: "899999094", value: 276300000, status: "Terminado", signDate: "2023-09-14", description: "Consultoría en redes hidrosanitarias" },
      ],
    },
    procuraduria: { found: true, hasRecords: false, fullName: "INGENIERIA ANDINA SAS", status: "Sin antecedentes registrados" },
    contraloria: { found: true, isFiscalResponsible: false, verificationCode: "900111222MOCK0001", certifiedAt: "2026-08-10T09:00:00" },
    ramaJudicial: { total: 0, cases: [] },
    contaduria: { found: true, delinquentDebtor: false, defaultedAgreement: false },
  },

  // Empresa con hallazgos mixtos: limpia en disciplinario/fiscal, pero con procesos judiciales civiles activos.
  "860513493": {
    doc: "860513493",
    docType: "NIT",
    rues: {
      found: true,
      entity: {
        nit: "860513493",
        name: "CONSTRUCTORA BOLIVAR BOGOTA S.A.",
        status: "ACTIVA",
        chamberName: "BOGOTA",
        legalOrg: "SOCIEDAD ANONIMA",
        primaryActivity: { code: "4111", description: "Construcción de edificios residenciales" },
        secondaryActivity: { code: "4112", description: "Construcción de edificios no residenciales" },
        registrationDate: "1983-06-14",
        lastRenewalDate: "2026-03-13",
        updatedDate: "2026-04-30",
        cancellationDate: null,
        cancellationReason: null,
      },
    },
    sanctions: { count: 0, sanctions: [] },
    contracts: {
      count: 2,
      contracts: [
        { contractId: "CO1.PCCNTR.4891120", entity: "FONDO NACIONAL DEL AHORRO", entityNit: "899999068", value: 2340000000, status: "En ejecución", signDate: "2025-11-04", description: "Construcción de proyecto de vivienda de interés social" },
        { contractId: "CO1.PCCNTR.4602218", entity: "CAJA DE VIVIENDA POPULAR", entityNit: "899999074", value: 1180000000, status: "Terminado", signDate: "2023-02-20", description: "Reasentamiento y construcción de unidades habitacionales" },
      ],
    },
    procuraduria: { found: false, hasRecords: false, fullName: null, status: "No registrado en el sistema" },
    contraloria: { found: true, isFiscalResponsible: false, verificationCode: "860513493MOCK0002", certifiedAt: "2026-08-10T09:05:00" },
    ramaJudicial: {
      total: 16,
      cases: [
        { registrationNumber: "05615400300120260069200", court: "JUZGADO 001 CIVIL MUNICIPAL DE RIONEGRO", department: "ANTIOQUIA", startDate: "2026-06-22", lastActionDate: "2026-07-21", partiesText: "Demandante: JUAN FELIPE VALLEJO GOMEZ | Demandado: CONSTRUCTORA BOLIVAR BOGOTA S.A.", isPrivate: false },
        { registrationNumber: "11001310501420250006300", court: "JUZGADO 014 LABORAL DE BOGOTÁ", department: "BOGOTÁ", startDate: "2025-03-11", lastActionDate: "2026-08-12", partiesText: "Demandante: EDGAR VICENTE CAICEDO GALVIS | Demandado: CONSTRUCTORA BOLIVAR BOGOTA S.A.", isPrivate: false },
        { registrationNumber: "13001410500120260003001", court: "JUZGADO 006 LABORAL DE CARTAGENA", department: "BOLÍVAR", startDate: "2026-06-11", lastActionDate: "2026-07-23", partiesText: "Demandante: WILMER DE JESUS BARRAGAN DE LA ROSA | Demandado: CONSTRUCTORA BOLIVAR BOGOTA S.A.", isPrivate: false },
      ],
    },
    contaduria: { found: true, delinquentDebtor: false, defaultedAgreement: false },
  },

  // Empresa de alto riesgo: hallazgos duros en las seis fuentes.
  "900555333": {
    doc: "900555333",
    docType: "NIT",
    rues: {
      found: true,
      entity: {
        nit: "900555333",
        name: "OBRAS Y DISEÑOS INTEGRALES SAS",
        status: "ACTIVA",
        chamberName: "BARRANQUILLA",
        legalOrg: "SOCIEDADES POR ACCIONES SIMPLIFICADAS SAS",
        primaryActivity: { code: "4290", description: "Construcción de otras obras de ingeniería civil" },
        secondaryActivity: { code: "4321", description: "Instalaciones eléctricas" },
        registrationDate: "2012-08-03",
        lastRenewalDate: "2026-02-01",
        updatedDate: "2026-05-10",
        cancellationDate: null,
        cancellationReason: null,
      },
    },
    sanctions: {
      count: 2,
      sanctions: [
        { entity: "AGENCIA NACIONAL DE INFRAESTRUCTURA", resolutionNumber: "RES-2024-0871", value: 340000000, publishedDate: "2024-11-05", finalDate: "2025-01-20" },
        { entity: "INVIAS", resolutionNumber: "RES-2022-0142", value: 95000000, publishedDate: "2022-06-14", finalDate: "2022-09-02" },
      ],
    },
    contracts: {
      count: 4,
      contracts: [
        { contractId: "CO1.PCCNTR.3901187", entity: "INVIAS", entityNit: "899999059", value: 5600000000, status: "Terminado", signDate: "2021-03-10", description: "Mejoramiento de vía terciaria" },
        { contractId: "CO1.PCCNTR.4210094", entity: "AGENCIA NACIONAL DE INFRAESTRUCTURA", entityNit: "830125996", value: 8900000000, status: "En ejecución", signDate: "2024-05-22", description: "Rehabilitación de puente vehicular" },
      ],
    },
    procuraduria: {
      found: true,
      hasRecords: true,
      fullName: "OBRAS Y DISEÑOS INTEGRALES SAS",
      status: "Registra antecedentes disciplinarios",
      records: [
        { type: "Disciplinario", entity: "Procuraduría Regional Atlántico", status: "En curso", date: "2025-04-18" },
      ],
    },
    contraloria: { found: true, isFiscalResponsible: true, verificationCode: "900555333MOCK0003", certifiedAt: "2026-08-10T09:10:00" },
    ramaJudicial: {
      total: 5,
      cases: [
        { registrationNumber: "08001333300620260018600", court: "JUZGADO 006 ADMINISTRATIVO DE BARRANQUILLA", department: "ATLÁNTICO", startDate: "2026-06-03", lastActionDate: "2026-07-28", partiesText: "Demandante: CONTRALORÍA DEPARTAMENTAL | Demandado: OBRAS Y DISEÑOS INTEGRALES SAS", isPrivate: false },
      ],
    },
    contaduria: { found: true, delinquentDebtor: true, defaultedAgreement: false },
  },

  // Persona natural, limpia (cédula real usada en pruebas — sin datos personales asociados).
  "79123456": {
    doc: "79123456",
    docType: "CC",
    rues: { found: false, entity: null },
    sanctions: { count: 0, sanctions: [] },
    contracts: { count: 1, contracts: [
      { contractId: "CO1.PCCNTR.5011933", entity: "MINISTERIO DE TECNOLOGIAS DE LA INFORMACION", entityNit: "830115297", value: 96000000, status: "Terminado", signDate: "2025-01-15", description: "Consultoría en transformación digital" },
    ] },
    procuraduria: { found: true, hasRecords: false, fullName: "JOSÉ LUIS MARTÍNEZ ROJAS", status: "Sin antecedentes registrados" },
    contraloria: { found: true, isFiscalResponsible: false, verificationCode: "79123456MOCK0004", certifiedAt: "2026-08-10T09:15:00" },
    ramaJudicial: { total: 0, cases: [] },
    contaduria: { found: true, delinquentDebtor: false, defaultedAgreement: false },
    policia: { found: true, hasRecords: false, status: "Sin antecedentes registrados", records: [] },
    adres: {
      found: true,
      currentAffiliation: { eps: "NUEVA EPS", regimen: "Contributivo", status: "Activo", affiliateType: "Cotizante", startDate: "2019-03-01" },
      history: [{ eps: "NUEVA EPS", regimen: "Contributivo", status: "Activo", affiliateType: "Cotizante", startDate: "2019-03-01" }],
    },
    simit: { found: true, clear: true, totalFines: 0, payableTotal: 0, fines: [], agreements: [] },
  },

  // Persona natural, hallazgos mixtos: antecedente penal vigente, EPS inactiva y multas de tránsito pendientes.
  "1032456789": {
    doc: "1032456789",
    docType: "CC",
    rues: { found: false, entity: null },
    sanctions: { count: 0, sanctions: [] },
    contracts: { count: 0, contracts: [] },
    procuraduria: { found: true, hasRecords: false, fullName: "CAMILO ANDRÉS PEÑA URIBE", status: "Sin antecedentes registrados" },
    contraloria: { found: true, isFiscalResponsible: false, verificationCode: "1032456789MOCK0005", certifiedAt: "2026-08-10T09:20:00" },
    ramaJudicial: { total: 0, cases: [] },
    contaduria: { found: true, delinquentDebtor: false, defaultedAgreement: false },
    policia: {
      found: true,
      hasRecords: true,
      status: "Registra antecedente penal vigente",
      records: [{ type: "Penal", authority: "Fiscalía Seccional Bogotá", status: "Vigente", date: "2024-09-12" }],
    },
    adres: {
      found: true,
      currentAffiliation: { eps: "COOSALUD EPS", regimen: "Subsidiado", status: "Inactivo", affiliateType: "Beneficiario", startDate: "2015-01-10" },
      history: [{ eps: "COOSALUD EPS", regimen: "Subsidiado", status: "Inactivo", affiliateType: "Beneficiario", startDate: "2015-01-10" }],
    },
    simit: {
      found: true,
      clear: false,
      totalFines: 2,
      payableTotal: 1284000,
      fines: [
        { description: "Exceso de velocidad", authority: "Secretaría de Movilidad de Bogotá", department: "BOGOTÁ", date: "2025-11-02", value: 654000 },
        { description: "Estacionar en sitio prohibido", authority: "Secretaría de Movilidad de Bogotá", department: "BOGOTÁ", date: "2026-01-18", value: 630000 },
      ],
      agreements: [],
    },
  },
};

// Índice liviano para búsqueda por nombre (search.js hace la normalización/cascada).
export const NAME_INDEX = [
  { doc: "900111222", docType: "NIT", name: "INGENIERIA ANDINA SAS" },
  { doc: "860513493", docType: "NIT", name: "CONSTRUCTORA BOLIVAR BOGOTA S.A." },
  { doc: "900555333", docType: "NIT", name: "OBRAS Y DISEÑOS INTEGRALES SAS" },
  { doc: "79123456", docType: "CC", name: "JOSÉ LUIS MARTÍNEZ ROJAS" },
  { doc: "1032456789", docType: "CC", name: "CAMILO ANDRÉS PEÑA URIBE" },
];

// Contrato de ejemplo con línea de tiempo, adiciones, garantías y plan de entrega.
export const CONTRACTS = {
  "CO1.PCCNTR.4891120": {
    found: true,
    contract: {
      contractId: "CO1.PCCNTR.4891120",
      entity: "FONDO NACIONAL DEL AHORRO",
      entityNit: "899999068",
      provider: "CONSTRUCTORA BOLIVAR BOGOTA S.A.",
      providerDocument: "860513493",
      value: 2340000000,
      object: "Construcción de proyecto de vivienda de interés social — Etapa II",
      signDate: "2025-11-04",
      startDate: "2025-11-18",
      endDate: "2026-11-18",
      status: "En ejecución",
      additions: [
        { date: "2026-05-02", value: 210000000, description: "Adición por mayores cantidades de obra" },
      ],
      guarantees: [
        { insurer: "SEGUROS DEL ESTADO S.A.", type: "Cumplimiento", validFrom: "2025-11-18", validTo: "2026-12-18", value: 468000000 },
        { insurer: "SEGUROS DEL ESTADO S.A.", type: "Responsabilidad civil extracontractual", validFrom: "2025-11-18", validTo: "2026-11-18", value: 234000000 },
      ],
      deliveryPlan: [
        { item: "Cimentación y estructura", plannedPct: 30, actualPct: 30, plannedDate: "2026-02-18" },
        { item: "Mampostería y redes", plannedPct: 60, actualPct: 52, plannedDate: "2026-06-18" },
        { item: "Acabados", plannedPct: 90, actualPct: 40, plannedDate: "2026-09-18" },
        { item: "Entrega final", plannedPct: 100, actualPct: 40, plannedDate: "2026-11-18" },
      ],
      paidToDate: 1450800000,
      invoicedValue: 1544400000,
    },
  },
};

// Entidades "semilla" usadas por el Módulo 5 (oportunidades) — ver services/opportunities.js.
export const OPPORTUNITY_SEED_ENTITIES = [
  { nit: "899999061", name: "ALCALDÍA MAYOR DE BOGOTÁ D.C." },
  { nit: "890905211", name: "ALCALDÍA DE MEDELLÍN" },
  { nit: "890399011", name: "ALCALDÍA DE CALI" },
  { nit: "899999068", name: "FONDO NACIONAL DEL AHORRO" },
  { nit: "899999059", name: "INVIAS" },
];

export const OPPORTUNITIES = [
  { noticeUid: "CO1.NTC.9981204", processId: "CO1.REQ.9981001", reference: "IDU-SAMC-041-2026", name: "Mantenimiento de vías terciarias zona rural", entity: "ALCALDÍA MAYOR DE BOGOTÁ D.C.", entityNit: "899999061", modality: "Selección abreviada", contractType: "Obra", sector: "Construcción e infraestructura", unspsc: "72000000", basePrice: 185000000, phase: "Presentación de oferta", procedureStatus: "Publicado", publishedDate: "2026-08-05", closingDate: "2026-08-25", url: "https://community.secop.gov.co/Public/Tendering/OpportunityDetail/Index?noticeUID=CO1.NTC.9981204" },
  { noticeUid: "CO1.NTC.9981399", processId: "CO1.REQ.9981150", reference: "SDS-MC-118-2026", name: "Suministro de dotación hospitalaria e insumos médicos", entity: "ALCALDÍA MAYOR DE BOGOTÁ D.C.", entityNit: "899999061", modality: "Mínima cuantía", contractType: "Suministro", sector: "Salud", unspsc: "42000000", basePrice: 64000000, phase: "Presentación de oferta", procedureStatus: "Publicado", publishedDate: "2026-08-10", closingDate: "2026-08-22", url: "https://community.secop.gov.co/Public/Tendering/OpportunityDetail/Index?noticeUID=CO1.NTC.9981399" },
  { noticeUid: "CO1.NTC.9982004", processId: "CO1.REQ.9982450", reference: "MED-LP-007-2026", name: "Desarrollo de software para trámites ciudadanos", entity: "ALCALDÍA DE MEDELLÍN", entityNit: "890905211", modality: "Licitación pública", contractType: "Prestación de servicios", sector: "Tecnología", unspsc: "81110000", basePrice: 420000000, phase: "Evaluación de ofertas", procedureStatus: "Publicado", publishedDate: "2026-08-01", closingDate: "2026-08-30", url: "https://community.secop.gov.co/Public/Tendering/OpportunityDetail/Index?noticeUID=CO1.NTC.9982004" },
  { noticeUid: "CO1.NTC.9982211", processId: "CO1.REQ.9982600", reference: "CALI-MC-092-2026", name: "Servicio de aseo y cafetería para sedes administrativas", entity: "ALCALDÍA DE CALI", entityNit: "890399011", modality: "Mínima cuantía", contractType: "Prestación de servicios", sector: "Servicios generales", unspsc: "76000000", basePrice: 38000000, phase: "Presentación de oferta", procedureStatus: "Publicado", publishedDate: "2026-08-12", closingDate: "2026-08-20", url: "https://community.secop.gov.co/Public/Tendering/OpportunityDetail/Index?noticeUID=CO1.NTC.9982211" },
  { noticeUid: "CO1.NTC.9982450", processId: "CO1.REQ.9982900", reference: "FNA-SAMC-015-2026", name: "Interventoría técnica de proyectos de vivienda VIS", entity: "FONDO NACIONAL DEL AHORRO", entityNit: "899999068", modality: "Selección abreviada", contractType: "Consultoría", sector: "Construcción e infraestructura", unspsc: "81101500", basePrice: 512000000, phase: "Presentación de oferta", procedureStatus: "Publicado", publishedDate: "2026-08-08", closingDate: "2026-08-28", url: "https://community.secop.gov.co/Public/Tendering/OpportunityDetail/Index?noticeUID=CO1.NTC.9982450" },
  { noticeUid: "CO1.NTC.9982677", processId: "CO1.REQ.9983010", reference: "INVIAS-MC-201-2026", name: "Suministro de señalización vial reflectiva", entity: "INVIAS", entityNit: "899999059", modality: "Mínima cuantía", contractType: "Suministro", sector: "Construcción e infraestructura", unspsc: "72000000", basePrice: 29500000, phase: "Presentación de oferta", procedureStatus: "Publicado", publishedDate: "2026-08-13", closingDate: "2026-08-21", url: "https://community.secop.gov.co/Public/Tendering/OpportunityDetail/Index?noticeUID=CO1.NTC.9982677" },
  { noticeUid: "CO1.NTC.9982801", processId: "CO1.REQ.9983150", reference: "MED-MC-140-2026", name: "Adquisición de equipos de cómputo para colegios públicos", entity: "ALCALDÍA DE MEDELLÍN", entityNit: "890905211", modality: "Mínima cuantía", contractType: "Suministro", sector: "Tecnología", unspsc: "43210000", basePrice: 91000000, phase: "Presentación de oferta", procedureStatus: "Publicado", publishedDate: "2026-08-11", closingDate: "2026-08-24", url: "https://community.secop.gov.co/Public/Tendering/OpportunityDetail/Index?noticeUID=CO1.NTC.9982801" },
  { noticeUid: "CO1.NTC.9982955", processId: "CO1.REQ.9983300", reference: "CALI-SAMC-055-2026", name: "Suministro de alimentación escolar — PAE", entity: "ALCALDÍA DE CALI", entityNit: "890399011", modality: "Selección abreviada", contractType: "Suministro", sector: "Alimentos", unspsc: "50000000", basePrice: 780000000, phase: "Presentación de oferta", procedureStatus: "Publicado", publishedDate: "2026-08-04", closingDate: "2026-08-26", url: "https://community.secop.gov.co/Public/Tendering/OpportunityDetail/Index?noticeUID=CO1.NTC.9982955" },

  // Procesos ya cerrados de las mismas entidades — no se muestran como oportunidad,
  // pero alimentan el historial de "ganadores anteriores" para procesos similares.
  { noticeUid: "CO1.NTC.9711002", processId: "CO1.REQ.9711500", reference: "IDU-SAMC-019-2026", name: "VIALCON INGENIERÍA S.A.S.", entity: "ALCALDÍA MAYOR DE BOGOTÁ D.C.", entityNit: "899999061", modality: "Contratación directa", contractType: "Obra", basePrice: 210000000, phase: "Adjudicado", procedureStatus: "Adjudicado", publishedDate: "2026-05-14", url: "https://community.secop.gov.co/Public/Tendering/OpportunityDetail/Index?noticeUID=CO1.NTC.9711002" },
  { noticeUid: "CO1.NTC.9698811", processId: "CO1.REQ.9699100", reference: "IDU-SAMC-011-2026", name: "OBRAS CIVILES DEL NORTE SAS", entity: "ALCALDÍA MAYOR DE BOGOTÁ D.C.", entityNit: "899999061", modality: "Contratación directa", contractType: "Obra", basePrice: 168000000, phase: "Adjudicado", procedureStatus: "Adjudicado", publishedDate: "2026-03-02", url: "https://community.secop.gov.co/Public/Tendering/OpportunityDetail/Index?noticeUID=CO1.NTC.9698811" },
  { noticeUid: "CO1.NTC.9705320", processId: "CO1.REQ.9705800", reference: "IDU-SAMC-014-2026", name: "VIALCON INGENIERÍA S.A.S.", entity: "ALCALDÍA MAYOR DE BOGOTÁ D.C.", entityNit: "899999061", modality: "Contratación directa", contractType: "Obra", basePrice: 195000000, phase: "Adjudicado", procedureStatus: "Adjudicado", publishedDate: "2026-04-20", url: "https://community.secop.gov.co/Public/Tendering/OpportunityDetail/Index?noticeUID=CO1.NTC.9705320" },
  { noticeUid: "CO1.NTC.9612044", processId: "CO1.REQ.9612500", reference: "MED-LP-002-2026", name: "SOFTPUBLICA COLOMBIA SAS", entity: "ALCALDÍA DE MEDELLÍN", entityNit: "890905211", modality: "Contratación directa", contractType: "Prestación de servicios", basePrice: 380000000, phase: "Adjudicado", procedureStatus: "Adjudicado", publishedDate: "2026-01-18", url: "https://community.secop.gov.co/Public/Tendering/OpportunityDetail/Index?noticeUID=CO1.NTC.9612044" },
  { noticeUid: "CO1.NTC.9855100", processId: "CO1.REQ.9855400", reference: "CALI-LP-030-2026", name: "UNION TEMPORAL VIAS CALI 2026", entity: "ALCALDÍA DE CALI", entityNit: "890399011", modality: "Licitación pública", contractType: "Obra", basePrice: 890000000, phase: "Adjudicado", procedureStatus: "Adjudicado", publishedDate: "2026-02-10", url: "https://community.secop.gov.co/Public/Tendering/OpportunityDetail/Index?noticeUID=CO1.NTC.9855100" },
];

// Módulo — Concentración de contratistas. Detalle por proceso (proveedor real +
// valor de adjudicación), lo único que trae esa forma — el listado liviano de
// arriba no incluye ganador ni valor adjudicado. Solo cubre los notice_uid ya
// cerrados que aparecen en OPPORTUNITIES; cualquier otro responde found:false.
export const PROCESS_DETAILS = {
  "CO1.NTC.9711002": { contracts: [{ contractId: "CO1.PCCNTR.7711002", provider: "VIALCON INGENIERÍA S.A.S.", providerDocument: "900412233", isGroup: false, value: 210000000, signDate: "2026-05-20" }] },
  "CO1.NTC.9698811": { contracts: [{ contractId: "CO1.PCCNTR.7698811", provider: "OBRAS CIVILES DEL NORTE SAS", providerDocument: "901223344", isGroup: false, value: 168000000, signDate: "2026-03-10" }] },
  "CO1.NTC.9705320": { contracts: [{ contractId: "CO1.PCCNTR.7705320", provider: "VIALCON INGENIERÍA S.A.S.", providerDocument: "900412233", isGroup: false, value: 195000000, signDate: "2026-04-28" }] },
  "CO1.NTC.9612044": { contracts: [{ contractId: "CO1.PCCNTR.7612044", provider: "SOFTPUBLICA COLOMBIA SAS", providerDocument: "900778899", isGroup: false, value: 380000000, signDate: "2026-01-25" }] },
  "CO1.NTC.9855100": { contracts: [{ contractId: "CO1.PCCNTR.7855100", provider: "UNION TEMPORAL VIAS CALI 2026-VIALCON-CIVILNORTE", providerDocument: null, isGroup: true, value: 890000000, signDate: "2026-02-18" }] },
};
