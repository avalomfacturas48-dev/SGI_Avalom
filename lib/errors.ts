/**
 * Error de una regla de negocio dentro de una transacción (monto excedido,
 * registro inexistente, etc.). El handler lo convierte en una respuesta 400
 * con el mensaje, en vez de un 500 genérico.
 */
export class BusinessRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BusinessRuleError";
  }
}
