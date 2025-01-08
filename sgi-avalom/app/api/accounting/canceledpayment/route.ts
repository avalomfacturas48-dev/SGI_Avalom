import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function POST(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const data = await req.json();

      const payment = await prisma.ava_anulacionpago.create({
        data: {
          anp_montofinal: data.anp_montofinal,
          anp_montooriginal: data.anp_montooriginal,
          anp_descripcion: data.anp_descripcion,
          anp_motivo: data.anp_motivo,
          anp_fechaanulacion: data.anp_fechaanulacion,
          pag_id: data.pag_id,
          usu_id: data.usu_id,
        },
      });

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(payment) },
        { status: 201 }
      );
    } catch (error) {
      console.error("Error al crear la anulación de pago: ", error);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
