import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ alqId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const params = await context.params;

      const deposit = await prisma.ava_deposito.findFirst({
        where: { alq_id: BigInt(params.alqId) },
      });

      if (!deposit) {
        return NextResponse.json(
          { success: false, error: "Depósito no encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(deposit) },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error al obtener el depósito:", error);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
