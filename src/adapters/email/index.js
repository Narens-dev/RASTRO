import { MockEmailAdapter } from "./MockEmailAdapter.js";

/**
 * Punto de composición del envío de correo — hoy solo existe el adaptador
 * simulado. Conectar un proveedor real (Resend, SendGrid, SES) es agregar
 * un adaptador nuevo que implemente EmailPort y una rama aquí seleccionada
 * por `EMAIL_PROVIDER`, sin tocar notifications.js ni las rutas.
 */
export function buildEmailAdapter() {
  const provider = process.env.EMAIL_PROVIDER || "mock";
  if (provider !== "mock") {
    console.warn(`[RASTRO] EMAIL_PROVIDER="${provider}" no tiene adaptador implementado todavía — usando MockEmailAdapter.`);
  }
  return new MockEmailAdapter();
}
