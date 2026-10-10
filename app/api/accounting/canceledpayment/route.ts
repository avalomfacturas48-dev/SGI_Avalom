import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authenticate } from "@/lib/auth";
import { stringifyWithBigInt } from "@/utils/converters";
import type { UserWithToken } from "@/lib/types";
import { parseBody } from "@/lib/validation";
import { paymentCancelSchema } from "@/lib/schemas/apiSchemas";

export async function POST(request: NextRequest) {
  return authenticate(async (req: NextRequest, res: NextResponse) => {
    try {
      const parsed = await parseBody(req, paymentCancelSchema);
      if (!parsed.success) return parsed.response;
      const { anp_descripcion, anp_motivo, anp_fechaanulacion, pag_id } =
        parsed.data;
      // Quien anula es el usuario de la sesión, no lo que mande el cliente
      const usu_id = (req.user as UserWithToken).userId;

      const pago = await prisma.ava_pago.findUnique({
        where: { pag_id: pag_id },
        include: { ava_alquilermensual: true },
      });

      if (!pago || !pago.ava_alquilermensual) {
        return NextResponse.json(
          { success: false, error: "El pago o el alquiler mensual relacionado no existe." },
          { status: 404 }
        );
      }

      if (pago.pag_estado === "D") {
        return NextResponse.json(
          { success: false, error: "Este pago ya fue anulado" },
          { status: 400 }
        );
      }

      const alquilerMensualId = pago.ava_alquilermensual.alqm_id;
      const montoAnulado = pago.pag_monto;

      const [anulacionPago, updatedAlquilerMensual, montoAntes, montoDespues] =
        await prisma.$transaction(async (tx) => {
          const alquilerMensualAntes = await tx.ava_alquilermensual.findUnique({
            where: { alqm_id: alquilerMensualId },
            select: {
              alqm_montopagado: true,
              alqm_montototal: true,
            },
          });

          const montoAntes =
            alquilerMensualAntes?.alqm_montopagado ?? BigInt(0);

          const anulacionPago = await tx.ava_anulacionpago.create({
            data: {
              anp_montofinal: BigInt(0),
              anp_montooriginal: BigInt(0),
              anp_descripcion,
              anp_motivo,
              anp_fechaanulacion: anp_fechaanulacion,
              pag_id: pag_id,
              usu_id: BigInt(usu_id),
            },
          });

          const alquilerMensual = await tx.ava_alquilermensual.update({
            where: { alqm_id: alquilerMensualId },
            data: {
              alqm_montopagado: {
                decrement: montoAnulado,
              },
            },
            select: {
              alqm_montototal: true,
              alqm_montopagado: true,
            },
          });

          const montoDespues = alquilerMensual.alqm_montopagado;

          const nuevoEstado =
            montoDespues === BigInt(0)
              ? "I"
              : montoDespues < alquilerMensual.alqm_montototal
              ? "I"
              : "P";

          const updatedAlquilerMensual = await tx.ava_alquilermensual.update({
            where: { alqm_id: alquilerMensualId },
            data: { alqm_estado: nuevoEstado },
          });

          await tx.ava_pago.update({
            where: { pag_id: pag_id },
            data: { pag_estado: "D" },
          });

          const anulacionFinal = await tx.ava_anulacionpago.update({
            where: { anp_id: anulacionPago.anp_id },
            data: {
              anp_montofinal: montoDespues,
              anp_montooriginal: montoAntes,
            },
          });

          return [
            anulacionFinal,
            updatedAlquilerMensual,
            montoAntes,
            montoDespues,
          ];
        });

      return NextResponse.json(
        {
          success: true,
          data: stringifyWithBigInt({ anulacionPago, updatedAlquilerMensual }),
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
