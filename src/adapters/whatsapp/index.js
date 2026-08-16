import { MockWhatsAppAdapter } from "./MockWhatsAppAdapter.js";

/**
 * Punto de composición del envío de WhatsApp — hoy solo existe el adaptador
 * simulado. Conectar un proveedor real (WhatsApp Business API vía Meta,
 * Twilio) es agregar un adaptador nuevo que implemente WhatsAppPort y una
 * rama aquí seleccionada por `WHATSAPP_PROVIDER`, sin tocar companies.js ni
 * las rutas.
 */
export function buildWhatsAppAdapter() {
  const provider = process.env.WHATSAPP_PROVIDER || "mock";
  if (provider !== "mock") {
    console.warn(`[RASTRO] WHATSAPP_PROVIDER="${provider}" no tiene adaptador implementado todavía — usando MockWhatsAppAdapter.`);
  }
  return new MockWhatsAppAdapter();
}
