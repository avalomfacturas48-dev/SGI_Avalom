import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function GET(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const [totalProperties, totalClients, activeRentals, canceledRentals] =
        await Promise.all([
          prisma.ava_propiedad.count(),
          prisma.ava_cliente.count(),
          prisma.ava_alquiler.count({ where: { alq_estado: "A" } }),
          prisma.ava_alquiler.count({ where: { alq_estado: "C" } }),
        ]);
      return NextResponse.json(
        {
          success: true,
          data: stringifyWithBigInt({
            totalProperties,
            totalClients,
            activeRentals,
            canceledRentals,
          }),
        },
        { status: 200 }
      );
    } catch (error) {
      console.error(error);
      return NextResponse.json(
        { success: false, error: "Error al obtener datos del overview" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
