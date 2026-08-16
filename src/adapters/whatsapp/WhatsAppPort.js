/**
 * Puerto de envío de WhatsApp — mismo patrón que EmailPort: el motor de
 * verificación nunca sabe qué proveedor hay detrás.
 */
export class WhatsAppPort {
  /** @param {{to:string, message:string}} payload */
  async send(_payload) {
    throw new Error("not implemented");
  }
}
