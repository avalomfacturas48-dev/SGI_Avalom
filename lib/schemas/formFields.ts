/**
 * Montos en colones: la BD los guarda como enteros (BigInt), así que los
 * formularios solo aceptan dígitos, igual que valida el servidor.
 */
export const isMontoEntero = (value: string) => /^\d+$/.test(value.trim());

export const MONTO_ENTERO_MSG = "Debe ser un monto entero (sin decimales)";
