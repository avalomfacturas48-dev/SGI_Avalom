import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";
import { parseBody } from "@/lib/validation";
import { depositPaymentSchema } from "@/lib/schemas/apiSchemas";
import { BusinessRuleError } from "@/lib/errors";

export async function POST(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const parsed = await parseBody(req, depositPaymentSchema);
      if (!parsed.success) return parsed.response;
      const { depo_id, pag_monto, ...pago } = parsed.data;

      const result = await prisma.$transaction(async (tx) => {
        const currentDeposit = await tx.ava_deposito.findUnique({
          where: { depo_id },
        });

        if (!currentDeposit) {
          throw new BusinessRuleError("El depósito no existe.");
        }

        const pendiente = currentDeposit.depo_total - currentDeposit.depo_montoactual;
        if (pag_monto > pendiente) {
          throw new BusinessRuleError(
            `El monto supera el saldo pendiente del depósito (₡${pendiente.toString()}).`
          );
        }

        const payment = await tx.ava_pago.create({
          data: { ...pago, pag_monto, pag_estado: "A", depo_id },
        });

        const updatedDeposit = await tx.ava_deposito.update({
          where: { depo_id },
          data: {
            depo_montoactual: currentDeposit.depo_montoactual + pag_monto,
          },
        });

        return { payment, updatedDeposit };
      });

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(result) },
        { status: 201 }
      );
    } catch (error) {
      if (error instanceof BusinessRuleError) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }
      console.error("Error al procesar el pago:", error);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
