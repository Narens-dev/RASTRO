import { WhatsAppPort } from "./WhatsAppPort.js";
import { collection } from "../../store/jsonStore.js";

/**
 * Adaptador de respaldo — nunca falla, no requiere credenciales de WhatsApp
 * Business API. En vez de enviar de verdad, registra cada mensaje en
 * `data/outbox_whatsapp.json` (mismo patrón que MockEmailAdapter) para poder
 * demostrar el flujo de verificación sin depender de un proveedor real.
 */
export class MockWhatsAppAdapter extends WhatsAppPort {
  async send(payload) {
    const row = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...payload,
      provider: "mock",
      sentAt: new Date().toISOString(),
    };
    collection("outbox_whatsapp").insert(row);
    console.log(`[RASTRO][whatsapp-mock] → ${payload.to}: ${payload.message}`);
    return { ok: true, id: row.id };
  }
}
