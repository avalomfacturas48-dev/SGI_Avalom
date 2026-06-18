import { AvaAlquiler, Cliente } from "@/lib/types";

/** Nombre completo de un cliente, sin espacios sobrantes. */
export function getClientFullName(cliente?: Cliente | null): string {
  if (!cliente) return "";
  return `${cliente.cli_nombre} ${cliente.cli_papellido} ${
    cliente.cli_sapellido || ""
  }`.trim();
}

/** Iniciales (nombre + primer apellido) para avatares. */
export function getClientInitials(cliente?: Cliente | null): string {
  if (!cliente) return "?";
  const n = cliente.cli_nombre?.charAt(0)?.toUpperCase() ?? "";
  const a = cliente.cli_papellido?.charAt(0)?.toUpperCase() ?? "";
  return `${n}${a}` || "?";
}

/** Lista de clientes asociados a un alquiler. */
export function getRentalTenants(rental?: AvaAlquiler | null): Cliente[] {
  if (!rental?.ava_clientexalquiler?.length) return [];
  return rental.ava_clientexalquiler
    .map((cxa) => cxa.ava_cliente)
    .filter(Boolean) as Cliente[];
}

/** Inquilino principal de un alquiler (el primero asociado). */
export function getPrimaryTenant(rental?: AvaAlquiler | null): Cliente | null {
  return getRentalTenants(rental)[0] ?? null;
}
