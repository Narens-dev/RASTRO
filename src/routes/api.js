import { Router } from "express";
import { search } from "../services/search.js";
import { buildExpediente } from "../services/scoreEngine.js";
import { buildContractTracking } from "../services/contractTracking.js";
import { listOpportunities } from "../services/opportunities.js";
import { buildConcentration } from "../services/concentration.js";
import { summarizeExpediente } from "../services/aiSummary.js";
import { OPPORTUNITY_SEED_ENTITIES, SECTORS } from "../config/opportunitySeeds.js";
import { buildPersonaDossier } from "../services/backgroundCheck.js";
import { registerCompany, beginLogin, completeLogin, updateSubscription, requestWhatsAppCode, verifyWhatsAppCode } from "../services/companies.js";
import { pollNewOpportunities } from "../services/notifications.js";
import { collection } from "../store/jsonStore.js";
import { requireAuth } from "../middleware/auth.js";

/**
 * Módulo 8 — API REST.
 * Único punto de contacto entre el frontend y toda la lógica de negocio de
 * los módulos anteriores. Sin lógica de negocio propia: cada handler solo
 * valida entrada, delega, y da forma a la respuesta HTTP.
 */
export function buildApiRouter(source, emailAdapter, whatsappAdapter) {
  const router = Router();

  router.get("/meta", (_req, res) => {
    res.json({
      dataSource: source.mode,
      degraded: source.degraded,
      sectors: ["Todos", ...SECTORS],
      locations: ["Todas", ...new Set(OPPORTUNITY_SEED_ENTITIES.map((e) => e.location))],
      entities: OPPORTUNITY_SEED_ENTITIES,
    });
  });

  router.get("/search", async (req, res) => {
    const q = (req.query.q || "").toString();
    if (!q.trim()) return res.status(400).json({ error: "Parámetro 'q' requerido." });
    try {
      const result = await search(source, q);
      res.json(result);
    } catch (err) {
      res.status(502).json({ error: "No fue posible completar la búsqueda.", detail: err.message });
    }
  });

  router.get("/entity/:docType/:doc", async (req, res) => {
    const { docType, doc } = req.params;
    if (!["NIT", "CC", "CE"].includes(docType.toUpperCase())) {
      return res.status(400).json({ error: "docType debe ser NIT, CC o CE." });
    }
    try {
      const expediente = await buildExpediente(source, { doc, docType: docType.toUpperCase(), name: req.query.name?.toString() });
      res.json(expediente);
    } catch (err) {
      res.status(502).json({ error: "No fue posible construir el expediente.", detail: err.message });
    }
  });

  router.get("/entity/:docType/:doc/summary", async (req, res) => {
    const { docType, doc } = req.params;
    try {
      const expediente = await buildExpediente(source, { doc, docType: docType.toUpperCase(), name: req.query.name?.toString() });
      const summary = await summarizeExpediente(expediente);
      res.json(summary);
    } catch (err) {
      res.status(502).json({ available: false, reason: err.message });
    }
  });

  router.get("/contract/:contractId", async (req, res) => {
    try {
      const tracking = await buildContractTracking(source, req.params.contractId);
      if (!tracking.found) return res.status(404).json({ error: "Contrato no encontrado.", contractId: req.params.contractId });
      res.json(tracking);
    } catch (err) {
      res.status(502).json({ error: "No fue posible obtener el seguimiento del contrato.", detail: err.message });
    }
  });

  router.get("/opportunities", async (req, res) => {
    const { sector, location } = req.query;
    const minValue = req.query.minValue ? Number(req.query.minValue) : null;
    const maxValue = req.query.maxValue ? Number(req.query.maxValue) : null;
    try {
      const result = await listOpportunities(source, {
        sector: sector?.toString(),
        location: location?.toString(),
        minValue,
        maxValue,
        includeWinners: req.query.winners === "true",
      });
      res.json(result);
    } catch (err) {
      res.status(502).json({ error: "No fue posible cargar las oportunidades.", detail: err.message });
    }
  });

  // Concentración de contratistas — para una entidad contratante (NIT), qué
  // tan repartidas o concentradas están sus adjudicaciones cerradas recientes
  // entre proveedores. Ver src/services/concentration.js para el porqué esto
  // usa proveedor+valor real en vez de un mapa de integrantes de consorcio.
  router.get("/concentration/:nit", async (req, res) => {
    try {
      const result = await buildConcentration(source, req.params.nit);
      res.json(result);
    } catch (err) {
      res.status(502).json({ error: "No fue posible calcular la concentración de contratistas.", detail: err.message });
    }
  });

  // --- Apartado Empresas: cuentas, suscripción a alertas, estudio de seguridad ---

  router.post("/companies/register", async (req, res) => {
    const { nit, email, password, sector, location } = req.body || {};
    const result = await registerCompany(source, { nit, email, password, sector, location });
    if (!result.ok) return res.status(400).json({ error: result.error });
    res.status(201).json({ company: result.company, token: result.token });
  });

  // Login en dos pasos: este endpoint solo valida credenciales y envía el
  // código por correo — nunca emite token. El token solo sale de
  // /companies/login/verify, tras confirmar el código.
  router.post("/companies/login", async (req, res) => {
    const { email, password } = req.body || {};
    try {
      const result = await beginLogin(emailAdapter, { email, password });
      if (!result.ok) return res.status(401).json({ error: result.error });
      res.json(result);
    } catch (err) {
      res.status(502).json({ error: "No fue posible enviar el código de verificación.", detail: err.message });
    }
  });

  router.post("/companies/login/verify", (req, res) => {
    const { email, code } = req.body || {};
    const result = completeLogin({ email, code });
    if (!result.ok) return res.status(401).json({ error: result.error });
    res.json({ company: result.company, token: result.token });
  });

  router.get("/companies/me", requireAuth, (req, res) => {
    res.json({ company: req.company });
  });

  router.put("/companies/me/subscription", requireAuth, (req, res) => {
    const { active, sector, location } = req.body || {};
    const company = updateSubscription(req.company.id, { active, sector, location });
    res.json({ company });
  });

  // Verificación de WhatsApp (Configuración) — mismo principio de honestidad
  // que el resto de RASTRO: sin un proveedor real conectado (WHATSAPP_PROVIDER),
  // el código se registra en data/outbox_whatsapp.json y se devuelve en la
  // respuesta en vez de fingir un envío real. Ver src/services/companies.js.
  router.post("/companies/me/whatsapp/request-code", requireAuth, async (req, res) => {
    const { phone } = req.body || {};
    if (!phone) return res.status(400).json({ error: "Número de WhatsApp requerido." });
    try {
      const result = await requestWhatsAppCode(whatsappAdapter, req.company.id, phone);
      if (!result.ok) return res.status(400).json({ error: result.error });
      res.json(result);
    } catch (err) {
      res.status(502).json({ error: "No fue posible enviar el código de verificación.", detail: err.message });
    }
  });

  router.post("/companies/me/whatsapp/verify", requireAuth, (req, res) => {
    const { code } = req.body || {};
    const result = verifyWhatsAppCode(req.company.id, code);
    if (!result.ok) return res.status(400).json({ error: result.error });
    res.json({ company: result.company });
  });

  // Visibilidad del envío simulado — permite demostrar el flujo de alertas
  // sin depender de un proveedor de correo real conectado.
  router.get("/companies/me/notifications", requireAuth, (req, res) => {
    const sent = collection("outbox_emails")
      .filter((m) => m.to === req.company.email)
      .sort((a, b) => b.sentAt.localeCompare(a.sentAt));
    res.json({ count: sent.length, notifications: sent });
  });

  // Dispara la detección de oportunidades nuevas + envío de alertas. Pensado
  // para un cron externo en producción; expuesto aquí (autenticado) para
  // poder demostrar el flujo bajo demanda durante el hackathon.
  router.post("/opportunities/poll", requireAuth, async (_req, res) => {
    try {
      const result = await pollNewOpportunities(source, emailAdapter);
      res.json(result);
    } catch (err) {
      res.status(502).json({ error: "No fue posible completar el sondeo de oportunidades.", detail: err.message });
    }
  });

  // Estudio de seguridad por cédula — antecedentes, EPS, multas de tránsito y
  // demás fuentes cruzadas en backgroundCheck.js. Restringido a cuentas
  // autenticadas: a diferencia del expediente de NIT (público), esta
  // información personal solo debe ser consultable por encargados de
  // contratación/RRHH de una empresa o por el Estado, no por cualquiera.
  router.get("/personas/:docType/:doc", requireAuth, async (req, res) => {
    const { docType, doc } = req.params;
    if (!["CC", "CE"].includes(docType.toUpperCase())) {
      return res.status(400).json({ error: "docType debe ser CC o CE." });
    }
    try {
      const dossier = await buildPersonaDossier(source, { doc, docType: docType.toUpperCase(), name: req.query.name?.toString() });
      res.json(dossier);
    } catch (err) {
      res.status(502).json({ error: "No fue posible construir el estudio de seguridad.", detail: err.message });
    }
  });

  // Resumen con IA del estudio de seguridad — mismo contrato y mismas reglas
  // que el resumen del expediente de NIT (summarizeExpediente ya es genérico:
  // solo lee doc/docType/name/evidence/counts). Narra la evidencia, nunca
  // decide si la persona es "apta" — ese veredicto no lo emite ni el motor
  // determinístico ni la IA. Autenticado igual que el resto de /personas.
  router.get("/personas/:docType/:doc/summary", requireAuth, async (req, res) => {
    const { docType, doc } = req.params;
    if (!["CC", "CE"].includes(docType.toUpperCase())) {
      return res.status(400).json({ error: "docType debe ser CC o CE." });
    }
    try {
      const dossier = await buildPersonaDossier(source, { doc, docType: docType.toUpperCase(), name: req.query.name?.toString() });
      const summary = await summarizeExpediente(dossier);
      res.json(summary);
    } catch (err) {
      res.status(502).json({ available: false, reason: err.message });
    }
  });

  return router;
}
