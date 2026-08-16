import { listOpportunities, matchesSector } from "./opportunities.js";
import { subscribersMatching } from "./companies.js";
import { collection } from "../store/jsonStore.js";
import { SECTORS } from "../config/opportunitySeeds.js";

/**
 * Módulo — Alertas de oportunidad ("email marketing" del pitch original,
 * reencuadrado como suscripción opt-in). Objetivo: que una pyme se entere de
 * una licitación nueva en su sector/ubicación al mismo tiempo que cualquier
 * otra, sin tener que revisar Modo Oportunidad manualmente.
 *
 * RASTRO es stateless por diseño (todo se recalcula contra Croma en cada
 * consulta) — "nueva" solo tiene sentido comparando contra lo último visto,
 * así que este es el único módulo que lee/escribe estado persistente de
 * negocio (data/seen_opportunities.json) en vez de solo cachear.
 */

function opportunityKey(p) {
  return p.noticeUid || p.processId || `${p.entityNit}:${p.reference}`;
}

function sectorsFor(process) {
  return SECTORS.filter((s) => matchesSector(process, s));
}

function notificationEmail(company, opportunity) {
  const value = opportunity.basePrice ? `$${Number(opportunity.basePrice).toLocaleString("es-CO")}` : "valor no especificado";
  return {
    to: company.email,
    subject: `RASTRO — nueva oportunidad en ${opportunity.entityLocation}: ${opportunity.name}`.slice(0, 140),
    html: `
      <p>Hola,</p>
      <p>Se publicó una nueva oportunidad que coincide con tu suscripción (${company.subscription.sector} · ${company.subscription.location}):</p>
      <ul>
        <li><strong>${opportunity.name}</strong></li>
        <li>Entidad: ${opportunity.entity} (${opportunity.entityLocation})</li>
        <li>Valor base: ${value}</li>
        <li>Referencia: ${opportunity.reference || "N/D"}</li>
      </ul>
      ${opportunity.url ? `<p><a href="${opportunity.url}">Ver proceso completo</a></p>` : ""}
      <p style="font-size:12px;color:#666">RASTRO — no crea información nueva, solo la cruza y organiza. Cambia tus preferencias de alerta desde tu panel de empresa.</p>
    `,
    text: `Nueva oportunidad: ${opportunity.name} — ${opportunity.entity} (${opportunity.entityLocation}). Valor base: ${value}.`,
  };
}

/**
 * Recorre Modo Oportunidad sin filtro, detecta procesos no vistos antes, y
 * notifica a las empresas suscritas que coincidan en sector/ubicación.
 * Idempotente: un proceso ya notificado no vuelve a disparar correo aunque
 * se vuelva a ejecutar (se marca en seen_opportunities antes de intentar
 * el envío, para no reintentar en bucle si un envío individual falla).
 */
export async function pollNewOpportunities(source, emailAdapter) {
  const seen = collection("seen_opportunities");
  const { opportunities } = await listOpportunities(source, {});

  const fresh = opportunities.filter((p) => !seen.find((s) => s.key === opportunityKey(p)));

  let notified = 0;
  const results = [];
  for (const p of fresh) {
    seen.insert({ key: opportunityKey(p), firstSeenAt: new Date().toISOString() });

    const matches = subscribersMatching({ sectors: sectorsFor(p), location: p.entityLocation });
    for (const company of matches) {
      try {
        await emailAdapter.send(notificationEmail(company, p));
        notified += 1;
      } catch (err) {
        results.push({ opportunity: opportunityKey(p), company: company.email, error: err.message });
      }
    }
  }

  return { checked: opportunities.length, newOpportunities: fresh.length, notificationsSent: notified, errors: results };
}
