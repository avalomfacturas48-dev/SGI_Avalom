import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function POST(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const data = await req.json();

      const {
        pag_monto,
        pag_fechapago,
        pag_estado,
        pag_cuenta,
        pag_descripcion,
        depo_id,
      } = data;

      const paymentAmount = BigInt(pag_monto);

      const result = await prisma.$transaction(async (tx) => {
        const payment = await tx.ava_pago.create({
          data: {
            pag_monto: paymentAmount,
            pag_fechapago: new Date(pag_fechapago),
            pag_estado,
            pag_cuenta,
            pag_descripcion,
            depo_id: BigInt(depo_id),
          },
        });

        const currentDeposit = await tx.ava_deposito.findUnique({
          where: { depo_id: BigInt(depo_id) },
        });

        if (!currentDeposit) {
          throw new Error("El depósito no existe.");
        }

        const newMontoActual = currentDeposit.depo_montoactual + paymentAmount;

        const updatedDeposit = await tx.ava_deposito.update({
          where: { depo_id: BigInt(depo_id) },
          data: {
            depo_montoactual: newMontoActual,
          },
        });

        return { payment, updatedDeposit };
      });

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(result) },
        { status: 201 }
      );
    } catch (error) {
      console.error("Error al procesar el pago:", error);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
