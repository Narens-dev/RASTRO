/**
 * Shared types mirroring the JSON contracts of the RASTRO Express API
 * (repo root `src/routes/api.js`, `src/services/*`). Kept here — not
 * generated — since the upstream is a small, stable, hand-written API.
 */

export type DocType = "NIT" | "CC" | "CE";

export interface SearchCandidate {
  doc: string | null;
  docType: DocType;
  name: string | null;
  status: string | null;
  source: string | null;
}

export interface SearchResponse {
  queryType: "document" | "name" | "empty";
  matchedVariant?: string;
  candidates: SearchCandidate[];
}

export type EvidenceLevel = "alto" | "sin_hallazgo" | "limpio";

export interface EvidenceItem {
  source: string;
  sourceLabel: string;
  level: EvidenceLevel;
  levelLabel: string;
  summary: string;
  detail: unknown;
  url: string | null;
  checkedAt: string;
}

export interface ContractHistoryItem {
  contractId: string;
  entity: string;
  entityNit: string;
  value: number;
  status: string;
  signDate: string | null;
  description: string;
}

export interface Expediente {
  doc: string;
  docType: DocType;
  name: string | null;
  consultedAt: string;
  rues: { status: string; chamberName?: string } | null;
  evidence: EvidenceItem[];
  counts: Record<EvidenceLevel, number>;
  contractHistory: { count: number; contracts: ContractHistoryItem[] };
}

export interface AiSummaryResponse {
  available: boolean;
  text?: string;
  reason?: string;
}

export interface ContractAddition {
  date: string | null;
  value: number | null;
  description: string;
}

export interface ContractGuarantee {
  insurer: string | null;
  type: string | null;
  validFrom: string | null;
  validTo: string | null;
  value: number | null;
}

export interface ContractDeliveryItem {
  item: string | null;
  plannedPct: number | null;
  actualPct: number | null;
  plannedDate: string | null;
}

export interface ContractDetail {
  contractId: string;
  entity: string;
  entityNit: string;
  provider: string | null;
  providerDocument: string | null;
  value: number;
  object: string;
  signDate: string | null;
  startDate: string | null;
  endDate: string | null;
  status: string;
  additions: ContractAddition[];
  guarantees: ContractGuarantee[];
  deliveryPlan: ContractDeliveryItem[];
  paidToDate: number | null;
  invoicedValue: number;
  invoicedFormatted: string;
  valueFormatted: string;
  totalValueFormatted: string;
  totalValue: number;
  paidToDateFormatted: string;
  pending: number;
  pendingFormatted: string;
}

export type AlignmentStatus = "alineado" | "alerta_atraso" | "adelantado" | "sin_datos";

export interface AlignmentSignal {
  status: AlignmentStatus;
  label: string;
  detail: string;
  timeElapsedPct: number | null;
  paidPct: number | null;
  physicalProgressPct: number | null;
}

export interface TimelineEvent {
  date: string;
  type: "firma" | "inicio" | "adicion" | "hito" | "fin";
  label: string;
  actualPct?: number;
  plannedPct?: number;
}

export interface ContractTracking {
  found: boolean;
  contract: ContractDetail;
  timeline: TimelineEvent[];
  alignment: AlignmentSignal;
}

export interface OpportunityWinner {
  name: string;
  count: number;
  lastDate: string | null;
}

export interface Opportunity {
  noticeUid: string;
  processId: string;
  reference: string;
  name: string;
  entity: string;
  entityNit: string;
  entityLocation?: string;
  modality: string;
  contractType: string;
  basePrice: number;
  phase: string;
  procedureStatus: string;
  publishedDate: string;
  url: string;
  previousWinners?: OpportunityWinner[];
}

export interface OpportunitiesResponse {
  count: number;
  totalMatched: number;
  capped: boolean;
  filters: { sector: string; location: string; minValue: number | null; maxValue: number | null };
  opportunities: Opportunity[];
}

export interface SeedEntity {
  nit: string;
  name: string;
  location: string;
}

export interface MetaResponse {
  dataSource: "mock" | "croma";
  degraded: boolean;
  sectors: string[];
  locations: string[];
  entities: SeedEntity[];
}

export interface CompanySubscription {
  active: boolean;
  sector: string;
  location: string;
}

export interface Company {
  id: string;
  nit: string;
  name: string;
  email: string;
  role: "empresa" | "estado";
  subscription: CompanySubscription;
  createdAt: string;
}

export interface OpportunityNotification {
  id: string;
  to: string;
  subject: string;
  html: string;
  text: string;
  provider: string;
  sentAt: string;
}

export interface ConcentrationProvider {
  name: string;
  document: string | null;
  contractCount: number;
  totalValue: number;
  hasGroupContract: boolean;
  lastDate: string | null;
  pctOfValue: number;
}

export interface ConcentrationResponse {
  entityNit: string;
  entityName: string | null;
  windowDays: number;
  totalProcessesInWindow: number;
  sampleSize: number;
  processesOpened: number;
  processesAwarded: number;
  capped: boolean;
  totalValueAnalyzed: number;
  providerCount: number;
  topProviders: ConcentrationProvider[];
  top3ConcentrationPct: number | null;
  generatedAt: string;
}

export type PersonaDocType = "CC" | "CE";

export interface PersonaDossier {
  doc: string;
  docType: PersonaDocType;
  name: string | null;
  consultedAt: string;
  evidence: EvidenceItem[];
  counts: Record<EvidenceLevel, number>;
}
