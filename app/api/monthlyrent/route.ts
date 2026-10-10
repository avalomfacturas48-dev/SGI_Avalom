import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";
import { parseBody } from "@/lib/validation";
import { monthlyRentCreateSchema } from "@/lib/schemas/apiSchemas";

export async function GET(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const monthlyRents = await prisma.ava_alquilermensual.findMany({
        include: {
          ava_alquiler: true,
        },
      });

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(monthlyRents) },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error al obtener los alquileres mensuales:", error);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

export async function POST(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const parsed = await parseBody(req, monthlyRentCreateSchema);
      if (!parsed.success) return parsed.response;
      const data = parsed.data;

      // Una mensualidad nueva no tiene pagos todavía
      const monthlyRent = await prisma.ava_alquilermensual.create({
        data: {
          ...data,
          alqm_montopagado: BigInt(0),
          alqm_fechapago: data.alqm_fechapago ?? null,
        },
      });

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(monthlyRent) },
        { status: 201 }
      );
    } catch (error) {
      console.error("Error al crear el alquiler mensual:", error);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
