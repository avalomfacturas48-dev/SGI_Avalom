import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ angId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const params = await context.params;

      const anulacion = await prisma.ava_anulaciongasto.findUnique({
        where: { ang_id: BigInt(params.angId) },
        include: {
          ava_gasto: {
            include: {
              ava_edificio: true,
              ava_propiedad: true,
              ava_servicio: true,
              ava_usuario: true,
            },
          },
          ava_usuario: true,
        },
      });

      if (!anulacion) {
        return NextResponse.json(
          { success: false, error: "Anulación no encontrada" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(anulacion) },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error al obtener la anulación:", error);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
