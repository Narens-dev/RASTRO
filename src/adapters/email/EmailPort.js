/**
 * Puerto de envío de correo — mismo patrón que GovDataSource: el motor de
 * notificaciones nunca sabe qué proveedor hay detrás.
 */
export class EmailPort {
  /** @param {{to:string, subject:string, html:string, text?:string}} message */
  async send(_message) {
    throw new Error("not implemented");
  }
}
