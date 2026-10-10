import type { Prisma } from "@prisma/client";

/** Pagos con su anulación (si existe) y el usuario que anuló. */
export const pagoWithAnulacionInclude = {
  ava_pago: {
    include: {
      ava_anulacionpago: {
        include: { ava_usuario: true },
      },
    },
  },
} satisfies Prisma.ava_alquilermensualInclude & Prisma.ava_depositoInclude;

/**
 * Propiedad con tipo, edificio y alquileres (con sus clientes).
 * La usan el GET, POST y PUT de propiedades para que el store reciba
 * siempre la misma forma.
 */
export const propertyDetailInclude = {
  ava_alquiler: {
    orderBy: { alq_fechapago: "desc" },
    include: {
      ava_clientexalquiler: {
        include: { ava_cliente: true },
      },
    },
  },
  ava_tipopropiedad: true,
  ava_edificio: true,
} satisfies Prisma.ava_propiedadInclude;

/**
 * Forma completa de un alquiler para la pantalla de edición.
 * La usan el GET de /api/modifiyrent/[alqId] y el PUT de /api/rent/[alqId],
 * así el cliente puede reemplazar el alquiler del store con la respuesta del
 * PUT sin perder propiedad, tipo, mensualidades ni depósito.
 */
export const rentalDetailInclude = {
  ava_propiedad: {
    include: {
      ava_edificio: true,
      ava_tipopropiedad: true,
    },
  },
  ava_alquilermensual: {
    include: pagoWithAnulacionInclude,
  },
  ava_clientexalquiler: {
    include: {
      ava_cliente: true,
    },
  },
  ava_deposito: {
    include: pagoWithAnulacionInclude,
  },
} satisfies Prisma.ava_alquilerInclude;
