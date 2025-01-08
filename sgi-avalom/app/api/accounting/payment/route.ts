import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function POST(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const data = await req.json();

      const payment = await prisma.ava_pago.create({
        data: {
          pag_monto: data.pag_monto,
          pag_fechapago: new Date(data.pag_fechapago),
          pag_estado: data.pag_estado,
          pag_cuenta: data.pag_cuenta,
          pag_descripcion: data.pag_descripcion,
          alqm_id: BigInt(data.alqm_id),
        },
      });

      return NextResponse.json(
        { success: true, data: stringifyWithBigInt(payment) },
        { status: 201 }
      );
    } catch (error) {
      console.error("Error al crear el pago:", error);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
