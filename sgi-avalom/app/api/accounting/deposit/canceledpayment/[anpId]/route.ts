import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ anpId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const { anpId } = await context.params;

      const annulment = await prisma.ava_anulacionpago.findUnique({
        where: { anp_id: BigInt(anpId) },
      });

      if (!annulment) {
        return NextResponse.json(
          { success: false, error: "Anulación no encontrada" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(annulment) },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error al obtener la anulación: ", error);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ anpId: string }> }
) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const { anpId } = await context.params;
      const data = await req.json();

      const updatedAnnulment = await prisma.ava_anulacionpago.update({
        where: { anp_id: BigInt(anpId) },
        data: {
          anp_motivo: data.anp_motivo,
          anp_descripcion: data.anp_descripcion,
          anp_montooriginal: BigInt(data.anp_montooriginal),
          anp_montofinal: BigInt(data.anp_montofinal),
        },
      });

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(updatedAnnulment) },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error al actualizar la anulación: ", error);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
