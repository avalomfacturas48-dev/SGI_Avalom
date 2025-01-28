import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";

export async function POST(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const data = await req.json();

      const {
        anp_montofinal,
        anp_montooriginal,
        anp_descripcion,
        anp_motivo,
        anp_fechaanulacion,
        pag_id,
        usu_id,
      } = data;

      const pago = await prisma.ava_pago.findUnique({
        where: { pag_id: BigInt(pag_id) },
        include: { ava_deposito: true },
      });

      if (!pago || !pago.ava_deposito) {
        throw new Error("El pago o el deposito relacionado no existe.");
      }

      const depositoId = pago.ava_deposito.depo_id;
      const montoAnulado = pago.pag_monto;

      const [anulacionPago, updatedDeposito] = await prisma.$transaction(
        async (tx) => {
          const anulacionPago = await tx.ava_anulacionpago.create({
            data: {
              anp_montofinal: BigInt(anp_montofinal),
              anp_montooriginal: BigInt(anp_montooriginal),
              anp_descripcion,
              anp_motivo,
              anp_fechaanulacion: new Date(anp_fechaanulacion),
              pag_id: BigInt(pag_id),
              usu_id: BigInt(usu_id),
            },
          });

          const updatedDeposito = await tx.ava_deposito.update({
            where: { depo_id: depositoId },
            data: {
              depo_montoactual: {
                decrement: montoAnulado,
              },
            },
          });

          await tx.ava_pago.update({
            where: { pag_id: BigInt(pag_id) },
            data: { pag_estado: "D" },
          });

          return [anulacionPago, updatedDeposito];
        }
      );

      return NextResponse.json(
        {
          success: true,
          data: stringifyWithBigInt({ anulacionPago, updatedDeposito }),
        },
        { status: 201 }
      );
    } catch (error: any) {
      console.error("Error al crear la anulación de pago: ", error.message);
      return NextResponse.json(
        { success: false, error: "Error interno del servidor" },
        { status: 500 }
      );
    }
  })(request, new NextResponse());
}
