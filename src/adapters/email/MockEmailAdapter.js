import { EmailPort } from "./EmailPort.js";
import { collection } from "../../store/jsonStore.js";

/**
 * Adaptador de respaldo — nunca falla, nunca necesita credenciales. En vez
 * de enviar de verdad, registra cada correo en `data/outbox_emails.json`
 * (consultable vía GET /api/companies/me/notifications) para poder
 * demostrar el flujo de alertas sin depender de un proveedor real.
 */
export class MockEmailAdapter extends EmailPort {
  async send(message) {
    const row = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      ...message,
      provider: "mock",
      sentAt: new Date().toISOString(),
    };
    collection("outbox_emails").insert(row);
    console.log(`[RASTRO][email-mock] → ${message.to}: ${message.subject}`);
    return { ok: true, id: row.id };
  }
}
