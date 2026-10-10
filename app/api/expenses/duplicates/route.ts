import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";
import { zDate, zId, zMoney, zOptId } from "@/lib/validation";

const querySchema = z.object({
  gas_tipo: z.enum(["S", "M"]),
  edi_id: zId,
  ser_id: zOptId,
  gas_concepto: z.string().trim().optional(),
  gas_monto: zMoney,
  gas_fecha: zDate,
  gas_referencia: z.string().trim().optional(),
  /** Al editar, el propio gasto no cuenta como duplicado */
  exclude_id: zOptId,
});

/**
 * Gastos activos que podrían ser el mismo que se va a guardar: mismo edificio,
 * mismo servicio (o concepto, si es mantenimiento) y mismo mes, que además
 * coinciden en monto o en referencia.
 */
export async function GET(request: NextRequest) {
  return authenticate(async () => {
    const parsed = querySchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams)
    );
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message ?? "Parámetros inválidos" },
        { status: 400 }
      );
    }
    const q = parsed.data;

    const fecha = q.gas_fecha;
    const inicioMes = new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), 1));
    const finMes = new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth() + 1, 1));
    const referencia = q.gas_referencia || undefined;

    const candidates = await prisma.ava_gasto.findMany({
      where: {
        gas_estado: "A",
        edi_id: q.edi_id,
        gas_tipo: q.gas_tipo,
        ...(q.gas_tipo === "S"
          ? { ser_id: q.ser_id ?? undefined }
          : { gas_concepto: { equals: q.gas_concepto ?? "", mode: "insensitive" } }),
        gas_fecha: { gte: inicioMes, lt: finMes },
        ...(q.exclude_id ? { NOT: { gas_id: q.exclude_id } } : {}),
        OR: [
          { gas_monto: q.gas_monto },
          ...(referencia ? [{ gas_referencia: referencia }] : []),
        ],
      },
      include: { ava_servicio: true, ava_propiedad: true },
      orderBy: [{ gas_fecha: "desc" }, { gas_id: "desc" }],
      take: 5,
    });

    return NextResponse.json({
      success: true,
      data: stringifyWithBigInt(candidates),
    });
  })(request, new NextResponse());
}
