import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";
import { parseBody } from "@/lib/validation";
import { finishRentSchema } from "@/lib/schemas/apiSchemas";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ alqId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const { alqId } = await context.params;
      const parsed = await parseBody(request, finishRentSchema);
      if (!parsed.success) return parsed.response;
      const data = parsed.data;

      const rental = await prisma.ava_alquiler.findUnique({
        where: { alq_id: BigInt(alqId) },
        include: { ava_deposito: true, ava_alquilermensual: true },
      });

      if (!rental) {
        return NextResponse.json(
          { success: false, error: "Alquiler no encontrado" },
          { status: 404 }
        );
      }

      if (rental.alq_estado !== "A") {
        return NextResponse.json(
          { success: false, error: "Solo se puede finalizar un alquiler activo." },
          { status: 400 }
        );
      }

      // ava_deposito es un arreglo; un alquiler puede no tener depósito
      const depoId = rental.ava_deposito[0]?.depo_id;

      const allPaymentsCompleted = rental.ava_alquilermensual.every(
        (rent) => rent.alqm_estado === "P" || rent.alqm_estado === "R"
      );

      if (!allPaymentsCompleted) {
        return NextResponse.json(
          {
            success: false,
            error: "No se puede finalizar, hay pagos pendientes.",
          },
          { status: 400 }
        );
      }

      const result = await prisma.$transaction(async (tx) => {
        await tx.ava_alquiler.update({
          where: { alq_id: BigInt(alqId) },
          data: { alq_estado: "F" },
        });

        if (depoId) {
          await tx.ava_deposito.update({
            where: { depo_id: depoId },
            data: {
              ...data,
              depo_fechadevolucion: data.depo_fechadevolucion ?? null,
            },
          });
        }

        return { success: true, message: "Alquiler finalizado correctamente" };
      });

      return NextResponse.json(
        { success: true, data: result },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Error al finalizar el alquiler:", error);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
