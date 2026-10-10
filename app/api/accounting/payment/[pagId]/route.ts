import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ pagId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const { pagId } = await context.params;

      const monthlyRent = await prisma.ava_pago.findUnique({
        where: { pag_id: BigInt(pagId) },
        include: {
          ava_anulacionpago: true,
        },
      });

      if (!monthlyRent) {
        return NextResponse.json(
          { success: false, error: "Pago no encontrado" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(monthlyRent) },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error al obtener el pago: ", error);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

// Sin PUT a propósito: los pagos y anulaciones no se editan; se anulan y
// se registran de nuevo para no alterar la contabilidad.
