import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";
import { UserWithToken } from "@/lib/types/entities";

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ gastoId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const params = await context.params;
      const gastoId = BigInt(params.gastoId);
      const body = await req.json();

      if (!body.ang_motivo) {
        return NextResponse.json(
          { success: false, error: "El motivo de anulación es requerido" },
          { status: 400 }
        );
      }

      // Verificar que el gasto existe
      const existingExpense = await prisma.ava_gasto.findUnique({
        where: { gas_id: gastoId },
        include: {
          ava_anulaciongasto: true,
        },
      });

      if (!existingExpense) {
        return NextResponse.json(
          { success: false, error: "Gasto no encontrado" },
          { status: 404 }
        );
      }

      // Verificar que el gasto no esté ya anulado
      if (existingExpense.gas_estado === "D") {
        return NextResponse.json(
          { success: false, error: "El gasto ya está anulado" },
          { status: 400 }
        );
      }

      // Verificar que no tenga anulaciones previas
      if (
        existingExpense.ava_anulaciongasto &&
        existingExpense.ava_anulaciongasto.length > 0
      ) {
        return NextResponse.json(
          { success: false, error: "El gasto ya tiene una anulación registrada" },
          { status: 400 }
        );
      }

      // Obtener el usuario del token
      const currentUser = req.user as UserWithToken;
      const usu_id = currentUser?.userId ? BigInt(currentUser.userId) : null;

      if (!usu_id) {
        return NextResponse.json(
          { success: false, error: "Usuario no identificado" },
          { status: 400 }
        );
      }

      // Crear la anulación y actualizar el estado del gasto en una transacción
      const result = await prisma.$transaction(async (tx) => {
        // Crear el registro de anulación
        const anulacion = await tx.ava_anulaciongasto.create({
          data: {
            ang_motivo: body.ang_motivo,
            ang_descripcion: body.ang_descripcion || null,
            ang_montooriginal: existingExpense.gas_monto,
            ang_montofinal: body.ang_montofinal
              ? BigInt(body.ang_montofinal)
              : BigInt(0),
            ang_fechaanulacion: new Date(),
            gas_id: gastoId,
            usu_id: usu_id,
          },
        });

        // Actualizar el estado del gasto a anulado
        await tx.ava_gasto.update({
          where: { gas_id: gastoId },
          data: {
            gas_estado: "D",
          },
        });

        // Obtener el gasto actualizado con todas sus relaciones
        const updatedExpense = await tx.ava_gasto.findUnique({
          where: { gas_id: gastoId },
          include: {
            ava_edificio: true,
            ava_propiedad: true,
            ava_servicio: true,
            ava_usuario: true,
            ava_anulaciongasto: {
              include: {
                ava_usuario: true,
              },
            },
          },
        });

        return { anulacion, expense: updatedExpense };
      });

      return NextResponse.json(
        {
          success: true,
          data: stringifyWithBigInt(result.expense),
          message: "Gasto anulado correctamente",
        },
        { status: 200 }
      );
    } catch (error: any) {
      console.error("Error anulando el gasto:", error.message);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor." },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

