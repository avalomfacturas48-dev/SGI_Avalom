import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";
import { parseBody } from "@/lib/validation";
import { monthlyRentSaveAllSchema } from "@/lib/schemas/apiSchemas";

export async function POST(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const parsed = await parseBody(request, monthlyRentSaveAllSchema);
      if (!parsed.success) return parsed.response;
      const { rents, alqId } = parsed.data;

      // Transacción para guardar todos los alquileres mensuales
      const savedRents = await prisma.$transaction(async (prisma) => {
        const results = [];

        for (const rent of rents) {
          const savedRent = await prisma.ava_alquilermensual.create({
            data: {
              ...rent,
              alqm_montopagado: BigInt(0),
              alqm_fechapago: rent.alqm_fechapago ?? null,
              alq_id: alqId,
            },
          });
          results.push(savedRent);
        }

        return results;
      });

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(savedRents) },
        { status: 201 }
      );
    } catch (error: any) {
      console.error(
        "Error al guardar los alquileres mensuales: ",
        error?.message || error
      );
      return NextResponse.json(
        { success: false, error: "Error interno del servidor." },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
