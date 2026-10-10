import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";
import { pagoWithAnulacionInclude } from "@/lib/constants/prismaIncludes";
import { parseBody } from "@/lib/validation";
import { depositUpdateSchema } from "@/lib/schemas/apiSchemas";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ depoId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const params = await context.params;
      const parsed = await parseBody(req, depositUpdateSchema);
      if (!parsed.success) return parsed.response;
      const data = parsed.data;

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

      if (data.depo_total < deposit.depo_montoactual) {
        return NextResponse.json(
          {
            success: false,
            error: "El total del depósito no puede ser menor a lo ya pagado.",
          },
          { status: 400 }
        );
      }

      const updatedDeposit = await prisma.ava_deposito.update({
        where: { depo_id: BigInt(params.depoId) },
        data: {
          depo_total: BigInt(data.depo_total),
        },
        include: pagoWithAnulacionInclude,
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
