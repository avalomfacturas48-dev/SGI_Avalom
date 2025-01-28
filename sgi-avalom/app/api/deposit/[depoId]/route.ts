import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ depoId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const params = await context.params;
      const data = await req.json();

      const deposit = await prisma.ava_deposito.findUnique({
        where: { depo_id: BigInt(params.depoId) },
        include: { ava_pago: true },
      });

      if (!deposit) {
        return NextResponse.json(
          { success: false, error: "Depósito no encontrado" },
          { status: 404 }
        );
      }

      if (deposit.ava_pago.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error:
              "No se puede editar el depósito porque tiene pagos relacionados.",
          },
          { status: 409 }
        );
      }

      const updatedDeposit = await prisma.ava_deposito.update({
        where: { depo_id: BigInt(params.depoId) },
        data: {
          depo_total: BigInt(data.depo_total),
        },
      });

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(updatedDeposit) },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Error al actualizar el depósito:", error.message);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
