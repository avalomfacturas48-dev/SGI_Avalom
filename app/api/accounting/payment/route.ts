import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";
import { parseBody } from "@/lib/validation";
import { monthlyPaymentSchema } from "@/lib/schemas/apiSchemas";
import { BusinessRuleError } from "@/lib/errors";

export async function POST(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const parsed = await parseBody(req, monthlyPaymentSchema);
      if (!parsed.success) return parsed.response;
      const { alqm_id, pag_monto, ...pago } = parsed.data;

      const result = await prisma.$transaction(async (tx) => {
        const currentMonthlyRent = await tx.ava_alquilermensual.findUnique({
          where: { alqm_id },
        });

        if (!currentMonthlyRent) {
          throw new BusinessRuleError("El alquiler mensual no existe.");
        }
        if (currentMonthlyRent.alqm_estado === "R") {
          throw new BusinessRuleError("No se puede pagar un mes regalado.");
        }

        const pendiente =
          currentMonthlyRent.alqm_montototal - currentMonthlyRent.alqm_montopagado;
        if (pag_monto > pendiente) {
          throw new BusinessRuleError(
            `El monto supera el saldo pendiente (₡${pendiente.toString()}).`
          );
        }

        const payment = await tx.ava_pago.create({
          data: { ...pago, pag_monto, pag_estado: "A", alqm_id },
        });

        const newMontopagado = currentMonthlyRent.alqm_montopagado + pag_monto;
        const newEstado =
          newMontopagado >= currentMonthlyRent.alqm_montototal
            ? "P"
            : currentMonthlyRent.alqm_estado;

        const updatedMonthlyRent = await tx.ava_alquilermensual.update({
          where: { alqm_id },
          data: {
            alqm_montopagado: newMontopagado,
            alqm_estado: newEstado,
          },
        });

        return { payment, updatedMonthlyRent };
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
